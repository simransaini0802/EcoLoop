import React, { useEffect, useMemo, useState } from "react";
import {
  Recycle, Leaf, LayoutDashboard, CalendarPlus, ClipboardList, Award, Settings,
  LogOut, Menu, X, Search, Bell, ArrowUpRight, CheckCircle2, Clock3, Truck,
  PackageCheck, TrendingUp, MapPin, Plus, Filter, ChevronRight, Sprout, Users,
  ChartNoAxesCombined, CircleHelp, LogIn, UserPlus, Eye, EyeOff, AlertCircle
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5674/api";
const categories = ["Plastic", "Paper", "Glass", "Metal", "E-waste", "Organic"];
const pointsRate = { Plastic: 10, Paper: 8, Glass: 7, Metal: 12, "E-waste": 15, Organic: 4 };
const moneyDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";

async function api(path, token, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("ecoloop_token") || "");
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ecoloop_user") || "null"); } catch { return null; }
  });
  const [page, setPage] = useState("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [loading, setLoading] = useState(false);

  const notify = (message) => { setToast(message); setTimeout(() => setToast(""), 3600); };
  const signOut = () => {
    localStorage.removeItem("ecoloop_token"); localStorage.removeItem("ecoloop_user");
    setToken(""); setUser(null); setPage("overview"); setMobileNav(false);
  };
  const signIn = (data) => {
    localStorage.setItem("ecoloop_token", data.token); localStorage.setItem("ecoloop_user", JSON.stringify(data.user));
    setToken(data.token); setUser(data.user); setPage("overview"); notify(`Welcome, ${data.user.name.split(" ")[0]}!`);
  };

  useEffect(() => {
    if (!token) return;
    api("/auth/me", token).then(({ user: current }) => {
      setUser(current); localStorage.setItem("ecoloop_user", JSON.stringify(current));
    }).catch(() => signOut());
  }, [token]);

  if (!token || !user) return <AuthScreen mode={authMode} setMode={setAuthMode} onSuccess={signIn} notify={notify} />;
  const nav = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    ...(user.role !== "collector" ? [{ id: "schedule", label: "Schedule collection", icon: CalendarPlus }] : []),
    { id: "requests", label: user.role === "collector" ? "Assigned pickups" : "My collections", icon: ClipboardList },
    ...(user.role === "user" ? [{ id: "rewards", label: "Eco rewards", icon: Award }] : []),
    ...(user.role === "admin" ? [{ id: "people", label: "People & operations", icon: Users }] : []),
  ];
  const titles = {
    overview: ["Your eco dashboard", "Small actions today. A cleaner planet tomorrow."],
    schedule: ["Schedule a collection", "Choose what to recycle and when we should collect it."],
    requests: [user.role === "collector" ? "Assigned pickups" : "Collection history", "Follow every request from pickup to completion."],
    rewards: ["Your eco rewards", "Every verified collection brings you one step closer to a greener future."],
    people: ["People & operations", "Manage collection requests and keep pickups moving."]
  };
  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <div className="brand"><span className="brand-mark"><Recycle size={23}/></span><span>eco<span className="brand-light">loop</span><small>LIVE MORE. WASTE LESS.</small></span><button className="mobile-close" onClick={() => setMobileNav(false)}><X/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{nav.map(item => <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => { setPage(item.id); setMobileNav(false); }}><item.icon size={19}/><span>{item.label}</span>{page === item.id && <ChevronRight className="nav-chevron" size={16}/>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="side-tip"><div className="tip-icon"><Sprout size={18}/></div><strong>A little greener</strong><p>One recycled bottle can make a difference. Keep your streak going.</p><div className="tip-link" onClick={() => setPage("rewards")}>See your impact <ArrowUpRight size={14}/></div></div>
        <button className="nav-item logout" onClick={signOut}><LogOut size={18}/> Sign out</button>
        <div className="sidebar-user"><div className="avatar">{user.name?.slice(0,1).toUpperCase()}</div><div className="user-details"><strong>{user.name}</strong><span>{user.role === "admin" ? "Administrator" : user.role === "collector" ? "Collection partner" : "Eco member"}</span></div><span className="online-dot"/></div>
      </div>
    </aside>
    {mobileNav && <div className="scrim" onClick={() => setMobileNav(false)} />}
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMobileNav(true)}><Menu/></button><div className="breadcrumb">Workspace <span>/</span> <b>{titles[page]?.[0] || "Overview"}</b></div><div className="topbar-actions"><span className="today-label">{new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})}</span><button className="icon-btn" title="Notifications"><Bell size={18}/><i/></button><div className="avatar small">{user.name?.slice(0,1).toUpperCase()}</div></div></header>
      <div className="page-content">
        <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/>{user.role === "admin" ? "ADMIN CONSOLE" : user.role === "collector" ? "COLLECTION PARTNER" : "YOUR SUSTAINABILITY SPACE"}</div><h1>{titles[page]?.[0] || "Your eco dashboard"}</h1><p>{titles[page]?.[1] || ""}</p></div>{page !== "schedule" && user.role === "user" && <button className="primary-btn" onClick={() => setPage("schedule")}><Plus size={17}/> New collection</button>}</div>
        {page === "overview" && <Overview token={token} user={user} go={setPage} notify={notify}/>}
        {page === "schedule" && <Schedule token={token} user={user} notify={notify} onDone={() => setPage("requests")}/>}
        {page === "requests" && <Requests token={token} user={user} notify={notify}/>}
        {page === "rewards" && <Rewards token={token} user={user}/>}
        {page === "people" && <Operations token={token} notify={notify}/>}
        <footer className="footer"><span>© 2026 EcoLoop · Designed for a greener tomorrow</span><span><Leaf size={14}/> Make every loop count</span></footer>
      </div>
    </main>
    {toast && <div className="toast"><CheckCircle2 size={18}/>{toast}</div>}
  </div>;
}

function AuthScreen({ mode, setMode, onSuccess, notify }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", address: "" });
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [showPass, setShowPass] = useState(false);
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const data = await api(`/auth/${mode}`, null, { method: "POST", body: JSON.stringify(form) });
      onSuccess(data);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <div className="auth-page">
    <section className="auth-visual"><div className="auth-brand"><span className="brand-mark"><Recycle size={24}/></span><span>eco<span className="brand-light">loop</span></span></div><div className="visual-copy"><div className="visual-pill"><span/> YOUR PLANET. YOUR IMPACT.</div><h1>Good habits.<br/><em>Greener</em> tomorrows.</h1><p>Make recycling simple, track your impact, and be part of a community that's closing the loop on waste.</p><div className="visual-stats"><div><strong>01</strong><span>Sort your waste</span></div><div><strong>02</strong><span>Schedule a pickup</span></div><div><strong>03</strong><span>Earn eco points</span></div></div></div><div className="visual-art"><div className="art-circle circle-one"/><div className="art-circle circle-two"/><div className="art-leaf"><Leaf size={98} strokeWidth={1.1}/></div><div className="art-tag"><Recycle size={17}/><span>Keep it circular</span></div></div><div className="visual-foot"><span>♻  Small steps, lasting change</span><span>EST. FOR A BETTER PLANET</span></div></section>
    <section className="auth-form-area"><div className="auth-form-wrap"><div className="auth-mobile-title"><Sprout size={22}/> EcoLoop</div><div className="auth-intro"><div className="eyebrow"><span className="eyebrow-dot"/> LET'S MAKE A DIFFERENCE</div><h2>{mode === "login" ? "Welcome back" : "Join the green movement"}</h2><p>{mode === "login" ? "Sign in to pick up where your impact left off." : "Create your account and start your recycling journey."}</p></div>
    <form onSubmit={submit} className="auth-form">
      {mode === "register" && <label>Full name<input name="name" value={form.name} onChange={update} placeholder="e.g. Simran Saini" autoComplete="name" required/></label>}
      <label>Email address<input name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" autoComplete="email" required/></label>
      {mode === "register" && <label>Collection address <span className="optional">(optional)</span><input name="address" value={form.address} onChange={update} placeholder="Street, area, city"/></label>}
      <label>Password<div className="password-field"><input name="password" type={showPass ? "text" : "password"} value={form.password} onChange={update} placeholder={mode === "register" ? "At least 8 characters" : "Enter your password"} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "register" ? 8 : undefined} required/><button type="button" onClick={() => setShowPass(!showPass)}>{showPass ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>
      {error && <div className="form-error"><AlertCircle size={16}/>{error}</div>}
      <button className="primary-btn auth-submit" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? <><LogIn size={17}/> Sign in to EcoLoop</> : <><UserPlus size={17}/> Create my account</>}</button>
    </form><div className="auth-switch">{mode === "login" ? "New to EcoLoop?" : "Already part of EcoLoop?"} <button onClick={() => {setMode(mode === "login" ? "register" : "login");setError("");}}> {mode === "login" ? "Create an account" : "Sign in instead"}</button></div><div className="auth-note"><span><CheckCircle2 size={15}/> Your data stays protected</span><span>Built for a cleaner planet</span></div></div></section>
  </div>;
}

function useDashboard(token) {
  const [data, setData] = useState(null); const [error, setError] = useState(""); const [refresh, setRefresh] = useState(0);
  useEffect(() => { let alive = true; api("/dashboard/stats", token).then(d => alive && setData(d.stats)).catch(e => alive && setError(e.message)); return () => { alive = false; }; }, [token, refresh]);
  return { data, error, reload: () => setRefresh(x => x + 1) };
}

function Overview({ token, user, go, notify }) {
  const { data, error, reload } = useDashboard(token);
  const [requests, setRequests] = useState([]);
  useEffect(() => { api("/requests", token).then(d => setRequests(d.requests)).catch(() => {}); }, [token, data?.totalRequests]);
  const stats = data || {};
  const metrics = [
    { label: "Total requests", value: stats.totalRequests ?? "—", icon: ClipboardList, tone: "mint", note: "All collection requests" },
    { label: "Awaiting collection", value: stats.pendingRequests ?? "—", icon: Clock3, tone: "amber", note: "Needs attention" },
    { label: "Completed pickups", value: stats.completedRequests ?? "—", icon: PackageCheck, tone: "blue", note: "Verified collections" },
    { label: user.role === "user" ? "Your eco points" : "Waste collected", value: user.role === "user" ? (user.points ?? 0).toLocaleString() : `${stats.totalKgCollected ?? 0} kg`, icon: user.role === "user" ? Award : Recycle, tone: "purple", note: user.role === "user" ? "Points earned so far" : "Verified total weight" }
  ];
  return <div className="stack-lg">
    <div className="welcome-banner"><div className="welcome-copy"><div className="welcome-label"><Sprout size={15}/> YOUR DAILY DOSE OF GOOD</div><h2>Hey {user.name.split(" ")[0]}, you're part of the solution.</h2><p>Every item recycled is a small win for the planet. Here's how your green journey is growing.</p><button className="banner-btn" onClick={() => go(user.role === "collector" ? "requests" : "schedule")}>{user.role === "collector" ? "View assigned pickups" : "Schedule a pickup"} <ArrowUpRight size={16}/></button></div><div className="banner-illustration"><div className="sun"/><div className="hill hill-back"/><div className="hill hill-front"/><div className="plant plant-one"><i/><i/><i/><b/></div><div className="plant plant-two"><i/><i/><b/></div><div className="banner-recycle"><Recycle size={48}/></div></div><div className="banner-stamp"><Leaf size={16}/><span>ONE PLANET.<br/>LET'S PROTECT IT.</span></div></div>
    {error && <div className="inline-error"><AlertCircle size={16}/>{error} <span>Check that the backend and MongoDB are running.</span></div>}
    <div className="metric-grid">{metrics.map((m,i)=><div className="metric-card" key={m.label}><div className={`metric-icon ${m.tone}`}><m.icon size={20}/></div><div className="metric-label">{m.label}</div><div className="metric-value">{m.value}</div><div className="metric-note"><span className="metric-dot"/> {m.note}</div><div className="metric-watermark">{i+1}</div></div>)}</div>
    <div className="content-grid">
      <section className="panel category-panel"><div className="panel-head"><div><h3>Waste breakdown</h3><p>Your collection mix at a glance</p></div><span className="panel-icon"><ChartNoAxesCombined size={18}/></span></div>
        {stats.byCategory?.length ? <div className="category-list">{stats.byCategory.map((c,i)=>{const max=Math.max(...stats.byCategory.map(x=>x.count),1);return <div className="category-row" key={c._id}><span className={`category-symbol c${i%5}`}>{c._id.slice(0,1)}</span><div className="category-info"><div><strong>{c._id}</strong><span>{c.count} request{c.count===1?"":"s"} · {c.kg} kg</span></div><div className="progress-track"><div className={`progress-fill fill${i%5}`} style={{width:`${c.count/max*100}%`}}/></div></div><b className="category-count">{c.count}</b></div>})}</div> : <EmptyState icon={Recycle} title="Your recycling story starts here" text="Once you create a collection request, your waste breakdown will appear here." action="Schedule a collection" onClick={() => go("schedule")}/>}
      </section>
      <section className="panel recent-panel"><div className="panel-head"><div><h3>Recent activity</h3><p>Your latest collection requests</p></div><button className="text-link" onClick={() => go("requests")}>View all <ChevronRight size={15}/></button></div>
        {stats.recent?.length ? <div className="activity-list">{stats.recent.map(r=><div className="activity-item" key={r._id}><div className="activity-icon"><Recycle size={18}/></div><div className="activity-main"><strong>{r.category} collection</strong><span>{r.quantityKg} kg · {moneyDate(r.scheduledDate)}</span></div><Status status={r.status}/></div>)}</div> : <EmptyState icon={ClipboardList} title="No activity yet" text="Your collection requests will show up here." action="Create a request" onClick={() => go("schedule")}/>}
      </section>
    </div>
    <div className="bottom-callout"><div className="callout-icon"><Leaf size={21}/></div><div><strong>Did you know?</strong><p>Sorting recyclables correctly helps materials get processed into new products instead of going to landfill.</p></div><button onClick={() => go(user.role === "user" ? "rewards" : "requests")}>Keep exploring <ArrowUpRight size={15}/></button></div>
  </div>;
}

function EmptyState({ icon: Icon, title, text, action, onClick }) {
  return <div className="empty-state"><div className="empty-icon"><Icon size={24}/></div><strong>{title}</strong><p>{text}</p>{action && <button className="text-link" onClick={onClick}>{action} <ArrowUpRight size={14}/></button>}</div>;
}

function Status({ status }) {
  const labels = { pending:"Pending", assigned:"Assigned", in_progress:"In progress", completed:"Completed", cancelled:"Cancelled" };
  return <span className={`status status-${status}`}>{status === "completed" ? <CheckCircle2 size={12}/> : status === "pending" ? <Clock3 size={12}/> : <span className="status-dot"/>}{labels[status] || status}</span>;
}

function Schedule({ token, user, notify, onDone }) {
  const [form, setForm] = useState({ category: "Plastic", quantityKg: "2", address: user.address || "", scheduledDate: "", notes: "" });
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const minDate = new Date(Date.now() - new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
  const update = e => setForm({...form,[e.target.name]:e.target.value});
  const estimate = Math.round((Number(form.quantityKg)||0)*(pointsRate[form.category]||0));
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError("");
    try { await api("/requests", token, { method:"POST", body:JSON.stringify({...form,quantityKg:Number(form.quantityKg)}) }); notify("Collection request created successfully."); onDone(); }
    catch(err) { setError(err.message); } finally { setBusy(false); }
  }
  return <div className="form-layout"><section className="panel form-panel"><div className="panel-head"><div><h3>Collection details</h3><p>Tell us what you'd like us to collect.</p></div><span className="panel-icon"><CalendarPlus size={18}/></span></div><form className="collection-form" onSubmit={submit}>
    <label>Waste category <span className="required">*</span><div className="select-wrap"><select name="category" value={form.category} onChange={update}>{categories.map(c=><option key={c}>{c}</option>)}</select></div></label>
    <div className="form-row"><label>Estimated quantity (kg) <span className="required">*</span><input name="quantityKg" type="number" min="0.1" max="10000" step="0.1" value={form.quantityKg} onChange={update} required/></label><label>Preferred pickup date <span className="required">*</span><input name="scheduledDate" type="date" min={minDate} value={form.scheduledDate} onChange={update} required/></label></div>
    <label>Collection address <span className="required">*</span><input name="address" value={form.address} onChange={update} placeholder="House / street, area, city" required maxLength="300"/><small className="field-hint"><MapPin size={13}/> Make sure the address is accurate for pickup.</small></label>
    <label>Additional notes <span className="optional">(optional)</span><textarea name="notes" value={form.notes} onChange={update} rows="3" maxLength="500" placeholder="Gate instructions, packaging details, or anything else we should know…"/></label>
    {error && <div className="form-error"><AlertCircle size={16}/>{error}</div>}
    <div className="form-actions"><button type="button" className="secondary-btn" onClick={() => setForm({category:"Plastic",quantityKg:"2",address:user.address||"",scheduledDate:"",notes:""})}>Reset form</button><button className="primary-btn" disabled={busy}>{busy ? "Submitting…" : <><CalendarPlus size={17}/> Submit collection request</>}</button></div>
  </form></section>
  <aside className="schedule-aside"><div className="impact-card"><div className="impact-top"><div className="impact-icon"><Leaf size={21}/></div><span>YOUR ESTIMATED REWARD</span></div><div className="impact-number">{estimate.toLocaleString()} <small>pts</small></div><p>Earn points after your collection is completed and verified.</p><div className="impact-divider"/><div className="impact-detail"><span>Selected material</span><strong>{form.category}</strong></div><div className="impact-detail"><span>Quantity</span><strong>{Number(form.quantityKg)||0} kg</strong></div><div className="impact-detail"><span>Rate</span><strong>{pointsRate[form.category]} pts / kg</strong></div><div className="impact-disclaimer">*Estimate only. Final points are calculated after verified collection.</div></div>
    <div className="how-card"><h3><Sprout size={17}/> How it works</h3>{[["01","Schedule","Choose your material, quantity and pickup date."],["02","Get collected","A collection partner will be assigned."],["03","Earn points","Points are added once your pickup is verified."]].map(x=><div className="how-step" key={x[0]}><span>{x[0]}</span><div><strong>{x[1]}</strong><p>{x[2]}</p></div></div>)}</div></aside></div>;
}

function Requests({ token, user, notify }) {
  const [requests,setRequests] = useState([]); const [busy,setBusy] = useState(true); const [error,setError] = useState(""); const [filter,setFilter] = useState("all"); const [query,setQuery] = useState("");
  const load = () => { setBusy(true); api("/requests",token).then(d=>{setRequests(d.requests);setError("");}).catch(e=>setError(e.message)).finally(()=>setBusy(false)); };
  useEffect(()=>{load();},[token]);
  const visible = requests.filter(r=>(filter==="all"||r.status===filter) && `${r.category} ${r.address} ${r.status}`.toLowerCase().includes(query.toLowerCase()));
  async function updateStatus(id,status) { try { await api(`/requests/${id}/status`,token,{method:"PATCH",body:JSON.stringify({status})}); notify(status==="completed"?"Collection completed. Rewards have been processed.":"Collection status updated."); load(); } catch(e){notify(e.message);} }
  return <section className="panel table-panel"><div className="table-toolbar"><div><h3>{user.role==="collector"?"Your pickup assignments":"All collection requests"}</h3><p>{requests.length} request{requests.length===1?"":"s"} in total</p></div><div className="table-controls"><div className="search-box"><Search size={16}/><input placeholder="Search collections…" value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="filter-wrap"><Filter size={15}/><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All status</option><option value="pending">Pending</option><option value="assigned">Assigned</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div><button className="icon-btn refresh-btn" title="Refresh" onClick={load}><TrendingUp size={16}/></button></div></div>
    {error && <div className="inline-error"><AlertCircle size={16}/>{error}</div>}
    {busy ? <div className="loading-state">Loading collection requests…</div> : visible.length ? <div className="table-scroll"><table><thead><tr><th>Collection</th>{user.role!=="user"&&<th>Customer</th>}<th>Quantity</th><th>Pickup date</th><th>Status</th>{user.role!=="user"&&<th>Update</th>}</tr></thead><tbody>{visible.map(r=><tr key={r._id}><td><div className="table-primary">{r.category}</div><div className="table-secondary"><MapPin size={12}/>{r.address}</div></td>{user.role!=="user"&&<td>{r.user?.name||"—"}</td>}<td><strong>{r.quantityKg} kg</strong></td><td>{moneyDate(r.scheduledDate)}</td><td><Status status={r.status}/></td>{user.role!=="user"&&<td>{!["completed","cancelled"].includes(r.status) ? <select className="status-select" value={r.status} onChange={e=>updateStatus(r._id,e.target.value)}><option value="assigned" disabled>Assigned</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select> : <span className="muted">—</span>}</td>}</tr>)}</tbody></table></div> : <EmptyState icon={ClipboardList} title="No matching collections" text={query||filter!=="all"?"Try changing your search or status filter.":"Your collection requests will appear here once created."}/>}
    <div className="table-foot"><span>Showing {visible.length} of {requests.length} requests</span><span><span className="status-dot green-dot"/> Live from your EcoLoop database</span></div>
  </section>;
}

function Rewards({ token, user }) {
  const [data,setData] = useState(null); const [error,setError] = useState("");
  useEffect(()=>{api("/rewards",token).then(setData).catch(e=>setError(e.message));},[token]);
  const points = data?.points ?? user.points ?? 0;
  return <div className="stack-lg"><div className="rewards-hero"><div className="reward-leaf"><Award size={34}/></div><div><div className="welcome-label">YOUR GREEN CONTRIBUTION</div><h2>{points.toLocaleString()} <span>eco points</span></h2><p>You're making a difference with every verified collection.</p></div><div className="reward-decoration"><Leaf size={100}/></div></div>
    <div className="rewards-grid"><div className="panel rewards-info"><div className="panel-head"><div><h3>How to earn points</h3><p>Different materials have different reward rates.</p></div></div><div className="rate-list">{categories.map((c,i)=><div className="rate-row" key={c}><span className={`category-symbol c${i%5}`}>{c[0]}</span><span>{c}</span><strong>{pointsRate[c]} <small>pts/kg</small></strong></div>)}</div><div className="rewards-note"><AlertCircle size={16}/> Points are added only after a collection is marked completed by an authorized collector or admin.</div></div>
    <div className="panel rewards-history"><div className="panel-head"><div><h3>Points history</h3><p>Your recent reward transactions</p></div><span className="panel-icon"><Award size={18}/></span></div>{error&&<div className="inline-error">{error}</div>}{data?.transactions?.length?<div className="activity-list">{data.transactions.map(t=><div className="activity-item" key={t._id}><div className="activity-icon reward"><Award size={18}/></div><div className="activity-main"><strong>{t.description}</strong><span>{moneyDate(t.createdAt)}</span></div><strong className="points-plus">+{t.points}</strong></div>)}</div>:<EmptyState icon={Award} title="Your first reward is waiting" text="Complete a verified recycling collection to earn your first points."/>}</div></div>
  </div>;
}

function Operations({ token, notify }) {
  const [requests,setRequests] = useState([]); const [collectors,setCollectors] = useState([]); const [busy,setBusy] = useState(true); const [error,setError] = useState("");
  const load = async()=>{setBusy(true);try{const [r,u]=await Promise.all([api("/requests",token),api("/auth/me",token)]);setRequests(r.requests);setError("");}catch(e){setError(e.message);}finally{setBusy(false);}};
  useEffect(()=>{load();},[token]);
  // Collector accounts are selected by email/ID. Admin can still operate requests if no collector exists.
  const [collectorId,setCollectorId] = useState({});
  async function assign(id) { if(!collectorId[id])return notify("Enter a collector account ID first. See the README for role setup."); try{await api(`/requests/${id}/assign`,token,{method:"PATCH",body:JSON.stringify({collectorId:collectorId[id]})});notify("Collector assigned.");load();}catch(e){notify(e.message);} }
  async function updateStatus(id,status) { try{await api(`/requests/${id}/status`,token,{method:"PATCH",body:JSON.stringify({status})});notify("Request status updated.");load();}catch(e){notify(e.message);} }
  return <div className="stack-lg"><div className="ops-note"><div className="ops-note-icon"><Users size={21}/></div><div><strong>Operations control</strong><p>Review every collection request, update its status, and assign verified collector accounts. To create a collector, register an account and update its role to <code>collector</code> in MongoDB.</p></div></div>
    <section className="panel table-panel"><div className="table-toolbar"><div><h3>Collection operations</h3><p>Manage incoming and completed requests</p></div><button className="secondary-btn" onClick={load}><TrendingUp size={15}/> Refresh</button></div>
    {error&&<div className="inline-error">{error}</div>}
    {busy?<div className="loading-state">Loading operations…</div>:requests.length?<div className="table-scroll"><table><thead><tr><th>Request</th><th>Customer</th><th>Quantity</th><th>Schedule</th><th>Assigned collector</th><th>Status</th><th>Actions</th></tr></thead><tbody>{requests.map(r=><tr key={r._id}><td><div className="table-primary">{r.category}</div><div className="table-secondary">{r.address}</div></td><td>{r.user?.name||"—"}</td><td>{r.quantityKg} kg</td><td>{moneyDate(r.scheduledDate)}</td><td><div className="assign-field"><input value={collectorId[r._id]||""} onChange={e=>setCollectorId({...collectorId,[r._id]:e.target.value})} placeholder={r.collector?.name||"Collector ID"}/><button title="Assign collector" onClick={()=>assign(r._id)}>Assign</button></div></td><td><Status status={r.status}/></td><td><select className="status-select" value={r.status} onChange={e=>updateStatus(r._id,e.target.value)}><option value="pending">Pending</option><option value="assigned">Assigned</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></td></tr>)}</tbody></table></div>:<EmptyState icon={ClipboardList} title="No requests to manage" text="New user collection requests will appear here."/>}
    <div className="table-foot"><span>{requests.length} requests</span><span>Admin tools</span></div></section>
  </div>;
}

export default App;
