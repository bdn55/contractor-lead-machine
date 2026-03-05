// ============================================================
//  backend/src/routes/stripe.js
//  Full Stripe subscription billing integration
//  Handles: checkout, webhooks, portal, plan changes
// ============================================================

const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { authenticateToken } = require("../middleware/auth");
const db = require("../db");

// ── Plan config (mirrors your .env price IDs) ──────────────
const PLANS = {
  starter: {
    name: "Starter",
    priceId: process.env.STRIPE_PRICE_STARTER,
    leadsPerMonth: 50,
    price: 19,
  },
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRICE_PRO,
    leadsPerMonth: null, // unlimited
    price: 49,
  },
  agency: {
    name: "Agency",
    priceId: process.env.STRIPE_PRICE_AGENCY,
    leadsPerMonth: null, // unlimited
    price: 99,
  },
};

// ── GET /api/stripe/plans ─────────────────────────────────
// Returns available plans (safe for frontend)
router.get("/plans", (req, res) => {
  const safePlans = Object.entries(PLANS).map(([id, plan]) => ({
    id,
    name: plan.name,
    price: plan.price,
    leadsPerMonth: plan.leadsPerMonth,
  }));
  res.json({ plans: safePlans });
});

// ── POST /api/stripe/create-checkout-session ──────────────
// Creates a Stripe Checkout session for new subscriptions
router.post("/create-checkout-session", authenticateToken, async (req, res) => {
  const { planId } = req.body;
  const user = req.user;

  const plan = PLANS[planId];
  if (!plan) {
    return res.status(400).json({ error: "Invalid plan selected" });
  }

  try {
    // Create or retrieve Stripe customer
    let customerId = user.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id.toString() },
      });
      customerId = customer.id;

      // Save to DB
      await db.query(
        "UPDATE users SET stripe_customer_id = $1 WHERE id = $2",
        [customerId, user.id]
      );
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/billing?canceled=true`,
      subscription_data: {
        metadata: {
          userId: user.id.toString(),
          planId,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// ── POST /api/stripe/create-portal-session ────────────────
// Opens Stripe Customer Portal to manage/cancel subscription
router.post("/create-portal-session", authenticateToken, async (req, res) => {
  const user = req.user;

  if (!user.stripe_customer_id) {
    return res.status(400).json({ error: "No active subscription found" });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL}/billing`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe portal error:", err);
    res.status(500).json({ error: "Failed to open billing portal" });
  }
});

// ── GET /api/stripe/subscription ─────────────────────────
// Returns the current user's subscription status
router.get("/subscription", authenticateToken, async (req, res) => {
  const user = req.user;

  if (!user.stripe_customer_id) {
    return res.json({ subscription: null, plan: "free" });
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: "active",
      expand: ["data.default_payment_method"],
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return res.json({ subscription: null, plan: "free" });
    }

    const sub = subscriptions.data[0];
    const priceId = sub.items.data[0].price.id;

    // Match price ID back to plan
    const planEntry = Object.entries(PLANS).find(
      ([, p]) => p.priceId === priceId
    );
    const planId = planEntry ? planEntry[0] : "unknown";

    // Get payment method details
    const pm = sub.default_payment_method;
    const card = pm?.card
      ? { brand: pm.card.brand, last4: pm.card.last4, expMonth: pm.card.exp_month, expYear: pm.card.exp_year }
      : null;

    res.json({
      subscription: {
        id: sub.id,
        status: sub.status,
        currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        card,
      },
      plan: planId,
      planDetails: PLANS[planId],
    });
  } catch (err) {
    console.error("Get subscription error:", err);
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
});

// ── POST /api/stripe/change-plan ──────────────────────────
// Upgrades or downgrades an existing subscription
router.post("/change-plan", authenticateToken, async (req, res) => {
  const { newPlanId } = req.body;
  const user = req.user;

  const newPlan = PLANS[newPlanId];
  if (!newPlan) {
    return res.status(400).json({ error: "Invalid plan" });
  }

  if (!user.stripe_customer_id) {
    return res.status(400).json({ error: "No active subscription" });
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: "active",
      limit: 1,
    });

    if (!subscriptions.data.length) {
      return res.status(400).json({ error: "No active subscription found" });
    }

    const sub = subscriptions.data[0];
    const subItemId = sub.items.data[0].id;

    // Update subscription with proration
    const updated = await stripe.subscriptions.update(sub.id, {
      items: [{ id: subItemId, price: newPlan.priceId }],
      proration_behavior: "create_prorations",
      metadata: { planId: newPlanId },
    });

    // Update DB
    await db.query(
      "UPDATE users SET plan = $1 WHERE id = $2",
      [newPlanId, user.id]
    );

    res.json({ success: true, subscription: updated.id, newPlan: newPlanId });
  } catch (err) {
    console.error("Change plan error:", err);
    res.status(500).json({ error: "Failed to change plan" });
  }
});

// ── POST /api/webhooks/stripe ─────────────────────────────
// ⚠️ IMPORTANT: This route needs raw body — register BEFORE express.json()
// In your app.js: app.use('/api/webhooks/stripe', express.raw({type:'application/json'}), stripeWebhook)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`Stripe webhook received: ${event.type}`);

    try {
      switch (event.type) {

        // ── New subscription created ────────────────────────
        case "checkout.session.completed": {
          const session = event.data.object;
          if (session.mode !== "subscription") break;

          const userId = session.metadata?.userId;
          const subId = session.subscription;

          if (!userId) break;

          // Retrieve subscription to get plan
          const sub = await stripe.subscriptions.retrieve(subId);
          const priceId = sub.items.data[0].price.id;
          const planEntry = Object.entries(PLANS).find(([, p]) => p.priceId === priceId);
          const planId = planEntry ? planEntry[0] : "starter";

          await db.query(
            `UPDATE users 
             SET plan = $1, 
                 stripe_subscription_id = $2, 
                 subscription_status = 'active',
                 leads_used_this_month = 0
             WHERE id = $3`,
            [planId, subId, userId]
          );

          console.log(`✅ Subscription activated: user ${userId} → ${planId}`);
          break;
        }

        // ── Subscription renewed / invoice paid ────────────
        case "invoice.payment_succeeded": {
          const invoice = event.data.object;
          if (invoice.billing_reason === "subscription_cycle") {
            // Reset monthly lead count on renewal
            const sub = await stripe.subscriptions.retrieve(invoice.subscription);
            const userId = sub.metadata?.userId;

            if (userId) {
              await db.query(
                "UPDATE users SET leads_used_this_month = 0 WHERE id = $1",
                [userId]
              );
              console.log(`🔄 Lead count reset for user ${userId}`);
            }
          }
          break;
        }

        // ── Payment failed ──────────────────────────────────
        case "invoice.payment_failed": {
          const invoice = event.data.object;
          const sub = await stripe.subscriptions.retrieve(invoice.subscription);
          const userId = sub.metadata?.userId;

          if (userId) {
            await db.query(
              "UPDATE users SET subscription_status = 'past_due' WHERE id = $1",
              [userId]
            );
            console.log(`⚠️ Payment failed for user ${userId}`);
            // TODO: send email notification via SendGrid
          }
          break;
        }

        // ── Subscription cancelled ──────────────────────────
        case "customer.subscription.deleted": {
          const sub = event.data.object;
          const userId = sub.metadata?.userId;

          if (userId) {
            await db.query(
              `UPDATE users 
               SET plan = 'free', 
                   subscription_status = 'canceled',
                   stripe_subscription_id = NULL
               WHERE id = $1`,
              [userId]
            );
            console.log(`❌ Subscription canceled for user ${userId}`);
          }
          break;
        }

        // ── Plan updated (upgrade/downgrade) ───────────────
        case "customer.subscription.updated": {
          const sub = event.data.object;
          const userId = sub.metadata?.userId;

          if (userId) {
            const priceId = sub.items.data[0].price.id;
            const planEntry = Object.entries(PLANS).find(([, p]) => p.priceId === priceId);
            const planId = planEntry ? planEntry[0] : null;

            if (planId) {
              await db.query(
                "UPDATE users SET plan = $1, subscription_status = $2 WHERE id = $3",
                [planId, sub.status, userId]
              );
              console.log(`🔄 Plan updated: user ${userId} → ${planId}`);
            }
          }
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (err) {
      console.error(`Error handling webhook ${event.type}:`, err);
      // Still return 200 so Stripe doesn't retry
    }

    res.json({ received: true });
  }
);

module.exports = router;


// ============================================================
//  backend/src/middleware/auth.js
//  JWT authentication middleware
// ============================================================

/*
const jwt = require("jsonwebtoken");
const db = require("../db");

async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await db.query(
      "SELECT id, email, name, plan, stripe_customer_id, stripe_subscription_id, subscription_status, leads_used_this_month, role FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (!result.rows.length) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}

module.exports = { authenticateToken };
*/


// ============================================================
//  backend/src/db/schema.sql
//  PostgreSQL schema — run once on fresh database
// ============================================================

/*
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id                      SERIAL PRIMARY KEY,
  email                   VARCHAR(255) UNIQUE NOT NULL,
  password_hash           VARCHAR(255) NOT NULL,
  name                    VARCHAR(255),
  role                    VARCHAR(50) DEFAULT 'contractor',
  plan                    VARCHAR(50) DEFAULT 'free',
  subscription_status     VARCHAR(50) DEFAULT 'inactive',
  stripe_customer_id      VARCHAR(255),
  stripe_subscription_id  VARCHAR(255),
  leads_used_this_month   INTEGER DEFAULT 0,
  leads_limit             INTEGER DEFAULT 50,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name          VARCHAR(255),
  phone         VARCHAR(50),
  email         VARCHAR(255),
  job           TEXT,
  location      VARCHAR(255),
  source        VARCHAR(100),
  status        VARCHAR(50) DEFAULT 'new',
  est_value     DECIMAL(10,2),
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Follow-ups table
CREATE TABLE IF NOT EXISTS followups (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
  lead_id         INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  message         TEXT,
  scheduled_for   TIMESTAMPTZ,
  sent_at         TIMESTAMPTZ,
  status          VARCHAR(50) DEFAULT 'pending',
  delay_days      INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Estimates table
CREATE TABLE IF NOT EXISTS estimates (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
  lead_id         INTEGER REFERENCES leads(id),
  job_description TEXT,
  estimate_json   JSONB,
  total_amount    DECIMAL(10,2),
  pdf_url         VARCHAR(500),
  status          VARCHAR(50) DEFAULT 'draft',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_followups_scheduled ON followups(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_users_stripe ON users(stripe_customer_id);
*/
