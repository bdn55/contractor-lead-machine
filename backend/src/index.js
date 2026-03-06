require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Stripe webhook needs raw body - must come BEFORE express.json()
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// Regular JSON parsing for all other routes
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
try {
  const stripeRoutes = require('./routes/stripe-backend');
  app.use('/api', stripeRoutes);
} catch (err) {
  console.log('Stripe routes not loaded:', err.message);
}

try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
} catch (err) {
  console.log('Auth routes not loaded:', err.message);
}

try {
  const leadsRoutes = require('./routes/leads');
  app.use('/api/leads', leadsRoutes);
} catch (err) {
  console.log('Leads routes not loaded:', err.message);
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
