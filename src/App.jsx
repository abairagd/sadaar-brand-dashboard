import React, { useState, useEffect, useCallback } from "react";
import { LayoutDashboard, Package, ClipboardList, Wallet, LogOut, Plus, X, Truck, Check, Loader2, Star, Sparkles } from "lucide-react";

const API_BASE = "https://sadaar-backend-production.up.railway.app/api";

const C = {
  ink: "#16261C", deep: "#1E3324", sand: "#F3ECDD", warm: "#FBF8F1",
  bronze: "#B08D57", char: "#22201B", line: "#DCD2BB", muted: "#7A7566", danger: "#A3402F",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');
* { box-sizing: border-box; }
body { overflow-x: hidden; }
@media (max-width: 680px) {
  .sadaar-sidebar { width: 100% !important; min-height: auto !important; flex-direction: row !important; align-items: center !important; padding: 12px 16px !important; flex-wrap: wrap !important; gap: 10px !important; }
  .sadaar-sidebar-sub { display: none !important; }
  .sadaar-sidebar-nav { flex-direction: row !important; gap: 4px !important; overflow-x: auto !important; }
  .sadaar-logout-btn { margin-top: 0 !important; margin-left: auto !important; }
  .sadaar-main { padding: 20px 16px !important; }
  .sadaar-app-layout { flex-direction: column !important; }
  .sadaar-scroll-table { overflow-x: auto !important; }
  .sadaar-scroll-table > div { min-width: 560px !important; }
}
`;

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
    { id: "spotlight", label: "Spotlight", icon: Sparkles },
  ];
  return (
    <div className="sadaar-sidebar" style={{ width: 220, flexShrink: 0, background: C.ink, color: C.sand, minHeight: "100vh", padding: "24px 18px", display: "flex", flexDirection: "column" }}>
      <div style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 20, marginBottom: 2 }}>SADAAR</div>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#9CA394", marginBottom: 28 }} className="sadaar-sidebar-sub">{brand.name}</p>
      <div className="sadaar-sidebar-nav" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setView(id)} style={{ display: "flex", alignItems: "center", gap: 10, background: view === id ? "#22331F" : "none", border: "none", cursor: "pointer", color: view === id ? C.sand : "#B7BCA9", fontFamily: "Inter, sans-serif", fontSize: 14, padding: "10px 10px", textAlign: "left" }}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>
      <button onClick={onLogout} className="sadaar-logout-btn" style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", color: "#B7BCA9", fontFamily: "Inter, sans-serif", fontSize: 13, padding: "10px 10px" }}>
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
  const LOW_STOCK_THRESHOLD = 3;
  const lowStockItems = products.flatMap((p) =>
    (p.variants || []).filter((v) => v.stock_qty > 0 && v.stock_qty <= LOW_STOCK_THRESHOLD).map((v) => ({ productName: p.name, ...v }))
  );
  const outOfStockItems = products.flatMap((p) =>
    (p.variants || []).filter((v) => v.stock_qty === 0).map((v) => ({ productName: p.name, ...v }))
  );
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

      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <>
          <h2 style={h2}>Stock alerts</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {outOfStockItems.map((v) => (
              <div key={`out-${v.id}`} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#F0DAD5", border: "1px solid #E0BEB2", fontFamily: "Inter, sans-serif", fontSize: 13, color: C.danger }}>
                <span>{v.productName} ({v.size})</span>
                <span style={{ fontWeight: 600 }}>Out of stock</span>
              </div>
            ))}
            {lowStockItems.map((v) => (
              <div key={`low-${v.id}`} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#F3E6D8", border: "1px solid #E5CBA3", fontFamily: "Inter, sans-serif", fontSize: 13, color: "#8A5A1E" }}>
                <span>{v.productName} ({v.size})</span>
                <span style={{ fontWeight: 600 }}>{v.stock_qty} left</span>
              </div>
            ))}
          </div>
        </>
      )}

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

const SUBCATEGORIES_BY_CATEGORY = {
  Men: ["Shoes", "Accessories", "Streetwear", "Shirts", "Pants", "Swimwear", "Thobes"],
  Women: ["Shoes", "Accessories", "Abayas", "Streetwear", "Shirts", "Pants", "Swimwear", "Dresses"],
};

function Products({ products, loading, token, onCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Men");
  const [subcategory, setSubcategory] = useState("");
  const [price, setPrice] = useState("");
  const [sizesRaw, setSizesRaw] = useState("S:5, M:5, L:5");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingFor, setUploadingFor] = useState(null);
  const [uploadError, setUploadError] = useState({});

  const addProduct = async (e) => {
    e.preventDefault();
    setError("");
    const sizes = sizesRaw.split(",").map((chunk) => {
      const [size, stockQty] = chunk.split(":").map((s) => s.trim());
      return { size: size || "One size", stockQty: Number(stockQty) || 0 };
    }).filter((v) => v.size);

    setSaving(true);
    try {
      await api("/products", { method: "POST", body: JSON.stringify({ name, category, subcategory: subcategory || undefined, price: Number(price), sizes }) }, token);
      setName(""); setPrice(""); setSizesRaw("S:5, M:5, L:5"); setSubcategory(""); setShowForm(false);
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (productId, file) => {
    setUploadingFor(productId);
    setUploadError((prev) => ({ ...prev, [productId]: "" }));
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`${API_BASE}/products/${productId}/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // no Content-Type — browser sets the multipart boundary itself
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(`${data.error || `Upload failed (${res.status})`}${data.detail ? " — " + JSON.stringify(data.detail).slice(0, 300) : ""}`);
      onCreated();
    } catch (err) {
      setUploadError((prev) => ({ ...prev, [productId]: err.message }));
    } finally {
      setUploadingFor(null);
    }
  };

  const deleteImage = async (productId, imageId) => {
    try {
      await api(`/products/${productId}/images/${imageId}`, { method: "DELETE" }, token);
      onCreated();
    } catch (err) {
      setUploadError((prev) => ({ ...prev, [productId]: err.message }));
    }
  };

  const [stockDrafts, setStockDrafts] = useState({});
  const [savingStock, setSavingStock] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);

  const saveStock = async (productId, variantId) => {
    const key = `${productId}-${variantId}`;
    const value = stockDrafts[key];
    if (value === undefined || value === "") return;
    setSavingStock(key);
    try {
      await api(`/products/${productId}/variants/${variantId}/stock`, { method: "PATCH", body: JSON.stringify({ stockQty: Number(value) }) }, token);
      setStockDrafts((prev) => { const next = { ...prev }; delete next[key]; return next; });
      onCreated();
    } catch (err) {
      setUploadError((prev) => ({ ...prev, [productId]: err.message }));
    } finally {
      setSavingStock(null);
    }
  };

  const removeProduct = async (productId) => {
    setRemovingId(productId);
    try {
      await api(`/products/${productId}`, { method: "DELETE" }, token);
      setConfirmRemoveId(null);
      onCreated();
    } catch (err) {
      setUploadError((prev) => ({ ...prev, [productId]: err.message }));
    } finally {
      setRemovingId(null);
    }
  };

  const makePrimary = async (product, imageId) => {
    const currentIds = (product.images || []).map((img) => img.id);
    const reordered = [imageId, ...currentIds.filter((id) => id !== imageId)];
    try {
      await api(`/products/${product.id}/images/reorder`, { method: "PATCH", body: JSON.stringify({ imageIds: reordered }) }, token);
      onCreated();
    } catch (err) {
      setUploadError((prev) => ({ ...prev, [product.id]: err.message }));
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
          <select value={category} onChange={(e) => { setCategory(e.target.value); setSubcategory(""); }} style={inputStyle}>
            {["Men", "Women"].map((c) => <option key={c}>{c}</option>)}
          </select>
          {(SUBCATEGORIES_BY_CATEGORY[category] || []).length > 0 && (
            <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} style={inputStyle}>
              <option value="">No subcategory</option>
              {SUBCATEGORIES_BY_CATEGORY[category].map((s) => <option key={s}>{s}</option>)}
            </select>
          )}
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
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.muted, margin: "2px 0 0" }}>{p.category}{p.subcategory ? ` · ${p.subcategory}` : ""}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: C.ink, fontWeight: 500, margin: 0 }}>{money(p.price)}</p>
                  {confirmRemoveId === p.id ? (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => removeProduct(p.id)} disabled={removingId === p.id} style={{ background: C.danger, color: C.warm, border: "none", padding: "5px 10px", fontFamily: "Inter, sans-serif", fontSize: 11, cursor: "pointer" }}>
                        {removingId === p.id ? "..." : "Confirm"}
                      </button>
                      <button onClick={() => setConfirmRemoveId(null)} style={{ background: "none", border: `1px solid ${C.line}`, padding: "5px 10px", fontFamily: "Inter, sans-serif", fontSize: 11, cursor: "pointer", color: C.char }}>Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmRemoveId(p.id)} title="Remove product" style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4 }}>
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                {(p.variants || []).map((v) => {
                  const key = `${p.id}-${v.id}`;
                  return (
                    <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 4, border: `1px solid ${C.line}`, padding: "4px 6px 4px 9px" }}>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.char }}>{v.size}:</span>
                      <input
                        type="number"
                        min="0"
                        value={stockDrafts[key] ?? v.stock_qty}
                        onChange={(e) => setStockDrafts((prev) => ({ ...prev, [key]: e.target.value }))}
                        style={{ width: 44, border: "none", fontFamily: "Inter, sans-serif", fontSize: 12, color: v.stock_qty === 0 ? C.danger : C.char, padding: "2px 2px", background: "transparent" }}
                      />
                      {stockDrafts[key] !== undefined && Number(stockDrafts[key]) !== v.stock_qty && (
                        <button onClick={() => saveStock(p.id, v.id)} disabled={savingStock === key} style={{ background: C.ink, color: C.warm, border: "none", padding: "3px 7px", fontFamily: "Inter, sans-serif", fontSize: 10, cursor: "pointer" }}>
                          {savingStock === key ? "..." : "Save"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>Photos</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 12 }}>
                  {(p.images || []).map((img, idx) => (
                    <div key={img.id} style={{ position: "relative" }}>
                      <img src={img.url} alt="" style={{ width: 64, height: 64, objectFit: "cover", display: "block", border: idx === 0 ? `2px solid ${C.ink}` : `1px solid ${C.line}` }} />
                      {idx === 0 ? (
                        <span style={{ position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)", background: C.ink, color: C.warm, fontSize: 9, padding: "1px 6px", borderRadius: 8, whiteSpace: "nowrap" }}>Primary</span>
                      ) : (
                        <button onClick={() => makePrimary(p, img.id)} title="Make primary photo" style={{ position: "absolute", bottom: -6, left: -6, background: C.warm, border: `1px solid ${C.line}`, borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <Star size={11} color={C.ink} />
                        </button>
                      )}
                      <button onClick={() => deleteImage(p.id, img.id)} style={{ position: "absolute", top: -6, right: -6, background: C.ink, color: C.warm, border: "none", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 11 }}>
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                  <label style={{ width: 64, height: 64, border: `1px dashed ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.muted }}>
                    {uploadingFor === p.id ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={16} />}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: "none" }}
                      onChange={(e) => { if (e.target.files[0]) uploadImage(p.id, e.target.files[0]); e.target.value = ""; }}
                      disabled={uploadingFor === p.id}
                    />
                  </label>
                </div>
                {uploadError[p.id] && <p style={{ color: C.danger, fontFamily: "Inter, sans-serif", fontSize: 12, marginTop: 8 }}>{uploadError[p.id]}</p>}
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
  const totalPayout = orderItems.filter((i) => i.payout_status !== "paid").reduce((s, i) => s + payoutOf(i).payout, 0);
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
      <div className="sadaar-scroll-table">
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", padding: "8px 10px", fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", color: C.muted, borderBottom: `1px solid ${C.line}` }}>
          <span>Item</span><span>Sale</span><span>Commission</span><span>Payout</span><span>Fulfillment</span><span>Paid out</span>
        </div>
        {orderItems.map((i) => {
          const { total, commission, payout } = payoutOf(i);
          return (
            <div key={i.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", padding: "10px", fontFamily: "Inter, sans-serif", fontSize: 13, borderBottom: `1px solid ${C.line}`, alignItems: "center" }}>
              <span>{i.product_name}</span>
              <span>{money(total)}</span>
              <span style={{ color: C.muted }}>{money(commission)}</span>
              <span style={{ color: C.ink, fontWeight: 500 }}>{money(payout)}</span>
              <Badge status={i.fulfillment_status} />
              {i.payout_status === "paid" ? (
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#2F5B3C" }}>Paid {i.payout_date ? new Date(i.payout_date).toLocaleDateString() : ""}</span>
              ) : (
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: C.muted }}>Pending</span>
              )}
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}

function Spotlight({ token, brandId }) {
  const [pricing, setPricing] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [purchase, setPurchase] = useState(null); // { id, price } once created (unpaid)
  const [paid, setPaid] = useState(false);
  const [publishableKey, setPublishableKey] = useState(null);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [debugMsg, setDebugMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pricingRes, historyRes, configRes] = await Promise.all([
        api("/spotlight/pricing"),
        api("/spotlight/mine", {}, token),
        api("/config/moyasar"),
      ]);
      setPricing(pricingRes);
      setHistory(historyRes);
      setPublishableKey(configRes.publishableKey);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const startPurchase = async (durationDays) => {
    setStarting(true);
    setError("");
    try {
      const result = await api("/spotlight", { method: "POST", body: JSON.stringify({ durationDays }) }, token);
      setPurchase(result);
      setSelectedDuration(durationDays);
      localStorage.setItem("sadaar_pending_spotlight", JSON.stringify({ id: result.id, price: result.price, durationDays }));
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  };

  // Once we have an unpaid purchase and Moyasar's key, mount the hosted card form —
  // identical pattern to the customer checkout's payment step.
  useEffect(() => {
    if (!purchase || !publishableKey || paid) return;
    setDebugMsg("Loading payment form...");

    const mount = () => {
      try {
        if (!document.querySelector(".mysr-spotlight-form") || !window.Moyasar) {
          setDebugMsg("Payment form not ready yet.");
          return;
        }
        window.Moyasar.init({
          element: ".mysr-spotlight-form",
          amount: Math.round(purchase.price * 100),
          currency: "SAR",
          description: `SADAAR spotlight — ${selectedDuration} days`,
          publishable_api_key: publishableKey,
          callback_url: window.location.origin + window.location.pathname,
          methods: ["creditcard"],
          on_completed: async (payment) => {
            try {
              await api(`/spotlight/${purchase.id}/confirm-payment`, { method: "POST", body: JSON.stringify({ paymentId: payment.id }) }, token);
              localStorage.removeItem("sadaar_pending_spotlight");
              setPaid(true);
              load();
            } catch (e) {
              setError(e.message);
            }
          },
        });
        setDebugMsg("");
      } catch (err) {
        setDebugMsg(`Error: ${err.message}`);
      }
    };

    const existing = document.querySelector('script[src*="moyasar.js"]');
    if (existing && window.Moyasar) { mount(); return; }

    const linkEl = document.createElement("link");
    linkEl.rel = "stylesheet";
    linkEl.href = "https://cdn.moyasar.com/mpf/1.7.3/moyasar.css";
    document.head.appendChild(linkEl);
    const script = document.createElement("script");
    script.src = "https://cdn.moyasar.com/mpf/1.7.3/moyasar.js";
    script.onload = mount;
    document.body.appendChild(script);
  }, [purchase, publishableKey, paid, selectedDuration, token, load]);

  if (loading) return <div><h1 style={h1}>Spotlight</h1><div style={{ marginTop: 20 }}><Loading /></div></div>;

  if (paid) {
    return (
      <div style={{ maxWidth: 420, textAlign: "center", padding: "60px 0" }}>
        <Check size={30} color={C.ink} style={{ marginBottom: 16 }} />
        <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 22, color: C.ink }}>You're spotlighted!</h1>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted, marginTop: 8, marginBottom: 20 }}>Your brand is now featured on the SADAAR homepage.</p>
        <button onClick={() => { setPurchase(null); setPaid(false); }} style={{ background: C.ink, color: C.warm, border: "none", padding: "10px 20px", fontFamily: "Inter, sans-serif", fontSize: 13, cursor: "pointer" }}>Back</button>
      </div>
    );
  }

  if (purchase) {
    return (
      <div style={{ maxWidth: 420 }}>
        <h1 style={h1}>Payment</h1>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted, margin: "8px 0 20px" }}>{selectedDuration}-day spotlight — {money(purchase.price)}</p>
        {error && <p style={{ color: C.danger, fontFamily: "Inter, sans-serif", fontSize: 13, marginBottom: 12 }}>{error}</p>}
        {debugMsg && <p style={{ color: C.muted, fontFamily: "monospace", fontSize: 11, marginBottom: 12 }}>{debugMsg}</p>}
        <div className="mysr-spotlight-form" />
      </div>
    );
  }

  const activeSpotlight = history.find((h) => h.payment_status === "paid" && new Date(h.ends_at) > new Date());

  return (
    <div>
      <h1 style={h1}>Spotlight</h1>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted, marginTop: 6, marginBottom: 20, maxWidth: 480 }}>
        Get your brand featured on the SADAAR homepage for extra visibility. Pick a duration below.
      </p>
      {error && <p style={{ color: C.danger, fontFamily: "Inter, sans-serif", fontSize: 13, marginBottom: 16 }}>{error}</p>}

      {activeSpotlight && (
        <div style={{ background: "#DDE7DB", border: "1px solid #2F5B3C", padding: 14, marginBottom: 20, fontFamily: "Inter, sans-serif", fontSize: 13, color: "#2F5B3C" }}>
          You're currently spotlighted until {new Date(activeSpotlight.ends_at).toLocaleDateString()}.
        </div>
      )}

      {pricing && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
          {Object.entries(pricing).map(([days, price]) => (
            <div key={days} style={{ background: C.warm, border: `1px solid ${C.line}`, padding: 20, minWidth: 160 }}>
              <p style={{ fontFamily: "Fraunces, serif", fontSize: 22, color: C.ink, margin: 0 }}>{days} days</p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: C.muted, margin: "6px 0 14px" }}>{money(price)}</p>
              <button onClick={() => startPurchase(Number(days))} disabled={starting} style={{ width: "100%", background: C.ink, color: C.warm, border: "none", padding: "9px 0", fontFamily: "Inter, sans-serif", fontSize: 13, cursor: "pointer" }}>
                {starting ? "..." : "Select"}
              </button>
            </div>
          ))}
        </div>
      )}

      <h2 style={h2}>History</h2>
      {history.length === 0 ? (
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted }}>No spotlight purchases yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {history.map((h) => (
            <div key={h.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: C.warm, border: `1px solid ${C.line}`, fontFamily: "Inter, sans-serif", fontSize: 13 }}>
              <span>{h.duration_days} days — {money(h.price)}</span>
              <span style={{ color: C.muted }}>
                {h.payment_status === "paid" ? `Active until ${new Date(h.ends_at).toLocaleDateString()}` : "Unpaid"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const BRAND_AUTH_KEY = "sadaar_brand_auth";

function getSavedBrandAuth() {
  try {
    const raw = localStorage.getItem(BRAND_AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveBrandAuth(tok, brandInfo) {
  try {
    if (tok && brandInfo) localStorage.setItem(BRAND_AUTH_KEY, JSON.stringify({ token: tok, brand: brandInfo }));
    else localStorage.removeItem(BRAND_AUTH_KEY);
  } catch {}
}

export default function BrandDashboard() {
  const saved = getSavedBrandAuth();
  const [token, setToken] = useState(saved?.token || null);
  const [brand, setBrand] = useState(saved?.brand || null);
  const [view, setView] = useState("overview");
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [returningSpotlight, setReturningSpotlight] = useState(null); // { status: 'checking'|'paid'|'error', message }

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

  // Restore data on a fresh page load if we already had a saved session
  // (e.g. right after a 3D Secure redirect wiped React's in-memory state).
  useEffect(() => {
    if (token && brand) loadData(token, brand);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle the return trip from Moyasar's 3D Secure redirect for a spotlight
  // purchase. Moyasar appends ?id=<payment_id> to callback_url and the page
  // fully reloads, so we recover the pending purchase from localStorage
  // (saved by the Spotlight component before showing the payment form) and
  // finish confirming it here, at the top level, regardless of which tab
  // the dashboard happens to land on after reload.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get("id");
    if (!paymentId) return;

    window.history.replaceState({}, "", window.location.pathname);

    const pendingRaw = localStorage.getItem("sadaar_pending_spotlight");
    if (!pendingRaw || !saved) {
      setReturningSpotlight({ status: "error", message: "Payment returned, but we lost track of which purchase it belongs to." });
      return;
    }
    const pending = JSON.parse(pendingRaw);
    setReturningSpotlight({ status: "checking" });

    api(`/spotlight/${pending.id}/confirm-payment`, { method: "POST", body: JSON.stringify({ paymentId }) }, saved.token)
      .then(() => {
        localStorage.removeItem("sadaar_pending_spotlight");
        setReturningSpotlight({ status: "paid" });
        setView("spotlight");
      })
      .catch((e) => {
        setReturningSpotlight({ status: "error", message: e.message });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = (tok, brandInfo) => {
    setToken(tok);
    setBrand(brandInfo);
    saveBrandAuth(tok, brandInfo);
    loadData(tok, brandInfo);
  };

  const logout = () => {
    setBrand(null);
    setToken(null);
    saveBrandAuth(null, null);
  };

  const refresh = () => { if (token && brand) loadData(token, brand); };

  if (!brand) return <LoginScreen onLogin={handleLogin} />;

  if (returningSpotlight) {
    return (
      <div style={{ minHeight: "100vh", background: C.sand, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <style>{FONTS}</style>
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          {returningSpotlight.status === "checking" && (
            <>
              <Loader2 size={28} color={C.ink} style={{ animation: "spin 1s linear infinite", marginBottom: 16 }} />
              <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
              <p style={{ fontFamily: "Fraunces, serif", fontSize: 18, color: C.ink }}>Confirming your payment...</p>
            </>
          )}
          {returningSpotlight.status === "paid" && (
            <>
              <Check size={30} color={C.ink} style={{ marginBottom: 16 }} />
              <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 22, color: C.ink }}>Payment received</h1>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.muted, marginTop: 8, marginBottom: 20 }}>Your brand is now spotlighted on the SADAAR homepage.</p>
              <button onClick={() => setReturningSpotlight(null)} style={{ background: C.ink, color: C.warm, border: "none", padding: "10px 20px", fontFamily: "Inter, sans-serif", fontSize: 13, cursor: "pointer" }}>Continue</button>
            </>
          )}
          {returningSpotlight.status === "error" && (
            <>
              <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 20, color: C.ink }}>We couldn't confirm that payment</h1>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: C.danger, marginTop: 8, marginBottom: 20 }}>{returningSpotlight.message}</p>
              <button onClick={() => setReturningSpotlight(null)} style={{ background: C.ink, color: C.warm, border: "none", padding: "10px 20px", fontFamily: "Inter, sans-serif", fontSize: 13, cursor: "pointer" }}>Continue</button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="sadaar-app-layout" style={{ display: "flex", background: C.sand, minHeight: "100vh" }}>
      <style>{FONTS}</style>
      <Sidebar brand={brand} view={view} setView={setView} onLogout={logout} />
      <main className="sadaar-main" style={{ flex: 1, padding: "32px 40px", maxWidth: 900 }}>
        {view === "overview" && <Overview products={products} orderItems={orderItems} loading={loading} />}
        {view === "products" && <Products products={products} loading={loading} token={token} onCreated={refresh} />}
        {view === "orders" && <Orders orderItems={orderItems} loading={loading} token={token} onUpdated={refresh} />}
        {view === "payouts" && <Payouts orderItems={orderItems} loading={loading} />}
        {view === "spotlight" && <Spotlight token={token} brandId={brand.id} />}
      </main>
    </div>
  );
}
