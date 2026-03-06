import { useState, useEffect, useRef } from "react";

// ── Palette & theme ──────────────────────────────────────────────────────────
const T = {
  bg: "#0B0F1A",
  surface: "#131929",
  card: "#1A2236",
  border: "#1E2D45",
  accent: "#F59E0B",
  accentDim: "#78350F",
  blue: "#3B82F6",
  green: "#10B981",
  red: "#EF4444",
  purple: "#8B5CF6",
  text: "#F1F5F9",
  muted: "#64748B",
  soft: "#94A3B8",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${T.bg};color:${T.text};font-family:'DM Sans',sans-serif;overflow-x:hidden}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-track{background:${T.surface}}
  ::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px}
  .syne{font-family:'Syne',sans-serif}
  .fade-in{animation:fadeIn .35s ease forwards}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .pulse-dot{animation:pulseDot 1.8s ease-in-out infinite}
  @keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.85)}}
  .shimmer{background:linear-gradient(90deg,${T.card} 25%,${T.border} 50%,${T.card} 75%);background-size:200% 100%;animation:shimmer 1.4s infinite}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  textarea:focus,input:focus,select:focus{outline:2px solid ${T.accent}!important;outline-offset:0}
  .btn-primary{background:${T.accent};color:#000;font-weight:600;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;font-size:14px}
  .btn-primary:hover{background:#FBBF24;transform:translateY(-1px);box-shadow:0 4px 20px #F59E0B44}
  .btn-ghost{background:transparent;color:${T.soft};border:1px solid ${T.border};padding:9px 18px;border-radius:8px;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;font-size:14px}
  .btn-ghost:hover{border-color:${T.accent};color:${T.accent}}
  .btn-blue{background:${T.blue};color:#fff;font-weight:600;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;font-size:14px}
  .btn-blue:hover{background:#2563EB;transform:translateY(-1px)}
  .card{background:${T.card};border:1px solid ${T.border};border-radius:12px;padding:20px}
  .input{background:${T.surface};border:1px solid ${T.border};color:${T.text};padding:10px 14px;border-radius:8px;width:100%;font-family:'DM Sans',sans-serif;font-size:14px}
  .tag{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
  .modal-backdrop{position:fixed;inset:0;background:#00000088;backdrop-filter:blur(4px);z-index:100;display:flex;align-items:center;justify-content:center}
  .modal{background:${T.card};border:1px solid ${T.border};border-radius:16px;padding:28px;max-width:620px;width:90%;max-height:88vh;overflow-y:auto}
  .stat-card{background:${T.card};border:1px solid ${T.border};border-radius:12px;padding:20px;position:relative;overflow:hidden}
  .stat-card::before{content:'';position:absolute;top:0;right:0;width:80px;height:80px;border-radius:0 0 0 80px;opacity:.08}
  .pipeline-col{background:${T.surface};border:1px solid ${T.border};border-radius:12px;padding:14px;min-height:300px;flex:1;min-width:160px}
  .lead-card-mini{background:${T.card};border:1px solid ${T.border};border-radius:8px;padding:12px;margin-bottom:8px;cursor:pointer;transition:all .2s}
  .lead-card-mini:hover{border-color:${T.accent};transform:translateX(2px)}
  .nav-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:8px;cursor:pointer;transition:all .15s;color:${T.soft};font-size:14px;font-weight:500;border:none;background:none;width:100%;text-align:left}
  .nav-item:hover{background:${T.border};color:${T.text}}
  .nav-item.active{background:#F59E0B18;color:${T.accent};border-left:2px solid ${T.accent}}
  .badge{background:#F59E0B22;color:${T.accent};font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px;margin-left:auto}
  .progress-bar{height:6px;background:${T.border};border-radius:3px;overflow:hidden}
  .progress-fill{height:100%;border-radius:3px;transition:width .5s ease}
`;

// ── Seed data ─────────────────────────────────────────────────────────────────
const SEED_LEADS = [
  { id: 1, name: "Robert Martinez", phone: "(713) 555-0182", email: "rmartinez@gmail.com", job: "Replace 30ft wood privacy fence, back yard", location: "Houston, TX 77084", source: "Craigslist", status: "new", date: "2025-03-04", value: 3200 },
  { id: 2, name: "Sandra Lee", phone: "(832) 555-0341", email: "", job: "Install automatic driveway gate, 16ft steel double swing", location: "Katy, TX 77449", source: "Facebook", status: "contacted", date: "2025-03-03", value: 5800 },
  { id: 3, name: "James Thompson", phone: "(281) 555-0927", email: "jthompson@yahoo.com", job: "Full roof replacement after hail damage, 2400sqft", location: "Sugar Land, TX 77479", source: "Google", status: "quote_sent", date: "2025-03-02", value: 14500 },
  { id: 4, name: "Maria Garcia", phone: "(713) 555-0654", email: "mariaG@hotmail.com", job: "Backyard landscaping redesign, sod + irrigation", location: "Pearland, TX 77584", source: "Craigslist", status: "won", date: "2025-02-28", value: 6800 },
  { id: 5, name: "David Kim", phone: "(281) 555-0213", email: "", job: "Emergency plumbing - burst pipe under slab", location: "Houston, TX 77042", source: "Google", status: "new", date: "2025-03-04", value: 2100 },
  { id: 6, name: "Ashley Brown", phone: "(832) 555-0788", email: "abrown@gmail.com", job: "Install 6ft chain link fence, 150ft perimeter", location: "Cypress, TX 77429", source: "Facebook", status: "new", date: "2025-03-04", value: 2800 },
  { id: 7, name: "Michael Davis", phone: "(713) 555-0439", email: "mdavis@outlook.com", job: "Kitchen remodel - cabinets, countertops, backsplash", location: "The Woodlands, TX 77380", source: "Google", status: "contacted", date: "2025-03-01", value: 18000 },
  { id: 8, name: "Jennifer Wilson", phone: "(281) 555-0562", email: "", job: "Concrete driveway replacement, approx 800sqft", location: "Humble, TX 77338", source: "Craigslist", status: "lost", date: "2025-02-25", value: 4200 },
  { id: 9, name: "Carlos Ramirez", phone: "(832) 555-0117", email: "c.ramirez@gmail.com", job: "Sprinkler system installation, 1/4 acre yard", location: "Missouri City, TX 77459", source: "Google", status: "quote_sent", date: "2025-03-03", value: 3500 },
  { id: 10, name: "Patricia Moore", phone: "(713) 555-0885", email: "pmoore@yahoo.com", job: "Replace HVAC system, 3-ton unit, full install", location: "Friendswood, TX 77546", source: "Facebook", status: "contacted", date: "2025-03-02", value: 7200 },
];

const FOLLOWUPS = [
  { id: 1, leadId: 2, leadName: "Sandra Lee", message: "Follow-up on driveway gate quote", scheduledDate: "2025-03-07", status: "pending", delay: "3 days" },
  { id: 2, leadId: 3, leadName: "James Thompson", message: "Check in on roof replacement decision", scheduledDate: "2025-03-09", status: "pending", delay: "7 days" },
  { id: 3, leadId: 7, leadName: "Michael Davis", message: "Kitchen remodel follow-up", scheduledDate: "2025-03-05", status: "pending", delay: "1 day" },
];

const PLANS = [
  { id: "starter", name: "Starter", price: 19, leads: 50, features: ["50 leads/month", "AI Estimates", "AI Messages", "Basic CRM", "PDF Quotes"] },
  { id: "pro", name: "Pro", price: 49, leads: "Unlimited", features: ["Unlimited leads", "All Starter features", "Auto Follow-Up", "Priority Support", "Territory Filter"] },
  { id: "agency", name: "Agency", price: 99, leads: "Unlimited", features: ["Everything in Pro", "Multi-contractor accounts", "Admin panel", "White-label options", "API access"] },
];

const STATUS_CONFIG = {
  new: { label: "New", color: T.blue, bg: "#3B82F611" },
  contacted: { label: "Contacted", color: T.purple, bg: "#8B5CF611" },
  quote_sent: { label: "Quote Sent", color: T.accent, bg: "#F59E0B11" },
  won: { label: "Won", color: T.green, bg: "#10B98111" },
  lost: { label: "Lost", color: T.red, bg: "#EF444411" },
};

const SOURCE_ICONS = { Google: "🔍", Craigslist: "📋", Facebook: "👥", Local: "📍" };

// ── Helpers ──────────────────────────────────────────────────────────────────
function StatusTag({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  return <span className="tag" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>;
}

function Icon({ name, size = 18, color = "currentColor" }) {
  const icons = {
    dashboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    leads: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    estimate: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    messages: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    pipeline: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    calendar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    calc: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/></svg>,
    billing: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    admin: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    map: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
    phone: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6 6l.54-.54a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.22 16.92z"/></svg>,
    mail: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    star: <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    refresh: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
    dollar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    zap: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    copy: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
    eye: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    filter: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    trending: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  };
  return icons[name] || null;
}

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("demo@contractor.com");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin({ email, name: "Mike Johnson", role: "contractor", plan: "pro" }); }, 900);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: `radial-gradient(ellipse at 30% 40%, #1A2E1A 0%, ${T.bg} 60%)` }}>
      <div className="fade-in" style={{ width: 420, padding: 40, background: T.card, border: `1px solid ${T.border}`, borderRadius: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, background: T.accent, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="zap" size={20} color="#000" />
            </div>
            <span className="syne" style={{ fontSize: 22, fontWeight: 800, color: T.text }}>Contractor<span style={{ color: T.accent }}>Lead</span></span>
          </div>
          <p style={{ color: T.muted, fontSize: 14 }}>Sign in to your account</p>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", color: T.soft, fontSize: 12, marginBottom: 6, fontWeight: 600 }}>EMAIL</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", color: T.soft, fontSize: 12, marginBottom: 6, fontWeight: 600 }}>PASSWORD</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={handleLogin} style={{ width: "100%", padding: "12px 20px", fontSize: 15 }}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p style={{ textAlign: "center", color: T.muted, fontSize: 12, marginTop: 20 }}>
          Demo credentials pre-filled · <span style={{ color: T.accent, cursor: "pointer" }}>Forgot password?</span>
        </p>
      </div>
    </div>
  );
}

// ── Dashboard Overview ────────────────────────────────────────────────────────
function DashboardView({ leads, setView }) {
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === "new").length,
    revenue: leads.filter(l => l.status === "won").reduce((a, b) => a + b.value, 0),
    pipeline: leads.filter(l => ["contacted", "quote_sent"].includes(l.status)).reduce((a, b) => a + b.value, 0),
  };

  const recent = leads.slice(0, 5);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="syne" style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Good morning, Mike 👋</h1>
        <p style={{ color: T.muted, fontSize: 14 }}>Here's what's happening with your leads today.</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Leads", value: stats.total, icon: "leads", color: T.blue, change: "+12%" },
          { label: "New Today", value: stats.new, icon: "zap", color: T.accent, change: "+3" },
          { label: "Pipeline Value", value: `$${(stats.pipeline / 1000).toFixed(1)}k`, icon: "trending", color: T.purple, change: "+8%" },
          { label: "Won Revenue", value: `$${(stats.revenue / 1000).toFixed(1)}k`, icon: "dollar", color: T.green, change: "+22%" },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ "--accent": s.color }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ color: T.muted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}>{s.label}</p>
                <p className="syne" style={{ fontSize: 28, fontWeight: 800, color: T.text }}>{s.value}</p>
                <p style={{ color: T.green, fontSize: 12, marginTop: 4 }}>↑ {s.change} this week</p>
              </div>
              <div style={{ background: s.color + "22", padding: 10, borderRadius: 10 }}>
                <Icon name={s.icon} color={s.color} size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Recent Leads */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h3 className="syne" style={{ fontWeight: 700, fontSize: 16 }}>Recent Leads</h3>
            <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setView("leads")}>View all →</button>
          </div>
          {recent.map(lead => (
            <div key={lead.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{lead.name}</p>
                <p style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>{lead.job.slice(0, 38)}...</p>
              </div>
              <div style={{ textAlign: "right", marginLeft: 12 }}>
                <StatusTag status={lead.status} />
                <p style={{ color: T.accent, fontSize: 12, marginTop: 4 }}>${lead.value.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions + Pipeline Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <h3 className="syne" style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Quick Actions</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { icon: "search", label: "Find Leads", view: "leads", color: T.blue },
                { icon: "estimate", label: "New Estimate", view: "estimate", color: T.accent },
                { icon: "messages", label: "Message AI", view: "messages", color: T.purple },
                { icon: "calc", label: "Profit Calc", view: "calculator", color: T.green },
              ].map((a, i) => (
                <button key={i} onClick={() => setView(a.view)}
                  style={{ background: a.color + "11", border: `1px solid ${a.color}33`, borderRadius: 10, padding: "14px 10px", cursor: "pointer", textAlign: "center", transition: "all .2s", color: T.text }}
                  onMouseEnter={e => e.currentTarget.style.background = a.color + "22"}
                  onMouseLeave={e => e.currentTarget.style.background = a.color + "11"}
                >
                  <Icon name={a.icon} color={a.color} size={22} />
                  <p style={{ fontSize: 12, fontWeight: 600, marginTop: 6, color: a.color }}>{a.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="syne" style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Pipeline Snapshot</h3>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const count = leads.filter(l => l.status === key).length;
              const pct = Math.round((count / leads.length) * 100);
              return (
                <div key={key} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: T.soft }}>{cfg.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: cfg.color }}>{count}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: cfg.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Leads View ────────────────────────────────────────────────────────────────
function LeadsView({ leads, setLeads }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [radius, setRadius] = useState(25);
  const [selected, setSelected] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [newLeads, setNewLeads] = useState([]);

  const filtered = leads.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.job.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    const matchSource = sourceFilter === "all" || l.source === sourceFilter;
    return matchSearch && matchStatus && matchSource;
  });

  const scanForLeads = () => {
    setScanning(true);
    setTimeout(() => {
      const mock = [
        { id: Date.now(), name: "Tom Henderson", phone: "(832) 555-0299", email: "", job: "Need fence post repair, 4 posts down", location: "Katy, TX 77494", source: "Craigslist", status: "new", date: "2025-03-05", value: 800 },
        { id: Date.now() + 1, name: "Lisa Park", phone: "(713) 555-0411", email: "lpark@gmail.com", job: "Bathroom remodel, full gut job", location: "Houston, TX 77008", source: "Facebook", status: "new", date: "2025-03-05", value: 12000 },
      ];
      setNewLeads(mock);
      setLeads(prev => [...mock, ...prev]);
      setScanning(false);
    }, 2800);
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 className="syne" style={{ fontSize: 24, fontWeight: 800 }}>Lead Finder</h1>
          <p style={{ color: T.muted, fontSize: 14 }}>Automatically gathered leads from public sources</p>
        </div>
        <button className="btn-primary" onClick={scanForLeads} disabled={scanning}>
          {scanning ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="pulse-dot" style={{ width: 8, height: 8, background: "#000", borderRadius: "50%", display: "inline-block" }} />
              Scanning...
            </span>
          ) : (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon name="refresh" size={15} color="#000" /> Find New Leads</span>
          )}
        </button>
      </div>

      {scanning && (
        <div className="card" style={{ marginBottom: 20, background: "#F59E0B08", border: `1px solid ${T.accent}44` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="pulse-dot" style={{ width: 10, height: 10, background: T.accent, borderRadius: "50%" }} />
            <div>
              <p style={{ fontWeight: 600, color: T.accent }}>Scanning for new leads...</p>
              <p style={{ color: T.muted, fontSize: 13 }}>Checking Google Maps · Craigslist · Facebook Marketplace · Local Classifieds</p>
            </div>
          </div>
        </div>
      )}

      {newLeads.length > 0 && !scanning && (
        <div className="card" style={{ marginBottom: 20, background: "#10B98108", border: `1px solid ${T.green}44` }}>
          <p style={{ color: T.green, fontWeight: 600 }}>✓ Found {newLeads.length} new leads in your area!</p>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Icon name="search" size={15} color={T.muted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input className="input" placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>
          <select className="input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 140 }}>
            <option value="all">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select className="input" value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} style={{ width: 140 }}>
            <option value="all">All Sources</option>
            <option>Google</option><option>Craigslist</option><option>Facebook</option>
          </select>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: T.soft, fontSize: 13 }}>
            <Icon name="map" size={15} color={T.muted} />
            <span>Radius:</span>
            <input type="range" min="5" max="100" value={radius} onChange={e => setRadius(e.target.value)} style={{ width: 80, accentColor: T.accent }} />
            <span style={{ color: T.accent, fontWeight: 600, width: 50 }}>{radius} mi</span>
          </div>
        </div>
      </div>

      {/* Lead Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: T.surface }}>
              {["Lead", "Contact", "Job Description", "Source", "Value", "Status", ""].map((h, i) => (
                <th key={i} style={{ padding: "12px 16px", textAlign: "left", color: T.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", borderBottom: `1px solid ${T.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(lead => (
              <tr key={lead.id} style={{ borderBottom: `1px solid ${T.border}`, cursor: "pointer", transition: "background .15s" }}
                onMouseEnter={e => e.currentTarget.style.background = T.surface}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                onClick={() => setSelected(lead)}
              >
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{lead.name}</div>
                  <div style={{ color: T.muted, fontSize: 12 }}>{lead.location}</div>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: T.soft }}>
                    <Icon name="phone" size={12} color={T.muted} /> {lead.phone}
                  </div>
                  {lead.email && <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.muted, marginTop: 2 }}>
                    <Icon name="mail" size={12} color={T.muted} /> {lead.email}
                  </div>}
                </td>
                <td style={{ padding: "14px 16px", maxWidth: 240 }}>
                  <p style={{ fontSize: 13, color: T.soft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lead.job}</p>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ fontSize: 14 }}>{SOURCE_ICONS[lead.source] || "📍"}</span>
                  <span style={{ color: T.muted, fontSize: 12, marginLeft: 6 }}>{lead.source}</span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ color: T.accent, fontWeight: 700 }}>${lead.value.toLocaleString()}</span>
                </td>
                <td style={{ padding: "14px 16px" }}><StatusTag status={lead.status} /></td>
                <td style={{ padding: "14px 16px" }}>
                  <button className="btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }} onClick={e => { e.stopPropagation(); setSelected(lead); }}>
                    <Icon name="eye" size={13} color={T.soft} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 48, color: T.muted }}>
            <Icon name="search" size={32} color={T.border} />
            <p style={{ marginTop: 12 }}>No leads found matching your filters</p>
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal fade-in" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h2 className="syne" style={{ fontSize: 22, fontWeight: 800 }}>{selected.name}</h2>
                <p style={{ color: T.muted, fontSize: 14 }}>{selected.location}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 8, cursor: "pointer", color: T.soft }}><Icon name="x" size={18} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              {[
                { label: "Phone", value: selected.phone, icon: "phone" },
                { label: "Email", value: selected.email || "Not provided", icon: "mail" },
                { label: "Source", value: selected.source, icon: "search" },
                { label: "Date Added", value: selected.date, icon: "calendar" },
                { label: "Est. Value", value: `$${selected.value.toLocaleString()}`, icon: "dollar" },
                { label: "Status", value: <StatusTag status={selected.status} />, icon: "zap" },
              ].map((f, i) => (
                <div key={i} style={{ background: T.surface, padding: 14, borderRadius: 8, border: `1px solid ${T.border}` }}>
                  <p style={{ color: T.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>{f.label}</p>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{f.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: T.surface, padding: 14, borderRadius: 8, border: `1px solid ${T.border}`, marginBottom: 20 }}>
              <p style={{ color: T.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Job Description</p>
              <p style={{ fontSize: 14, lineHeight: 1.6 }}>{selected.job}</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <select className="input" defaultValue={selected.status}
                onChange={e => { setLeads(prev => prev.map(l => l.id === selected.id ? { ...l, status: e.target.value } : l)); setSelected(s => ({ ...s, status: e.target.value })); }}
                style={{ flex: 1 }}
              >
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <button className="btn-primary">Generate Estimate</button>
              <button className="btn-blue">Send Message</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── AI Estimate Generator ─────────────────────────────────────────────────────
function EstimateView() {
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [error, setError] = useState("");
  const [contractorName] = useState("Mike Johnson Contracting");

  const generateEstimate = async () => {
    if (!jobDesc.trim()) return;
    setLoading(true);
    setEstimate(null);
    setError("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a professional contractor estimating tool. Generate a detailed job estimate for: "${jobDesc}". 

Respond ONLY with a valid JSON object (no markdown, no backticks) with this exact structure:
{
  "jobTitle": "short job title",
  "scope": "2-3 sentence description of work scope",
  "materialCost": 1200,
  "laborCost": 800,
  "overhead": 200,
  "totalCost": 2200,
  "timeline": "3-5 days",
  "warranty": "1 year labor warranty",
  "lineItems": [
    {"item": "Material description", "qty": "1 unit", "cost": 500},
    {"item": "Labor - installation", "qty": "8 hrs", "cost": 640},
    {"item": "Permits & misc", "qty": "1", "cost": 150}
  ],
  "notes": "Any important notes about the estimate"
}`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      setEstimate(JSON.parse(clean));
    } catch (e) {
      // fallback demo estimate
      setEstimate({
        jobTitle: "Professional Installation Estimate",
        scope: "Complete professional installation per specifications. All work performed to code with quality materials and experienced crew.",
        materialCost: 2400, laborCost: 1600, overhead: 400, totalCost: 4400,
        timeline: "2-3 days",
        warranty: "2 year labor warranty",
        lineItems: [
          { item: "Materials & Hardware", qty: "1 lot", cost: 2400 },
          { item: "Labor - Installation", qty: "16 hrs", cost: 1280 },
          { item: "Equipment & Tools", qty: "1 day", cost: 200 },
          { item: "Permits & Disposal", qty: "1", cost: 320 },
        ],
        notes: "Price valid for 30 days. 50% deposit required to schedule."
      });
    }
    setLoading(false);
  };

  const examples = [
    "Install 18ft steel driveway gate with automatic opener",
    "Replace 200ft wood privacy fence, 6ft tall",
    "Full roof replacement, 2400sqft, architectural shingles",
    "Backyard landscaping, sod + sprinkler system, 3000sqft",
  ];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="syne" style={{ fontSize: 24, fontWeight: 800 }}>AI Estimate Generator</h1>
        <p style={{ color: T.muted, fontSize: 14 }}>Describe any job and get a professional estimate instantly</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: estimate ? "1fr 1.4fr" : "1fr", gap: 24, maxWidth: estimate ? "100%" : 700, margin: estimate ? "0" : "0 auto" }}>
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <label style={{ display: "block", color: T.soft, fontSize: 12, fontWeight: 600, marginBottom: 10, textTransform: "uppercase" }}>Job Description</label>
            <textarea className="input" rows={5} placeholder="Describe the job in detail. e.g., Install 18 foot steel driveway gate with automatic opener and keypad entry..." value={jobDesc} onChange={e => setJobDesc(e.target.value)} style={{ resize: "vertical" }} />
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              {examples.map((ex, i) => (
                <button key={i} onClick={() => setJobDesc(ex)} className="btn-ghost" style={{ fontSize: 11, padding: "4px 10px" }}>{ex.slice(0, 30)}...</button>
              ))}
            </div>
          </div>
          <button className="btn-primary" onClick={generateEstimate} disabled={loading || !jobDesc.trim()} style={{ width: "100%", padding: "13px 20px", fontSize: 15 }}>
            {loading ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><span className="pulse-dot" style={{ width: 8, height: 8, background: "#000", borderRadius: "50%", display: "inline-block" }} />Generating Estimate...</span> : "⚡ Generate AI Estimate"}
          </button>
        </div>

        {estimate && (
          <div className="fade-in">
            {/* Estimate Card */}
            <div style={{ background: "#fff", color: "#1a1a2e", borderRadius: 14, padding: 28, fontFamily: "'DM Sans', sans-serif" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, borderBottom: "2px solid #F59E0B", paddingBottom: 18 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#0B0F1A" }}>{contractorName}</h2>
                  <p style={{ color: "#64748B", fontSize: 12 }}>Licensed & Insured · Houston Metro Area</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700 }}>ESTIMATE #</p>
                  <p style={{ fontWeight: 800, fontSize: 16, color: "#F59E0B" }}>EST-{Date.now().toString().slice(-5)}</p>
                  <p style={{ fontSize: 11, color: "#94A3B8" }}>{new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: 6, fontSize: 15 }}>{estimate.jobTitle}</h3>
              <p style={{ color: "#64748B", fontSize: 13, marginBottom: 18, lineHeight: 1.6 }}>{estimate.scope}</p>
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    <th style={{ padding: "8px 10px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Item</th>
                    <th style={{ padding: "8px 10px", textAlign: "center", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Qty</th>
                    <th style={{ padding: "8px 10px", textAlign: "right", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {estimate.lineItems.map((item, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "9px 10px", fontSize: 13 }}>{item.item}</td>
                      <td style={{ padding: "9px 10px", fontSize: 13, textAlign: "center", color: "#64748B" }}>{item.qty}</td>
                      <td style={{ padding: "9px 10px", fontSize: 13, textAlign: "right", fontWeight: 600 }}>${item.cost.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ background: "#0B0F1A", color: "#fff", padding: "14px 16px", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>TOTAL ESTIMATE</span>
                <span style={{ fontWeight: 800, fontSize: 22, color: "#F59E0B", fontFamily: "'Syne', sans-serif" }}>${estimate.totalCost.toLocaleString()}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, color: "#64748B" }}>
                <p>⏱ Timeline: <strong style={{ color: "#1a1a2e" }}>{estimate.timeline}</strong></p>
                <p>🛡 Warranty: <strong style={{ color: "#1a1a2e" }}>{estimate.warranty}</strong></p>
              </div>
              {estimate.notes && <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 12, fontStyle: "italic" }}>* {estimate.notes}</p>}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button className="btn-primary" style={{ flex: 1 }}><Icon name="download" size={14} color="#000" /> Download PDF</button>
              <button className="btn-blue" style={{ flex: 1 }}><Icon name="mail" size={14} color="#fff" /> Email to Client</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── AI Message Generator ──────────────────────────────────────────────────────
function MessagesView() {
  const [msgType, setMsgType] = useState("first_contact");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const msgTypes = [
    { key: "first_contact", label: "First Contact", icon: "phone" },
    { key: "followup", label: "Follow-Up", icon: "bell" },
    { key: "quote_delivery", label: "Quote Delivery", icon: "estimate" },
    { key: "closing", label: "Job Closing", icon: "check" },
  ];

  const generateMessage = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a professional contractor communication assistant. Write a ${msgType.replace(/_/g, " ")} message for a contractor.

Context: ${context || "General contracting services in Houston area"}
Message type: ${msgType}

Write a professional, warm, and personalized message. Keep it concise (3-5 sentences). Sound human and trustworthy, not salesy. Include a clear call to action. Return ONLY the message text, no labels or meta-text.`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
      setMessage(text || getFallbackMessage(msgType));
    } catch {
      setMessage(getFallbackMessage(msgType));
    }
    setLoading(false);
  };

  const getFallbackMessage = (type) => {
    const msgs = {
      first_contact: "Hi, this is Mike from Mike Johnson Contracting! I saw you're looking for help with your project and I'd love to get you a free estimate. We've been serving the Houston area for 12 years and I can usually get out to you within 24-48 hours. Would tomorrow or the day after work for a quick look? Just reply or call me at (713) 555-0100.",
      followup: "Hey, just wanted to circle back on the estimate I sent over earlier this week! I know things get busy, but I wanted to make sure you had a chance to look it over. If you have any questions or want to make adjustments to the scope, I'm happy to talk through it. Looking forward to potentially working with you!",
      quote_delivery: "Great news — I've put together a detailed estimate for your project! I've attached a full breakdown of materials, labor, and timeline so you can see exactly what's included. The price reflects quality work done right the first time. Let me know if you'd like to adjust anything or if you're ready to move forward — I can usually start within 1-2 weeks.",
      closing: "I just wanted to say thank you for choosing us for your project — it was a pleasure working with you! The job is complete and I want to make sure you're 100% satisfied. If anything comes up over the next year covered by our warranty, don't hesitate to reach out. We'd really appreciate a Google review if you're happy with the work — it helps us reach more homeowners like you!",
    };
    return msgs[type] || msgs.first_contact;
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="syne" style={{ fontSize: 24, fontWeight: 800 }}>AI Message Generator</h1>
        <p style={{ color: T.muted, fontSize: 14 }}>Generate professional messages for every stage of the sales process</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <p style={{ color: T.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>Message Type</p>
            {msgTypes.map(t => (
              <button key={t.key} onClick={() => setMsgType(t.key)}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 8, marginBottom: 6, cursor: "pointer", transition: "all .15s", background: msgType === t.key ? T.accent + "18" : "transparent", border: msgType === t.key ? `1px solid ${T.accent}44` : "1px solid transparent", color: msgType === t.key ? T.accent : T.soft, textAlign: "left", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500 }}>
                <Icon name={t.icon} size={15} color={msgType === t.key ? T.accent : T.muted} />
                {t.label}
              </button>
            ))}
          </div>
          <div className="card">
            <label style={{ display: "block", color: T.soft, fontSize: 12, fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>Context (optional)</label>
            <textarea className="input" rows={4} placeholder="e.g., Lead name is Sandra, interested in 16ft driveway gate, budget is around $5k..." value={context} onChange={e => setContext(e.target.value)} style={{ resize: "vertical", fontSize: 13 }} />
          </div>
        </div>

        <div>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <button className="btn-primary" onClick={generateMessage} disabled={loading} style={{ flex: 1, padding: "12px 20px" }}>
              {loading ? "Generating..." : "⚡ Generate Message"}
            </button>
          </div>
          {loading && (
            <div className="card">
              {[90, 75, 85, 60].map((w, i) => (
                <div key={i} className="shimmer" style={{ height: 16, borderRadius: 8, marginBottom: 10, width: `${w}%` }} />
              ))}
            </div>
          )}
          {message && !loading && (
            <div className="fade-in card" style={{ position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span className="tag" style={{ background: T.accent + "22", color: T.accent }}>
                  {msgTypes.find(t => t.key === msgType)?.label}
                </span>
                <button onClick={copyMessage} className="btn-ghost" style={{ padding: "6px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  {copied ? <><Icon name="check" size={13} color={T.green} /> Copied!</> : <><Icon name="copy" size={13} color={T.soft} /> Copy</>}
                </button>
              </div>
              <textarea className="input" rows={8} value={message} onChange={e => setMessage(e.target.value)} style={{ lineHeight: 1.7, fontSize: 14, resize: "vertical" }} />
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button className="btn-blue" style={{ flex: 1 }}><Icon name="mail" size={14} color="#fff" /> Send as Email</button>
                <button className="btn-ghost" style={{ flex: 1 }}><Icon name="phone" size={14} color={T.soft} /> Send as SMS</button>
                <button className="btn-primary" onClick={generateMessage} style={{ flex: 1 }}>Regenerate</button>
              </div>
            </div>
          )}
          {!message && !loading && (
            <div className="card" style={{ textAlign: "center", padding: 60, border: `1px dashed ${T.border}` }}>
              <Icon name="messages" size={40} color={T.border} />
              <p style={{ color: T.muted, marginTop: 12 }}>Select a message type and click Generate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Pipeline / CRM ────────────────────────────────────────────────────────────
function PipelineView({ leads, setLeads }) {
  const columns = [
    { key: "new", label: "New Leads", color: T.blue },
    { key: "contacted", label: "Contacted", color: T.purple },
    { key: "quote_sent", label: "Quote Sent", color: T.accent },
    { key: "won", label: "Won 🎉", color: T.green },
    { key: "lost", label: "Lost", color: T.red },
  ];

  const moveCard = (leadId, newStatus) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 className="syne" style={{ fontSize: 24, fontWeight: 800 }}>Pipeline Tracker</h1>
        <p style={{ color: T.muted, fontSize: 14 }}>Drag leads through your sales pipeline</p>
      </div>
      <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 16 }}>
        {columns.map(col => {
          const colLeads = leads.filter(l => l.status === col.key);
          const total = colLeads.reduce((a, b) => a + b.value, 0);
          return (
            <div key={col.key} className="pipeline-col">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: col.color }} />
                  <span className="syne" style={{ fontWeight: 700, fontSize: 13, color: T.text }}>{col.label}</span>
                </div>
                <span style={{ background: col.color + "22", color: col.color, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>{colLeads.length}</span>
              </div>
              <p style={{ color: T.muted, fontSize: 11, marginBottom: 12 }}>${total.toLocaleString()}</p>
              {colLeads.map(lead => (
                <div key={lead.id} className="lead-card-mini">
                  <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{lead.name}</p>
                  <p style={{ color: T.muted, fontSize: 11, marginBottom: 8, lineHeight: 1.4 }}>{lead.job.slice(0, 45)}...</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: T.accent, fontSize: 12, fontWeight: 700 }}>${lead.value.toLocaleString()}</span>
                    <span style={{ color: T.muted, fontSize: 11 }}>{lead.source}</span>
                  </div>
                  <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
                    {columns.filter(c => c.key !== col.key).map(c => (
                      <button key={c.key} onClick={() => moveCard(lead.id, c.key)}
                        style={{ fontSize: 9, padding: "2px 7px", background: c.color + "18", color: c.color, border: `1px solid ${c.color}33`, borderRadius: 4, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                        → {c.label.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {colLeads.length === 0 && (
                <div style={{ textAlign: "center", padding: "24px 0", color: T.muted, fontSize: 12, borderRadius: 8, border: `1px dashed ${T.border}` }}>Empty</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Follow-Up Scheduler ───────────────────────────────────────────────────────
function FollowUpView({ leads }) {
  const [followups, setFollowups] = useState(FOLLOWUPS);
  const [showAdd, setShowAdd] = useState(false);
  const [newFu, setNewFu] = useState({ leadId: "", delay: "1 day", message: "" });

  const addFollowup = () => {
    const lead = leads.find(l => l.id === parseInt(newFu.leadId));
    if (!lead) return;
    const daysMap = { "1 day": 1, "3 days": 3, "7 days": 7 };
    const d = new Date(); d.setDate(d.getDate() + daysMap[newFu.delay]);
    setFollowups(prev => [...prev, { id: Date.now(), leadId: lead.id, leadName: lead.name, message: newFu.message || `Follow-up with ${lead.name}`, scheduledDate: d.toISOString().split("T")[0], status: "pending", delay: newFu.delay }]);
    setShowAdd(false);
    setNewFu({ leadId: "", delay: "1 day", message: "" });
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 className="syne" style={{ fontSize: 24, fontWeight: 800 }}>Auto Follow-Ups</h1>
          <p style={{ color: T.muted, fontSize: 14 }}>Schedule automatic follow-up messages for leads</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}><Icon name="plus" size={15} color="#000" /> Add Follow-Up</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Scheduled", count: followups.filter(f => f.status === "pending").length, color: T.accent },
          { label: "Sent", count: 14, color: T.green },
          { label: "Response Rate", count: "68%", color: T.blue },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ textAlign: "center" }}>
            <p className="syne" style={{ fontSize: 36, fontWeight: 800, color: s.color }}>{s.count}</p>
            <p style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="syne" style={{ fontWeight: 700, marginBottom: 18 }}>Scheduled Follow-Ups</h3>
        {followups.map(fu => (
          <div key={fu.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, background: T.accent + "22", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="bell" size={18} color={T.accent} />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{fu.leadName}</p>
                <p style={{ color: T.muted, fontSize: 12 }}>{fu.message}</p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ color: T.soft, fontSize: 13 }}>📅 {fu.scheduledDate}</p>
              <span className="tag" style={{ background: T.blue + "22", color: T.blue, marginTop: 4 }}>{fu.delay}</span>
            </div>
            <button onClick={() => setFollowups(prev => prev.filter(f => f.id !== fu.id))} className="btn-ghost" style={{ padding: "6px 10px", marginLeft: 12 }}><Icon name="x" size={14} color={T.muted} /></button>
          </div>
        ))}
        {followups.length === 0 && <p style={{ color: T.muted, textAlign: "center", padding: 32 }}>No follow-ups scheduled</p>}
      </div>

      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <div className="modal fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="syne" style={{ fontWeight: 800, fontSize: 20, marginBottom: 20 }}>Schedule Follow-Up</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: T.soft, fontSize: 12, fontWeight: 600, marginBottom: 6 }}>SELECT LEAD</label>
              <select className="input" value={newFu.leadId} onChange={e => setNewFu(f => ({ ...f, leadId: e.target.value }))}>
                <option value="">Choose a lead...</option>
                {leads.map(l => <option key={l.id} value={l.id}>{l.name} - {l.job.slice(0, 40)}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: T.soft, fontSize: 12, fontWeight: 600, marginBottom: 6 }}>FOLLOW-UP DELAY</label>
              <select className="input" value={newFu.delay} onChange={e => setNewFu(f => ({ ...f, delay: e.target.value }))}>
                <option>1 day</option><option>3 days</option><option>7 days</option>
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", color: T.soft, fontSize: 12, fontWeight: 600, marginBottom: 6 }}>MESSAGE (optional)</label>
              <textarea className="input" rows={3} placeholder="Custom message..." value={newFu.message} onChange={e => setNewFu(f => ({ ...f, message: e.target.value }))} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-primary" onClick={addFollowup} style={{ flex: 1 }}>Schedule</button>
              <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Profit Calculator ─────────────────────────────────────────────────────────
function CalculatorView() {
  const [inputs, setInputs] = useState({ materials: 2000, labor: 1200, hours: 8, overhead: 400, margin: 30 });
  const totalCost = inputs.materials + inputs.labor + inputs.overhead;
  const recommended = Math.round(totalCost / (1 - inputs.margin / 100));
  const profit = recommended - totalCost;

  const Field = ({ label, key: k, prefix = "$", suffix = "" }) => (
    <div>
      <label style={{ display: "block", color: T.soft, fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>{label}</label>
      <div style={{ position: "relative" }}>
        {prefix && <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.muted }}>{prefix}</span>}
        <input className="input" type="number" value={inputs[k]} onChange={e => setInputs(i => ({ ...i, [k]: parseFloat(e.target.value) || 0 }))}
          style={{ paddingLeft: prefix ? 28 : 14, paddingRight: suffix ? 28 : 14 }} />
        {suffix && <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: T.muted }}>{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="syne" style={{ fontSize: 24, fontWeight: 800 }}>Job Profit Calculator</h1>
        <p style={{ color: T.muted, fontSize: 14 }}>Calculate your recommended price and profit margin</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 900 }}>
        <div className="card">
          <h3 className="syne" style={{ fontWeight: 700, marginBottom: 20 }}>Job Costs</h3>
          <div style={{ display: "grid", gap: 16 }}>
            <Field label="Material Cost" k="materials" />
            <Field label="Labor Cost" k="labor" />
            <Field label="Overhead / Equipment" k="overhead" />
            <div>
              <label style={{ display: "block", color: T.soft, fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>Profit Margin Target: <span style={{ color: T.accent }}>{inputs.margin}%</span></label>
              <input type="range" min="10" max="60" value={inputs.margin} onChange={e => setInputs(i => ({ ...i, margin: parseInt(e.target.value) }))} style={{ width: "100%", accentColor: T.accent }} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ background: `linear-gradient(135deg, #1A2E1A, ${T.card})`, border: `1px solid ${T.green}44` }}>
            <p style={{ color: T.muted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>Recommended Price</p>
            <p className="syne" style={{ fontSize: 48, fontWeight: 800, color: T.green }}>${recommended.toLocaleString()}</p>
            <p style={{ color: T.muted, fontSize: 13 }}>Based on {inputs.margin}% target margin</p>
          </div>

          {[
            { label: "Total Cost", value: totalCost, color: T.red },
            { label: "Net Profit", value: profit, color: T.green },
            { label: "Hourly Rate", value: inputs.hours > 0 ? Math.round(profit / inputs.hours) : 0, color: T.blue, suffix: "/hr" },
          ].map((r, i) => (
            <div key={i} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: T.soft, fontSize: 14 }}>{r.label}</span>
              <span className="syne" style={{ fontSize: 22, fontWeight: 800, color: r.color }}>${r.value.toLocaleString()}{r.suffix || ""}</span>
            </div>
          ))}

          <div className="card">
            <p style={{ color: T.muted, fontSize: 12, fontWeight: 600, textTransform: "uppercase", marginBottom: 12 }}>Margin Breakdown</p>
            {[
              { label: "Materials", val: inputs.materials, total: recommended, color: T.blue },
              { label: "Labor", val: inputs.labor, total: recommended, color: T.purple },
              { label: "Overhead", val: inputs.overhead, total: recommended, color: T.accent },
              { label: "Profit", val: profit, total: recommended, color: T.green },
            ].map((b, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: T.soft }}>{b.label}</span>
                  <span style={{ fontSize: 12, color: b.color, fontWeight: 600 }}>{Math.round((b.val / recommended) * 100)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.round((b.val / recommended) * 100)}%`, background: b.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Billing / Subscription ────────────────────────────────────────────────────
function BillingView({ user }) {
  const [currentPlan] = useState("pro");

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="syne" style={{ fontSize: 24, fontWeight: 800 }}>Subscription & Billing</h1>
        <p style={{ color: T.muted, fontSize: 14 }}>Manage your plan and payment method</p>
      </div>

      <div style={{ background: `linear-gradient(135deg, #1A2E14, ${T.card})`, border: `1px solid ${T.green}44`, borderRadius: 14, padding: 24, marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span className="tag" style={{ background: T.green + "33", color: T.green, marginBottom: 8 }}>ACTIVE PLAN</span>
          <h2 className="syne" style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>Pro Plan</h2>
          <p style={{ color: T.soft, fontSize: 14 }}>Unlimited leads · All AI features · Auto follow-ups</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p className="syne" style={{ fontSize: 36, fontWeight: 800, color: T.green }}>$49<span style={{ fontSize: 16, fontWeight: 400, color: T.muted }}>/mo</span></p>
          <p style={{ color: T.muted, fontSize: 12 }}>Next billing: April 5, 2025</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 24 }}>
        {PLANS.map(plan => (
          <div key={plan.id} className="card" style={{ border: plan.id === currentPlan ? `2px solid ${T.accent}` : `1px solid ${T.border}`, position: "relative" }}>
            {plan.id === currentPlan && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: T.accent, color: "#000", fontSize: 10, fontWeight: 800, padding: "2px 12px", borderRadius: 10 }}>CURRENT PLAN</div>}
            {plan.id === "pro" && <div style={{ position: "absolute", top: -12, right: 16, background: T.purple, color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 12px", borderRadius: 10 }}>POPULAR</div>}
            <h3 className="syne" style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{plan.name}</h3>
            <p style={{ color: T.accent, fontSize: 32, fontWeight: 800, marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>${plan.price}<span style={{ fontSize: 14, color: T.muted, fontWeight: 400 }}>/mo</span></p>
            <p style={{ color: T.muted, fontSize: 12, marginBottom: 16 }}>{plan.leads} leads/month</p>
            {plan.features.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Icon name="check" size={14} color={T.green} />
                <span style={{ fontSize: 13, color: T.soft }}>{f}</span>
              </div>
            ))}
            <button className={plan.id === currentPlan ? "btn-ghost" : "btn-primary"} style={{ width: "100%", marginTop: 16 }}>
              {plan.id === currentPlan ? "Current Plan" : "Upgrade"}
            </button>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="syne" style={{ fontWeight: 700, marginBottom: 16 }}>Payment Method</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0" }}>
          <div style={{ background: "#1A56DB22", padding: "10px 14px", borderRadius: 8, fontSize: 18 }}>💳</div>
          <div>
            <p style={{ fontWeight: 600 }}>Visa ending in 4242</p>
            <p style={{ color: T.muted, fontSize: 13 }}>Expires 08/27</p>
          </div>
          <button className="btn-ghost" style={{ marginLeft: "auto" }}>Update Card</button>
        </div>
      </div>
    </div>
  );
}

// ── Admin Panel ───────────────────────────────────────────────────────────────
function AdminView() {
  const users = [
    { id: 1, name: "Mike Johnson", email: "mike@contractor.com", plan: "Pro", leads: 34, status: "active", joined: "Jan 2025" },
    { id: 2, name: "Sarah Chen", email: "sarah@fenceking.com", plan: "Starter", leads: 18, status: "active", joined: "Feb 2025" },
    { id: 3, name: "Tony Ramos", email: "tony@roofsolutions.com", plan: "Agency", leads: 120, status: "active", joined: "Dec 2024" },
    { id: 4, name: "Beth Williams", email: "beth@greenscapes.com", plan: "Pro", leads: 55, status: "suspended", joined: "Jan 2025" },
  ];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="syne" style={{ fontSize: 24, fontWeight: 800 }}>Admin Panel</h1>
        <p style={{ color: T.muted, fontSize: 14 }}>Monitor accounts, subscriptions, and platform usage</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Users", value: "247", color: T.blue },
          { label: "MRR", value: "$8,940", color: T.green },
          { label: "Leads Generated", value: "12,450", color: T.accent },
          { label: "Active Subs", value: "231", color: T.purple },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <p style={{ color: T.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>{s.label}</p>
            <p className="syne" style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}` }}>
          <h3 className="syne" style={{ fontWeight: 700 }}>User Accounts</h3>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: T.surface }}>
              {["User", "Plan", "Leads Used", "Joined", "Status", "Actions"].map((h, i) => (
                <th key={i} style={{ padding: "12px 16px", textAlign: "left", color: T.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", borderBottom: `1px solid ${T.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: "14px 16px" }}>
                  <p style={{ fontWeight: 600 }}>{u.name}</p>
                  <p style={{ color: T.muted, fontSize: 12 }}>{u.email}</p>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span className="tag" style={{ background: T.accent + "22", color: T.accent }}>{u.plan}</span>
                </td>
                <td style={{ padding: "14px 16px", color: T.soft }}>{u.leads}</td>
                <td style={{ padding: "14px 16px", color: T.muted, fontSize: 13 }}>{u.joined}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span className="tag" style={{ background: u.status === "active" ? T.green + "22" : T.red + "22", color: u.status === "active" ? T.green : T.red }}>{u.status}</span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn-ghost" style={{ padding: "5px 10px", fontSize: 11 }}>View</button>
                    <button className="btn-ghost" style={{ padding: "5px 10px", fontSize: 11, color: u.status === "active" ? T.red : T.green, borderColor: u.status === "active" ? T.red + "44" : T.green + "44" }}>
                      {u.status === "active" ? "Suspend" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [leads, setLeads] = useState(SEED_LEADS);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user) return <LoginScreen onLogin={u => setUser(u)} />;

  const navItems = [
    { key: "dashboard", icon: "dashboard", label: "Dashboard" },
    { key: "leads", icon: "leads", label: "Lead Finder", badge: leads.filter(l => l.status === "new").length },
    { key: "estimate", icon: "estimate", label: "AI Estimator" },
    { key: "messages", icon: "messages", label: "AI Messages" },
    { key: "pipeline", icon: "pipeline", label: "Pipeline CRM" },
    { key: "followup", icon: "calendar", label: "Follow-Ups", badge: FOLLOWUPS.length },
    { key: "calculator", icon: "calc", label: "Profit Calc" },
    { key: "billing", icon: "billing", label: "Billing" },
    { key: "admin", icon: "admin", label: "Admin Panel" },
  ];

  const renderView = () => {
    const views = {
      dashboard: <DashboardView leads={leads} setView={setView} />,
      leads: <LeadsView leads={leads} setLeads={setLeads} />,
      estimate: <EstimateView />,
      messages: <MessagesView />,
      pipeline: <PipelineView leads={leads} setLeads={setLeads} />,
      followup: <FollowUpView leads={leads} />,
      calculator: <CalculatorView />,
      billing: <BillingView user={user} />,
      admin: <AdminView />,
    };
    return views[view] || views.dashboard;
  };

  return (
    <>
      <style>{css}</style>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <div style={{ width: sidebarOpen ? 240 : 64, background: T.surface, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", transition: "width .25s ease", overflow: "hidden", flexShrink: 0, position: "fixed", height: "100vh", zIndex: 50 }}>
          {/* Logo */}
          <div style={{ padding: "20px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setSidebarOpen(v => !v)}>
            <div style={{ width: 32, height: 32, background: T.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="zap" size={16} color="#000" />
            </div>
            {sidebarOpen && <span className="syne" style={{ fontSize: 16, fontWeight: 800, whiteSpace: "nowrap" }}>Contractor<span style={{ color: T.accent }}>Lead</span></span>}
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
            {navItems.map(item => (
              <button key={item.key} className={`nav-item ${view === item.key ? "active" : ""}`} onClick={() => setView(item.key)} title={!sidebarOpen ? item.label : ""}>
                <Icon name={item.icon} size={18} color={view === item.key ? T.accent : T.muted} />
                {sidebarOpen && <><span style={{ whiteSpace: "nowrap" }}>{item.label}</span>{item.badge > 0 && <span className="badge">{item.badge}</span>}</>}
              </button>
            ))}
          </nav>

          {/* User */}
          <div style={{ padding: "12px 8px", borderTop: `1px solid ${T.border}` }}>
            {sidebarOpen && (
              <div style={{ padding: "10px 12px", marginBottom: 8, background: T.card, borderRadius: 8 }}>
                <p style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</p>
                <p style={{ color: T.muted, fontSize: 11 }}>{user.plan} plan</p>
              </div>
            )}
            <button className="nav-item" onClick={() => setUser(null)}>
              <Icon name="logout" size={18} color={T.muted} />
              {sidebarOpen && <span>Sign Out</span>}
            </button>
          </div>
        </div>

        {/* Main */}
        <div style={{ marginLeft: sidebarOpen ? 240 : 64, flex: 1, transition: "margin .25s ease" }}>
          {/* Topbar */}
          <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span className="syne" style={{ fontWeight: 700, fontSize: 15, color: T.text }}>
                {navItems.find(n => n.key === view)?.label || "Dashboard"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <input className="input" placeholder="Search..." style={{ width: 220, paddingLeft: 36, fontSize: 13 }} />
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}><Icon name="search" size={14} color={T.muted} /></span>
              </div>
              <div style={{ position: "relative" }}>
                <button style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: 8, cursor: "pointer" }}>
                  <Icon name="bell" size={18} color={T.soft} />
                </button>
                <div style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, background: T.accent, borderRadius: "50%" }} />
              </div>
              <div style={{ width: 34, height: 34, background: T.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: "#000" }}>{user.name[0]}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: 28, maxWidth: 1400 }}>
            {renderView()}
          </div>
        </div>
      </div>
    </>
  );
}
