import React, { useState, useEffect, useCallback } from "react";
import { LayoutDashboard, Package, ClipboardList, Wallet, LogOut, Plus, X, Truck, Check, Loader2 } from "lucide-react";

const API_BASE = "https://sadaar-backend-production.up.railway.app/api";

const C = {
  ink: "#16261C", deep: "#1E3324", sand: "#F3ECDD", warm: "#FBF8F1",
  bronze: "#B08D57", char: "#22201B", line: "#DCD2BB", muted: "#7A7566", danger: "#A3402F",
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');`;

function money(n) {
  return `SAR ${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function payoutOf(item) {
  const total = Number(item.unit_price) * item.quantity;
  const commission = Math.round(total * (Number(item.commission_rate) / 100) * 100) / 100;
  return { total, commission, payout: Math.round((total - commission) * 100) / 100 };
}

async function api(path, options = {}, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

const statusTone = {
  pending: { bg: "#F3E6D8", fg: "#8A5A1E" },
  shipped: { bg: "#DDE7DB", fg: "#2F5B3C" },
  delivered: { bg: "#DCE6E1", fg: C.ink },
};

function Badge({ status }) {
  const tone = statusTone[status] || statusTone.pending;
  return <span style={{ background: tone.bg, color: tone.fg, fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", padding: "3px 9px", borderRadius: 3 }}>{status}</span>;
}

const inputStyle = { border: `1px solid ${C.line}`, padding: "11px 13px", fontFamily: "Inter, sans-serif", fontSize: 14, background: C.warm, color: C.char };
const h1 = { fontFamily: "Fraunces, serif", fontWeight: 500, fontSize: 24, color: C.ink, margin: 0 };
const h2 = { fontFamily: "Fraunces, serif", fontWeight: 500, fontSize: 17, color: C.ink, marginTop: 32, marginBottom: 12 };

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await api("/brands/login", { method: "POST", body: JSON.stringify({ email, password }) });
      onLogin(result.token, result.brand);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.sand, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{FONTS}</style>
      <div style={{ width: 380, background: C.warm, border: `1px solid ${C.line}`, padding: 32 }}>
        <div style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 24, color: C.ink, marginBottom: 4 }}>SADAAR</div>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted, marginBottom: 24 }}>Brand dashboard</p>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Brand email" style={inputStyle} />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" style={inputStyle} />
          {error && <p style={{ color: C.danger, fontFamily: "Inter, sans-serif", fontSize: 12, margin: 0 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ background: C.ink, color: C.warm, border: "none", padding: "12px 0", fontFamily: "Inter, sans-serif", fontSize: 14, cursor: "pointer", marginTop: 6, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: C.muted, marginTop: 18 }}>
          Use the seeded demo brand credentials from your database (e.g. hello@nokhba.example) — password is whatever the account was created with. New brand applications go through "Apply to sell" on the main site and start as pending until approved.
        </p>
      </div>
    </div>
  );
}

function Sidebar({ brand, view, setView, onLogout }) {
  const items = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ClipboardList },
    { id: "payouts", label: "Payouts", icon: Wallet },
  ];
  return (
    <div style={{ width: 220, flexShrink: 0, background: C.ink, color: C.sand, minHeight: "100vh", padding: "24px 18px", display: "flex", flexDirection: "column" }}>
      <div style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 20, marginBottom: 2 }}>SADAAR</div>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#9CA394", marginBottom: 28 }}>{brand.name}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setView(id)} style={{ display: "flex", alignItems: "center", gap: 10, background: view === id ? "#22331F" : "none", border: "none", cursor: "pointer", color: view === id ? C.sand : "#B7BCA9", fontFamily: "Inter, sans-serif", fontSize: 14, padding: "10px 10px", textAlign: "left" }}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>
      <button onClick={onLogout} style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", color: "#B7BCA9", fontFamily: "Inter, sans-serif", fontSize: 13, padding: "10px 10px" }}>
        <LogOut size={15} /> Log out
      </button>
    </div>
  );
}

function Loading() {
  return <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted, display: "flex", alignItems: "center", gap: 8 }}><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Loading...<style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style></p>;
}

function Overview({ products, orderItems, loading }) {
  if (loading) return <div><h1 style={h1}>Overview</h1><div style={{ marginTop: 20 }}><Loading /></div></div>;
  const totalStock = products.reduce((s, p) => s + (p.variants || []).reduce((v, x) => v + x.stock_qty, 0), 0);
  const toFulfill = orderItems.filter((i) => i.fulfillment_status === "pending").length;
  const monthSales = orderItems.reduce((s, i) => s + Number(i.unit_price) * i.quantity, 0);
  const owed = orderItems.reduce((s, i) => s + payoutOf(i).payout, 0);
  const cards = [
    { label: "Sales (all time)", value: money(monthSales) },
    { label: "Orders to fulfill", value: toFulfill },
    { label: "Active products", value: products.length },
    { label: "Units in stock", value: totalStock },
    { label: "Payout owed", value: money(owed) },
  ];
  return (
    <div>
      <h1 style={h1}>Overview</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginTop: 20 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ background: C.warm, border: `1px solid ${C.line}`, padding: 18 }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.muted, margin: 0 }}>{c.label}</p>
            <p style={{ fontFamily: "Fraunces, serif", fontSize: 24, color: C.ink, margin: "6px 0 0" }}>{c.value}</p>
          </div>
        ))}
      </div>
      <h2 style={h2}>Needs fulfillment</h2>
      {orderItems.filter((i) => i.fulfillment_status === "pending").length === 0 ? (
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted }}>Nothing waiting — you're caught up.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {orderItems.filter((i) => i.fulfillment_status === "pending").map((i) => (
            <div key={i.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: C.warm, border: `1px solid ${C.line}`, fontFamily: "Inter, sans-serif", fontSize: 13 }}>
              <span>{i.product_name} × {i.quantity}</span>
              <span style={{ color: C.muted }}>{i.shipping_city}, order #{i.order_id}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Products({ products, loading, token, onCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Contemporary");
  const [price, setPrice] = useState("");
  const [sizesRaw, setSizesRaw] = useState("S:5, M:5, L:5");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const addProduct = async (e) => {
    e.preventDefault();
    setError("");
    const sizes = sizesRaw.split(",").map((chunk) => {
      const [size, stockQty] = chunk.split(":").map((s) => s.trim());
      return { size: size || "One size", stockQty: Number(stockQty) || 0 };
    }).filter((v) => v.size);

    setSaving(true);
    try {
      await api("/products", { method: "POST", body: JSON.stringify({ name, category, price: Number(price), sizes }) }, token);
      setName(""); setPrice(""); setSizesRaw("S:5, M:5, L:5"); setShowForm(false);
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={h1}>Products</h1>
        <button onClick={() => setShowForm((s) => !s)} style={{ display: "flex", alignItems: "center", gap: 6, background: C.ink, color: C.warm, border: "none", padding: "9px 16px", fontFamily: "Inter, sans-serif", fontSize: 13, cursor: "pointer" }}>
          {showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? "Cancel" : "Add product"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={addProduct} style={{ background: C.warm, border: `1px solid ${C.line}`, padding: 20, marginTop: 16, display: "flex", flexDirection: "column", gap: 12, maxWidth: 420 }}>
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" style={inputStyle} />
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
            {["Contemporary", "Abayas", "Streetwear", "Accessories", "Footwear"].map((c) => <option key={c}>{c}</option>)}
          </select>
          <input required value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="Price (SAR)" style={inputStyle} />
          <div>
            <input value={sizesRaw} onChange={(e) => setSizesRaw(e.target.value)} placeholder="Sizes and stock, e.g. S:5, M:5, L:5" style={{ ...inputStyle, width: "100%" }} />
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: C.muted, marginTop: 4 }}>Format: size:stock, separated by commas.</p>
          </div>
          {error && <p style={{ color: C.danger, fontFamily: "Inter, sans-serif", fontSize: 12, margin: 0 }}>{error}</p>}
          <button type="submit" disabled={saving} style={{ background: C.ink, color: C.warm, border: "none", padding: "11px 0", fontFamily: "Inter, sans-serif", fontSize: 14, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving..." : "Save product"}
          </button>
        </form>
      )}

      {loading ? <div style={{ marginTop: 20 }}><Loading /></div> : (
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          {products.map((p) => (
            <div key={p.id} style={{ background: C.warm, border: `1px solid ${C.line}`, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontFamily: "Fraunces, serif", fontSize: 16, color: C.ink, margin: 0 }}>{p.name}</p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.muted, margin: "2px 0 0" }}>{p.category}</p>
                </div>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: C.ink, fontWeight: 500 }}>{money(p.price)}</p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                {(p.variants || []).map((v) => (
                  <span key={v.id} style={{ fontFamily: "Inter, sans-serif", fontSize: 12, border: `1px solid ${C.line}`, padding: "4px 9px", color: v.stock_qty === 0 ? C.danger : C.char }}>{v.size}: {v.stock_qty} in stock</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Orders({ orderItems, loading, token, onUpdated }) {
  const [trackingDrafts, setTrackingDrafts] = useState({});
  const [shippingId, setShippingId] = useState(null);
  const [error, setError] = useState("");

  const ship = async (id) => {
    setShippingId(id);
    setError("");
    try {
      await api(`/orders/items/${id}/ship`, { method: "PATCH", body: JSON.stringify({ trackingNumber: trackingDrafts[id] || "" }) }, token);
      onUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setShippingId(null);
    }
  };

  if (loading) return <div><h1 style={h1}>Orders</h1><div style={{ marginTop: 20 }}><Loading /></div></div>;

  return (
    <div>
      <h1 style={h1}>Orders</h1>
      {error && <p style={{ color: C.danger, fontFamily: "Inter, sans-serif", fontSize: 13, marginTop: 10 }}>{error}</p>}
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {orderItems.length === 0 && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted }}>No orders yet.</p>}
        {orderItems.map((i) => (
          <div key={i.id} style={{ background: C.warm, border: `1px solid ${C.line}`, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div>
                <p style={{ fontFamily: "Fraunces, serif", fontSize: 15, color: C.ink, margin: 0 }}>{i.product_name} × {i.quantity}</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.muted, margin: "4px 0 0" }}>Order #{i.order_id} · {i.shipping_name}, {i.shipping_city} · {new Date(i.order_created_at).toLocaleDateString()}</p>
              </div>
              <Badge status={i.fulfillment_status} />
            </div>
            {i.fulfillment_status === "pending" ? (
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <input placeholder="Tracking number" value={trackingDrafts[i.id] || ""} onChange={(e) => setTrackingDrafts((prev) => ({ ...prev, [i.id]: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => ship(i.id)} disabled={shippingId === i.id} style={{ display: "flex", alignItems: "center", gap: 6, background: C.ink, color: C.warm, border: "none", padding: "0 16px", fontFamily: "Inter, sans-serif", fontSize: 13, cursor: "pointer", opacity: shippingId === i.id ? 0.7 : 1 }}>
                  <Truck size={14} /> {shippingId === i.id ? "Saving..." : "Mark shipped"}
                </button>
              </div>
            ) : (
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.muted, marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}><Check size={13} /> Tracking: {i.tracking_number || "—"}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Payouts({ orderItems, loading }) {
  if (loading) return <div><h1 style={h1}>Payouts</h1><div style={{ marginTop: 20 }}><Loading /></div></div>;
  const totalPayout = orderItems.reduce((s, i) => s + payoutOf(i).payout, 0);
  const totalCommission = orderItems.reduce((s, i) => s + payoutOf(i).commission, 0);
  return (
    <div>
      <h1 style={h1}>Payouts</h1>
      <div style={{ display: "flex", gap: 14, marginTop: 20, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ background: C.warm, border: `1px solid ${C.line}`, padding: 18, flex: 1, minWidth: 180 }}>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.muted, margin: 0 }}>Total owed to you</p>
          <p style={{ fontFamily: "Fraunces, serif", fontSize: 24, color: C.ink, margin: "6px 0 0" }}>{money(totalPayout)}</p>
        </div>
        <div style={{ background: C.warm, border: `1px solid ${C.line}`, padding: 18, flex: 1, minWidth: 180 }}>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.muted, margin: 0 }}>SADAAR commission taken</p>
          <p style={{ fontFamily: "Fraunces, serif", fontSize: 24, color: C.ink, margin: "6px 0 0" }}>{money(totalCommission)}</p>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "8px 10px", fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", color: C.muted, borderBottom: `1px solid ${C.line}` }}>
          <span>Item</span><span>Sale</span><span>Commission</span><span>Payout</span><span>Status</span>
        </div>
        {orderItems.map((i) => {
          const { total, commission, payout } = payoutOf(i);
          return (
            <div key={i.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "10px", fontFamily: "Inter, sans-serif", fontSize: 13, borderBottom: `1px solid ${C.line}`, alignItems: "center" }}>
              <span>{i.product_name}</span>
              <span>{money(total)}</span>
              <span style={{ color: C.muted }}>{money(commission)}</span>
              <span style={{ color: C.ink, fontWeight: 500 }}>{money(payout)}</span>
              <Badge status={i.fulfillment_status} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BrandDashboard() {
  const [token, setToken] = useState(null);
  const [brand, setBrand] = useState(null);
  const [view, setView] = useState("overview");
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async (tok, brandInfo) => {
    setLoading(true);
    try {
      const productList = await api(`/products?brandId=${brandInfo.id}`);
      const withVariants = await Promise.all(productList.map((p) => api(`/products/${p.id}`)));
      setProducts(withVariants);
      const items = await api("/orders/brand/mine", {}, tok);
      setOrderItems(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = (tok, brandInfo) => {
    setToken(tok);
    setBrand(brandInfo);
    loadData(tok, brandInfo);
  };

  const refresh = () => { if (token && brand) loadData(token, brand); };

  if (!brand) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div style={{ display: "flex", background: C.sand, minHeight: "100vh" }}>
      <style>{FONTS}</style>
      <Sidebar brand={brand} view={view} setView={setView} onLogout={() => { setBrand(null); setToken(null); }} />
      <main style={{ flex: 1, padding: "32px 40px", maxWidth: 900 }}>
        {view === "overview" && <Overview products={products} orderItems={orderItems} loading={loading} />}
        {view === "products" && <Products products={products} loading={loading} token={token} onCreated={refresh} />}
        {view === "orders" && <Orders orderItems={orderItems} loading={loading} token={token} onUpdated={refresh} />}
        {view === "payouts" && <Payouts orderItems={orderItems} loading={loading} />}
      </main>
    </div>
  );
}
