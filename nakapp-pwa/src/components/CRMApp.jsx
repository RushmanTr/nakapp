import { useState, useEffect, useCallback, useMemo } from "react";

const COUNTRIES = [
  "Türkiye", "Almanya", "ABD", "İngiltere", "Fransa", "İtalya", "İspanya",
  "Hollanda", "Belçika", "Avusturya", "İsviçre", "Rusya", "Çin", "Japonya",
  "Güney Kore", "Hindistan", "Brezilya", "Kanada", "Avustralya", "BAE",
  "Suudi Arabistan", "Mısır", "Gürcistan", "Azerbaycan", "Yunanistan",
  "Bulgaristan", "Romanya", "Polonya", "Çekya", "Macaristan", "Diğer"
];

const STATUS_MAP = {
  active: { label: "Aktif", bg: "#EAF3DE", color: "#3B6D11", border: "#97C459" },
  potential: { label: "Potansiyel", bg: "#E6F1FB", color: "#185FA5", border: "#85B7EB" },
  inactive: { label: "Pasif", bg: "#F1EFE8", color: "#5F5E5A", border: "#B4B2A9" }
};

const ORDER_STATUS = {
  production: { label: "Üretimde", bg: "#EEEDFE", color: "#534AB7", border: "#AFA9EC" },
  shipment: { label: "Sevkiyatta", bg: "#FAEEDA", color: "#854F0B", border: "#FAC775" },
  completed: { label: "Tamamlandı", bg: "#EAF3DE", color: "#3B6D11", border: "#97C459" }
};

const COLLECTION_STATUS = {
  pending: { label: "Bekliyor", bg: "#FAEEDA", color: "#854F0B", border: "#FAC775" },
  partial: { label: "Kısmi ödeme", bg: "#E6F1FB", color: "#185FA5", border: "#85B7EB" },
  paid: { label: "Tahsil edildi", bg: "#EAF3DE", color: "#3B6D11", border: "#97C459" },
  overdue: { label: "Gecikmiş", bg: "#FCEBEB", color: "#A32D2D", border: "#F09595" }
};

const initData = () => ({
  customers: [
    { id: "c1", name: "Müller GmbH", country: "Almanya", sector: "Otomotiv", status: "active", phone: "+49 170 1234567", email: "info@muller.de", notes: "Yıllık kontrat var", createdAt: "2024-01-15" },
    { id: "c2", name: "Yılmaz Tekstil", country: "Türkiye", sector: "Tekstil", status: "active", phone: "+90 532 1234567", email: "info@yilmaz.com.tr", notes: "3 ayda bir sipariş verir", createdAt: "2023-06-10" },
    { id: "c3", name: "Smith & Co", country: "İngiltere", sector: "Gıda", status: "potential", phone: "+44 7911 123456", email: "hello@smithco.uk", notes: "Fuar tanışması, ilgileniyor", createdAt: "2025-02-20" }
  ],
  orders: [
    { id: "o1", customerId: "c1", date: "2025-01-10", product: "Makine Parçası A", qty: 500, unitPrice: 12.5, costPrice: 8.2, currency: "EUR", orderStatus: "completed" },
    { id: "o2", customerId: "c1", date: "2025-04-15", product: "Makine Parçası B", qty: 300, unitPrice: 18, costPrice: 11, currency: "EUR", orderStatus: "shipment" },
    { id: "o3", customerId: "c2", date: "2024-09-01", product: "Polyester Kumaş", qty: 2000, unitPrice: 4.5, costPrice: 3.1, currency: "USD", orderStatus: "completed" },
    { id: "o4", customerId: "c2", date: "2025-01-05", product: "Pamuk İplik", qty: 1500, unitPrice: 6, costPrice: 4.2, currency: "USD", orderStatus: "completed" },
    { id: "o5", customerId: "c2", date: "2025-04-10", product: "Polyester Kumaş", qty: 2500, unitPrice: 4.8, costPrice: 3.2, currency: "USD", orderStatus: "production" }
  ],
  collections: [
    { id: "col1", orderId: "o1", customerId: "c1", amount: 6250, paidAmount: 6250, currency: "EUR", dueDate: "2025-02-10", status: "paid", notes: "" },
    { id: "col2", orderId: "o3", customerId: "c2", amount: 9000, paidAmount: 9000, currency: "USD", dueDate: "2024-10-01", status: "paid", notes: "" },
    { id: "col3", orderId: "o4", customerId: "c2", amount: 9000, paidAmount: 5000, currency: "USD", dueDate: "2025-02-05", status: "partial", notes: "Kalan 4000$ bekleniyor" }
  ],
  nextId: 20
});

const uid = (d) => { d.nextId = (d.nextId || 20) + 1; return "id" + d.nextId; };
const fmtCurrency = (v, cur = "USD") => {
  const sym = { USD: "$", EUR: "€", TRY: "₺", GBP: "£" };
  return (sym[cur] || cur + " ") + Number(v).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

const StatusBadge = ({ status }) => { const s = STATUS_MAP[status]; return <span style={{ display: "inline-block", fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}`, letterSpacing: 0.3, marginLeft: 6 }}>{s.label}</span>; };
const OrderStatusBadge = ({ status }) => { const s = ORDER_STATUS[status] || ORDER_STATUS.production; return <span style={{ display: "inline-block", fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.label}</span>; };
const CollectionBadge = ({ status }) => { const s = COLLECTION_STATUS[status] || COLLECTION_STATUS.pending; return <span style={{ display: "inline-block", fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}`, marginLeft: 6 }}>{s.label}</span>; };

const Modal = ({ open, onClose, title, children, width = 520 }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "min(90vw," + width + "px)", maxHeight: "85vh", overflow: "auto", border: "0.5px solid var(--color-border-tertiary)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "0.5px solid var(--color-border-tertiary)", background: "#fff" }}>
          <span style={{ fontWeight: 500, fontSize: 16 }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--color-text-secondary)", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: "16px 20px", background: "#fff" }}>{children}</div>
      </div>
    </div>
  );
};
const Field = ({ label, children }) => (<div style={{ marginBottom: 14 }}><label style={{ display: "block", fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4, fontWeight: 500 }}>{label}</label>{children}</div>);
const inputStyle = { width: "100%", padding: "8px 12px", fontSize: 14, borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "#fff", color: "#222", boxSizing: "border-box" };

const navItems = [
  { key: "dashboard", icon: "G", label: "Genel" },
  { key: "customers", icon: "M", label: "Müşteriler" },
  { key: "orders", icon: "S", label: "Siparişler" },
  { key: "collections", icon: "T", label: "Tahsilat" },
  { key: "completed", icon: "OK", label: "Tamamlananlar" },
  { key: "drive", icon: "D", label: "Drive" },
  { key: "reminders", icon: "H", label: "Hatırlatmalar" },
  { key: "import", icon: "I", label: "İçe Aktar AI" }
];

export default function CRMApp() {
  const [data, setData] = useState(() => initData());
  const [page, setPage] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [sideOpen, setSideOpen] = useState(true);
  const [toast, setToast] = useState(null);
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [selectedCustomers, setSelectedCustomers] = useState(new Set());
  const [driveFiles, setDriveFiles] = useState([
    { id: "f1", name: "Proforma_Müller_GmbH_2025.pdf", customerId: "c1", date: "2025-01-08", size: "245 KB" },
    { id: "f2", name: "Proforma_Yılmaz_Tekstil_Q1.pdf", customerId: "c2", date: "2025-01-03", size: "312 KB" },
    { id: "f3", name: "Teklif_Smith_Co_Draft.pdf", customerId: "c3", date: "2025-02-18", size: "189 KB" }
  ]);
  const [driveSearch, setDriveSearch] = useState("");
  const [driveCustomerFilter, setDriveCustomerFilter] = useState("all");
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [statusDropdown, setStatusDropdown] = useState(null);
  const [expandedOrderCustomer, setExpandedOrderCustomer] = useState(null);
  const [groupStatusDropdown, setGroupStatusDropdown] = useState(null);
  const [aiImport, setAiImport] = useState({ step: "idle", loading: false, fileName: "", preview: null, editPreview: null, error: null });
  const [marketData, setMarketData] = useState({ usd: 44.35, eur: 51.55, gold: 6305, loading: false, error: null, lastUpdate: "10:00" });
  const [marketInitialized, setMarketInitialized] = useState(false);

  const fetchMarketData = useCallback(async (silent = false) => {
    if (!silent) setMarketData(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          system: "Sen bir finans veri asistanısın. SADECE JSON döndür, başka metin yazma.",
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: "Güncel USD/TRY, EUR/TRY ve gram altın TL fiyatını bul. SADECE JSON döndür: {\"usd\":44.35,\"eur\":51.55,\"gold\":6300}" }]
        })
      });
      if (!res.ok) throw new Error("err");
      const json = await res.json();
      let allText = "";
      if (json.content) for (const b of json.content) if (b.type === "text") allText += " " + b.text;
      const m = allText.replace(/```json|```/g, "").match(/\{[^{}]*"usd"\s*:\s*[\d.]+[^{}]*\}/i);
      if (m) {
        const p = JSON.parse(m[0]);
        if (p.usd > 0) { setMarketData({ usd: p.usd, eur: p.eur, gold: p.gold, loading: false, error: null, lastUpdate: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) }); return; }
      }
      setMarketData(prev => ({ ...prev, loading: false }));
    } catch {
      setMarketData(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => { if (!marketInitialized) { setMarketInitialized(true); fetchMarketData(true); } }, [marketInitialized, fetchMarketData]);

  const showToast = useCallback((msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500); }, []);
  const save = useCallback((newData) => { setData({ ...newData }); }, []);

  const customerStats = useMemo(() => {
    const stats = {};
    data.customers.forEach(c => {
      const orders = data.orders.filter(o => o.customerId === c.id).sort((a, b) => new Date(a.date) - new Date(b.date));
      const totalRevenue = orders.reduce((s, o) => s + o.qty * o.unitPrice, 0);
      const totalCost = orders.reduce((s, o) => s + o.qty * o.costPrice, 0);
      const totalProfit = totalRevenue - totalCost;
      const margin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;
      let avgDays = null;
      if (orders.length >= 2) { const gaps = []; for (let i = 1; i < orders.length; i++) gaps.push(daysBetween(orders[i - 1].date, orders[i].date)); avgDays = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length); }
      const lastOrder = orders.length ? orders[orders.length - 1].date : null;
      let nextExpected = null, isOverdue = false;
      if (lastOrder && avgDays) { const next = new Date(lastOrder); next.setDate(next.getDate() + avgDays); nextExpected = next.toISOString().slice(0, 10); isOverdue = new Date(nextExpected) <= new Date(); }
      stats[c.id] = { orders, totalRevenue, totalCost, totalProfit, margin, avgDays, lastOrder, nextExpected, isOverdue };
    });
    return stats;
  }, [data]);

  const overdueCustomers = useMemo(() => data.customers.filter(c => customerStats[c.id]?.isOverdue && c.status === "active"), [data.customers, customerStats]);
  const pendingCollections = useMemo(() => data.collections.filter(c => c.status !== "paid"), [data.collections]);

  const filteredCustomers = useMemo(() => {
    let list = data.customers;
    if (statusFilter !== "all") list = list.filter(c => c.status === statusFilter);
    if (search) { const q = search.toLowerCase(); list = list.filter(c => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q)); }
    return list;
  }, [data.customers, statusFilter, search]);

  const openCustomerForm = (c = null) => { setEditItem(c || { name: "", country: "Türkiye", sector: "", status: "potential", phone: "", email: "", notes: "" }); setModal("customer"); };
  const saveCustomer = (form) => { const d = { ...data }; if (form.id) { d.customers = d.customers.map(c => c.id === form.id ? { ...form } : c); } else { form.id = uid(d); form.createdAt = new Date().toISOString().slice(0, 10); d.customers = [...d.customers, form]; } save(d); setModal(null); showToast(form.id ? "Müşteri güncellendi" : "Müşteri eklendi"); };
  const deleteCustomer = (id) => { if (!confirm("Bu müşteriyi silmek istediğinize emin misiniz?")) return; const d = { ...data }; d.customers = d.customers.filter(c => c.id !== id); d.orders = d.orders.filter(o => o.customerId !== id); d.collections = d.collections.filter(c => c.customerId !== id); save(d); showToast("Müşteri silindi", "warn"); };

  const openOrderForm = (o = null, customerId = null) => { setEditItem(o || { customerId: customerId || "", date: new Date().toISOString().slice(0, 10), product: "", qty: "", unitPrice: "", costPrice: "", currency: "USD", orderStatus: "production" }); setModal("order"); };

  const autoCreateCollection = (d, order) => {
    const exists = d.collections.some(c => c.orderId === order.id);
    if (exists) return;
    const totalAmount = order.qty * order.unitPrice;
    const dueDate = new Date(); dueDate.setDate(dueDate.getDate() + 30);
    d.collections.push({ id: uid(d), orderId: order.id, customerId: order.customerId, amount: totalAmount, paidAmount: 0, currency: order.currency, dueDate: dueDate.toISOString().slice(0, 10), status: "pending", notes: "" });
  };

  const saveOrder = (form) => {
    const d = { ...data }; form.qty = Number(form.qty); form.unitPrice = Number(form.unitPrice); form.costPrice = Number(form.costPrice);
    const wasCompleted = form.id ? data.orders.find(o => o.id === form.id)?.orderStatus === "completed" : false;
    if (form.id) { d.orders = d.orders.map(o => o.id === form.id ? { ...form } : o); } else { form.id = uid(d); d.orders = [...d.orders, form]; }
    if (form.orderStatus === "completed" && !wasCompleted) { autoCreateCollection(d, form); showToast("Sipariş tamamlandı — tahsilata aktarıldı"); } else { showToast(form.id ? "Sipariş güncellendi" : "Sipariş eklendi"); }
    save(d); setModal(null);
  };
  const deleteOrder = (id) => { if (!confirm("Bu siparişi silmek istediğinize emin misiniz?")) return; const d = { ...data }; d.orders = d.orders.filter(o => o.id !== id); save(d); showToast("Sipariş silindi", "warn"); };

  const setOrderStatus = (orderId, newStatus) => {
    const d = { ...data }; const order = d.orders.find(o => o.id === orderId); if (!order) return;
    const wasCompleted = order.orderStatus === "completed"; order.orderStatus = newStatus;
    if (newStatus === "completed" && !wasCompleted) { autoCreateCollection(d, order); showToast("Sipariş tamamlandı — tahsilata aktarıldı"); } else { showToast(`Durum: ${ORDER_STATUS[newStatus].label}`); }
    save(d); setStatusDropdown(null);
  };

  const updateCollection = (id, updates) => {
    const d = { ...data };
    d.collections = d.collections.map(c => { if (c.id !== id) return c; const u = { ...c, ...updates }; if (u.paidAmount >= u.amount) u.status = "paid"; else if (u.paidAmount > 0) u.status = "partial"; else if (new Date(u.dueDate) < new Date()) u.status = "overdue"; else u.status = "pending"; return u; });
    save(d); showToast("Tahsilat güncellendi");
  };

  const sendWhatsApp = (phone, name, msg) => { const p = phone.replace(/[\s\-\(\)]/g, "").replace(/^\+/, ""); window.open(`https://wa.me/${p}?text=${encodeURIComponent(msg || `Merhaba ${name}, yeni siparişinizi bekliyoruz.`)}`, "_blank"); };

  const handleCSVImport = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { try { const lines = ev.target.result.split("\n").filter(l => l.trim()); const headers = lines[0].split(/[,;\t]/).map(h => h.trim().toLowerCase()); const d = { ...data }; let count = 0; for (let i = 1; i < lines.length; i++) { const vals = lines[i].split(/[,;\t]/).map(v => v.trim().replace(/^"|"$/g, "")); if (vals.length < 2) continue; const row = {}; headers.forEach((h, idx) => { row[h] = vals[idx] || ""; }); const cust = { id: uid(d), name: row["name"] || row["müşteri"] || row["firma"] || row["ad"] || vals[0], country: row["country"] || row["ülke"] || "Türkiye", sector: row["sector"] || row["sektör"] || row["faaliyet"] || "", status: "potential", phone: row["phone"] || row["telefon"] || "", email: row["email"] || row["eposta"] || "", notes: row["notes"] || row["not"] || "", createdAt: new Date().toISOString().slice(0, 10) }; if (["aktif", "active"].includes((row["status"] || row["durum"] || "").toLowerCase())) cust.status = "active"; else if (["pasif", "inactive"].includes((row["status"] || row["durum"] || "").toLowerCase())) cust.status = "inactive"; d.customers.push(cust); count++; } save(d); showToast(`${count} müşteri içe aktarıldı`); } catch { showToast("Dosya okunamadı", "error"); } };
    reader.readAsText(file);
  };

  // ══════════════════════ PAGES ══════════════════════

  const renderDashboard = () => {
    const activeCount = data.customers.filter(c => c.status === "active").length;
    const potentialCount = data.customers.filter(c => c.status === "potential").length;
    const totalRevenue = Object.values(customerStats).reduce((s, c) => s + c.totalRevenue, 0);
    const totalProfit = Object.values(customerStats).reduce((s, c) => s + c.totalProfit, 0);
    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;
    const pendingAmount = pendingCollections.reduce((s, c) => s + (c.amount - c.paidAmount), 0);
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>Genel</h2>
          <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>

        {/* Market Data */}
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)" }}>Piyasa verileri</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {marketData.lastUpdate && <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{marketData.lastUpdate}</span>}
              <button onClick={() => fetchMarketData(false)} style={{ background: "var(--color-background-secondary)", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 11, cursor: "pointer", color: "var(--color-text-secondary)" }}>↻</button>
            </div>
          </div>
          {marketData.loading ? (
            <div style={{ display: "flex", gap: 12 }}>
              {[1,2,3,4].map(i => (<div key={i} style={{ flex: 1, background: "var(--color-background-secondary)", borderRadius: 10, padding: "14px 16px", height: 60 }}><div style={{ width: "60%", height: 10, background: "var(--color-border-tertiary)", borderRadius: 4, marginBottom: 8 }} /><div style={{ width: "40%", height: 16, background: "var(--color-border-tertiary)", borderRadius: 4 }} /></div>))}
            </div>
          ) : marketData.error ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
              <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{marketData.error}</span>
              <button onClick={() => fetchMarketData(false)} style={{ background: "#E6F1FB", border: "1px solid #85B7EB", borderRadius: 8, padding: "4px 12px", fontSize: 12, cursor: "pointer", color: "#185FA5", fontWeight: 500 }}>Tekrar dene</button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <div style={{ background: "#E6F1FB", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 12, color: "#0C447C", marginBottom: 4, fontWeight: 500 }}>USD/TRY</div>
                <div style={{ fontSize: 22, fontWeight: 500, color: "#185FA5" }}>{marketData.usd ? Number(marketData.usd).toFixed(4) : "—"}</div>
                <div style={{ fontSize: 11, color: "#0C447C", marginTop: 2 }}>Canlı piyasa</div>
              </div>
              <div style={{ background: "#EEEDFE", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 12, color: "#3C3489", marginBottom: 4, fontWeight: 500 }}>EUR/TRY</div>
                <div style={{ fontSize: 22, fontWeight: 500, color: "#534AB7" }}>{marketData.eur ? Number(marketData.eur).toFixed(4) : "—"}</div>
                <div style={{ fontSize: 11, color: "#3C3489", marginTop: 2 }}>Canlı piyasa</div>
              </div>
              <div style={{ background: "#E1F5EE", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 12, color: "#085041", marginBottom: 4, fontWeight: 500 }}>EUR/USD</div>
                <div style={{ fontSize: 22, fontWeight: 500, color: "#0F6E56" }}>{marketData.usd && marketData.eur ? (marketData.eur / marketData.usd).toFixed(4) : "—"}</div>
                <div style={{ fontSize: 11, color: "#085041", marginTop: 2 }}>Hesaplanan</div>
              </div>
              <div style={{ background: "#FAEEDA", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 12, color: "#633806", marginBottom: 4, fontWeight: 500 }}>Gram altın</div>
                <div style={{ fontSize: 22, fontWeight: 500, color: "#854F0B" }}>{marketData.gold ? "₺" + Number(marketData.gold).toLocaleString("tr-TR") : "—"}</div>
                <div style={{ fontSize: 11, color: "#633806", marginTop: 2 }}>Canlı piyasa</div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 28 }}>
          {[{ label: "Toplam sipariş", value: data.orders.length, accent: "#534AB7" }, { label: "Ort. kar marjı", value: avgMargin.toFixed(1) + "%", accent: "#D85A30" }, { label: "Bekleyen tahsilat", value: fmtCurrency(pendingAmount), accent: "#A32D2D" }].map((m, i) => (
            <div key={i} style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4, fontWeight: 500 }}>{m.label}</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: m.accent }}>{m.value}</div>
            </div>
          ))}
        </div>
        {overdueCustomers.length > 0 && (
          <div style={{ background: "#FAEEDA", border: "1px solid #FAC775", borderRadius: 12, padding: "14px 18px", marginBottom: 24 }}>
            <div style={{ fontWeight: 500, fontSize: 14, color: "#854F0B", marginBottom: 8 }}>Sipariş zamanı gelen müşteriler</div>
            {overdueCustomers.map(c => { const s = customerStats[c.id]; return (
              <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #FAC77544" }}>
                <div><span style={{ fontWeight: 500, fontSize: 14, color: "#412402" }}>{c.name}</span><span style={{ fontSize: 12, color: "#854F0B", marginLeft: 8 }}>Son: {s.lastOrder} — Beklenen: {s.nextExpected}</span></div>
                <button onClick={() => sendWhatsApp(c.phone, c.name)} style={{ background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>WhatsApp</button>
              </div>); })}
          </div>
        )}
        {pendingCollections.length > 0 && (
          <div style={{ background: "#FCEBEB", border: "1px solid #F09595", borderRadius: 12, padding: "14px 18px", marginBottom: 24 }}>
            <div style={{ fontWeight: 500, fontSize: 14, color: "#791F1F", marginBottom: 8 }}>Bekleyen tahsilatlar ({pendingCollections.length})</div>
            {pendingCollections.slice(0, 3).map(col => { const cust = data.customers.find(c => c.id === col.customerId); return (
              <div key={col.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
                <span style={{ color: "#501313" }}>{cust?.name || "—"}</span>
                <span style={{ fontWeight: 500, color: "#A32D2D" }}>{fmtCurrency(col.amount - col.paidAmount, col.currency)}</span>
              </div>); })}
            {pendingCollections.length > 3 && <div style={{ fontSize: 12, color: "#791F1F", marginTop: 4 }}>+{pendingCollections.length - 3} daha...</div>}
          </div>
        )}
        <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 12 }}>En iyi müşteriler</div>
        <div style={{ display: "grid", gap: 10 }}>
          {data.customers.filter(c => customerStats[c.id]?.totalRevenue > 0).sort((a, b) => customerStats[b.id].totalRevenue - customerStats[a.id].totalRevenue).slice(0, 5).map((c, i) => { const s = customerStats[c.id]; return (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500, fontSize: 13, color: "#534AB7", flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 500, fontSize: 14 }}>{c.name}</div><div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{c.country} — {c.sector}</div></div>
              <div style={{ textAlign: "right", flexShrink: 0 }}><div style={{ fontWeight: 500, fontSize: 14 }}>{fmtCurrency(s.totalRevenue)}</div><div style={{ fontSize: 12, color: s.margin > 25 ? "#3B6D11" : "#D85A30" }}>%{s.margin.toFixed(1)} kar</div></div>
            </div>); })}
        </div>
      </div>
    );
  };

  const toggleSelectCustomer = (id, e) => {
    e.stopPropagation();
    setSelectedCustomers(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };
  const toggleSelectAll = () => {
    if (selectedCustomers.size === filteredCustomers.length) setSelectedCustomers(new Set());
    else setSelectedCustomers(new Set(filteredCustomers.map(c => c.id)));
  };
  const deleteSelected = () => {
    if (selectedCustomers.size === 0) return;
    if (!confirm(`${selectedCustomers.size} müşteriyi silmek istediğinize emin misiniz?`)) return;
    const d = { ...data };
    d.customers = d.customers.filter(c => !selectedCustomers.has(c.id));
    d.orders = d.orders.filter(o => !selectedCustomers.has(o.customerId));
    d.collections = d.collections.filter(c => !selectedCustomers.has(c.customerId));
    save(d); setSelectedCustomers(new Set()); showToast(`${selectedCustomers.size} müşteri silindi`, "warn");
  };

  const renderCustomers = () => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>Müşteriler</h2>
        <div style={{ display: "flex", gap: 8 }}>
          {selectedCustomers.size > 0 && (
            <button onClick={deleteSelected} style={{ background: "#FCEBEB", color: "#A32D2D", border: "1px solid #F09595", borderRadius: 8, padding: "8px 18px", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
              {selectedCustomers.size} seçili sil
            </button>
          )}
          <button onClick={() => openCustomerForm()} style={{ background: "#D85A30", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>+ Yeni müşteri</button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input placeholder="Ara... (ad, ülke, sektör)" value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 180 }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 120 }}><option value="all">Tümü</option><option value="active">Aktif</option><option value="potential">Potansiyel</option><option value="inactive">Pasif</option></select>
      </div>
      {filteredCustomers.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, padding: "0 16px" }}>
          <div onClick={toggleSelectAll} style={{
            width: 18, height: 18, borderRadius: 3, border: `2px solid ${selectedCustomers.size === filteredCustomers.length && filteredCustomers.length > 0 ? "#534AB7" : "#B4B2A9"}`,
            background: selectedCustomers.size === filteredCustomers.length && filteredCustomers.length > 0 ? "#EEEDFE" : "transparent",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>
            {selectedCustomers.size === filteredCustomers.length && filteredCustomers.length > 0 && <span style={{ color: "#534AB7", fontSize: 12, fontWeight: 700, lineHeight: 1 }}>✓</span>}
            {selectedCustomers.size > 0 && selectedCustomers.size < filteredCustomers.length && <span style={{ color: "#534AB7", fontSize: 12, fontWeight: 700, lineHeight: 1 }}>—</span>}
          </div>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
            {selectedCustomers.size > 0 ? `${selectedCustomers.size} / ${filteredCustomers.length} seçili` : "Tümünü seç"}
          </span>
        </div>
      )}
      <div style={{ display: "grid", gap: 6 }}>
        {filteredCustomers.map(c => { const s = customerStats[c.id]; const isOpen = expandedCustomer === c.id; const isSelected = selectedCustomers.has(c.id); return (
          <div key={c.id} style={{ background: "var(--color-background-primary)", border: isSelected ? "1px solid #AFA9EC" : isOpen ? "1px solid var(--color-border-primary)" : "0.5px solid var(--color-border-tertiary)", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "10px 16px", cursor: "pointer", gap: 12, userSelect: "none" }}>
              <div onClick={(e) => toggleSelectCustomer(c.id, e)} style={{
                width: 18, height: 18, borderRadius: 3, border: `2px solid ${isSelected ? "#534AB7" : "#B4B2A9"}`,
                background: isSelected ? "#EEEDFE" : "transparent",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                {isSelected && <span style={{ color: "#534AB7", fontSize: 12, fontWeight: 700, lineHeight: 1 }}>✓</span>}
              </div>
              <span onClick={() => setExpandedCustomer(isOpen ? null : c.id)} style={{ fontSize: 11, transition: "transform 0.2s", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", color: "var(--color-text-secondary)", flexShrink: 0, width: 14, textAlign: "center" }}>&#9654;</span>
              <div onClick={() => setExpandedCustomer(isOpen ? null : c.id)} style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, background: STATUS_MAP[c.status].bg, border: `1px solid ${STATUS_MAP[c.status].border}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500, fontSize: 11, color: STATUS_MAP[c.status].color }}>{c.name.slice(0, 2).toUpperCase()}</div>
              <div onClick={() => setExpandedCustomer(isOpen ? null : c.id)} style={{ flex: 1, minWidth: 0 }}><span style={{ fontWeight: 500, fontSize: 14 }}>{c.name}</span></div>
              <span style={{ fontSize: 12, color: "var(--color-text-secondary)", flexShrink: 0 }}>{c.country}</span>
              <StatusBadge status={c.status} />
              {s?.isOverdue && c.status === "active" && <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 20, background: "#FAEEDA", color: "#854F0B", flexShrink: 0 }}>!</span>}
              {s && s.orders.length > 0 && <span style={{ fontSize: 12, color: "var(--color-text-secondary)", flexShrink: 0 }}>{s.orders.length} sipariş</span>}
            </div>
            {isOpen && (
              <div style={{ padding: "0 16px 14px 52px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 12, fontSize: 13, color: "var(--color-text-secondary)" }}><span>{c.sector}</span>{c.phone && <span>{c.phone}</span>}{c.email && <span>{c.email}</span>}</div>
                {c.notes && <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 6, fontStyle: "italic" }}>{c.notes}</div>}
                {s && s.orders.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8, marginTop: 12 }}>
                    <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "8px 12px" }}><div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Toplam ciro</div><div style={{ fontWeight: 500, fontSize: 15 }}>{fmtCurrency(s.totalRevenue)}</div></div>
                    <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "8px 12px" }}><div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Kar marjı</div><div style={{ fontWeight: 500, fontSize: 15, color: s.margin > 25 ? "#3B6D11" : "#D85A30" }}>%{s.margin.toFixed(1)}</div></div>
                    {s.avgDays && <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "8px 12px" }}><div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Ort. sipariş aralığı</div><div style={{ fontWeight: 500, fontSize: 15 }}>{s.avgDays} gün</div></div>}
                    {s.nextExpected && <div style={{ background: s.isOverdue ? "#FAEEDA" : "var(--color-background-secondary)", borderRadius: 8, padding: "8px 12px" }}><div style={{ fontSize: 11, color: s.isOverdue ? "#854F0B" : "var(--color-text-secondary)" }}>Sonraki beklenen</div><div style={{ fontWeight: 500, fontSize: 15, color: s.isOverdue ? "#854F0B" : "var(--color-text-primary)" }}>{s.nextExpected}</div></div>}
                  </div>
                )}
                {s && s.orders.length > 0 && (
                  <div style={{ marginTop: 12 }}><div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6 }}>Son siparişler</div>
                    {s.orders.slice(-3).reverse().map(o => (
                      <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, padding: "5px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                        <span style={{ color: "var(--color-text-secondary)", width: 72, flexShrink: 0 }}>{o.date}</span><span style={{ flex: 1 }}>{o.product}</span>
                        <OrderStatusBadge status={o.orderStatus || "production"} />
                        <span style={{ fontWeight: 500 }}>{fmtCurrency(o.qty * o.unitPrice, o.currency)}</span>
                      </div>))}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                  <button onClick={() => openOrderForm(null, c.id)} style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>+ Sipariş ekle</button>
                  <button onClick={() => openCustomerForm(c)} style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>Düzenle</button>
                  {c.phone && <button onClick={() => sendWhatsApp(c.phone, c.name)} style={{ background: "#E1F5EE", border: "1px solid #5DCAA5", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", color: "#0F6E56", fontWeight: 500 }}>WhatsApp</button>}
                  <button onClick={() => deleteCustomer(c.id)} style={{ background: "#FCEBEB", border: "1px solid #F09595", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", color: "#A32D2D", fontWeight: 500, marginLeft: "auto" }}>Sil</button>
                </div>
              </div>
            )}
          </div>); })}
        {filteredCustomers.length === 0 && <div style={{ padding: 32, textAlign: "center", color: "var(--color-text-secondary)" }}>Müşteri bulunamadı</div>}
      </div>
    </div>
  );

  const renderOrders = () => {
    const activeOrders = data.orders.filter(o => o.orderStatus !== "completed").sort((a, b) => new Date(b.date) - new Date(a.date));
    // Group by customer
    const grouped = {};
    activeOrders.forEach(o => {
      const cust = data.customers.find(c => c.id === o.customerId);
      const name = cust?.name || "Bilinmeyen";
      if (!grouped[o.customerId]) grouped[o.customerId] = { name, country: cust?.country || "", orders: [] };
      grouped[o.customerId].orders.push(o);
    });
    const groups = Object.entries(grouped);

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>Aktif siparişler</h2>
          <button onClick={() => openOrderForm()} style={{ background: "#D85A30", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>+ Yeni sipariş</button>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {groups.map(([custId, group]) => {
            const isOpen = expandedOrderCustomer === custId;
            const totalRev = group.orders.reduce((s, o) => s + o.qty * o.unitPrice, 0);
            const cur = group.orders[0]?.currency || "USD";
            return (
              <div key={custId} style={{ background: "var(--color-background-primary)", border: isOpen ? "1px solid var(--color-border-primary)" : "0.5px solid var(--color-border-tertiary)", borderRadius: 10 }}>
                {/* Customer header row */}
                <div onClick={() => setExpandedOrderCustomer(isOpen ? null : custId)} style={{ display: "flex", alignItems: "center", padding: "12px 16px", cursor: "pointer", gap: 10, userSelect: "none" }}>
                  <span style={{ fontSize: 11, transition: "transform 0.2s", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", color: "var(--color-text-secondary)", flexShrink: 0, width: 14, textAlign: "center" }}>&#9654;</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 500, fontSize: 14 }}>{group.name}</span>
                    <span style={{ fontSize: 12, color: "var(--color-text-secondary)", marginLeft: 8 }}>{group.country}</span>
                  </div>
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)", flexShrink: 0 }}>{group.orders.length} sipariş</span>
                  {/* Status dropdown trigger */}
                  {(() => {
                    const statusCounts = {};
                    group.orders.forEach(o => { const s = o.orderStatus || "production"; statusCounts[s] = (statusCounts[s] || 0) + 1; });
                    const dropdownKey = custId + "-grp";
                    const isDropOpen = groupStatusDropdown === dropdownKey;
                    return (
                      <div style={{ position: "relative", flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setGroupStatusDropdown(isDropOpen ? null : dropdownKey)} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: "2px 4px" }}>
                          {Object.entries(statusCounts).map(([s, cnt]) => {
                            const st = ORDER_STATUS[s] || ORDER_STATUS.production;
                            return <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 2 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: st.color }} /><span style={{ fontSize: 11, color: st.color, fontWeight: 500 }}>{cnt}</span></span>;
                          })}
                          <span style={{ fontSize: 14, color: "#666", marginLeft: 2, fontWeight: 500 }}>&#9660;</span>
                        </button>
                        {isDropOpen && (
                          <div style={{ position: "absolute", top: "110%", right: 0, zIndex: 200, background: "#fff", border: "0.5px solid #ccc", borderRadius: 8, minWidth: 210, boxShadow: "0 6px 16px rgba(0,0,0,0.15)" }}>
                            <div style={{ padding: "8px 12px", fontSize: 11, color: "#888", borderBottom: "1px solid #eee" }}>Tüm siparişleri değiştir</div>
                            {Object.entries(ORDER_STATUS).map(([key, val]) => (
                              <div key={key} onClick={() => {
                                const d = { ...data };
                                group.orders.forEach(o => {
                                  const order = d.orders.find(x => x.id === o.id);
                                  if (order) {
                                    const wasCompleted = order.orderStatus === "completed";
                                    order.orderStatus = key;
                                    if (key === "completed" && !wasCompleted) autoCreateCollection(d, order);
                                  }
                                });
                                save(d);
                                setGroupStatusDropdown(null);
                                showToast(group.orders.length + " sipariş: " + val.label);
                              }} style={{ padding: "8px 14px", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 8, background: "#fff", color: "#222" }}
                                onMouseEnter={e => e.currentTarget.style.background = "#f0f0f0"}
                                onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                              >
                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: val.color, flexShrink: 0 }} />
                                <span style={{ flex: 1 }}>{val.label}</span>
                                <span style={{ fontSize: 11, color: "#aaa" }}>{statusCounts[key] || 0}/{group.orders.length}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  <span style={{ fontSize: 13, fontWeight: 500, flexShrink: 0 }}>{fmtCurrency(totalRev, cur)}</span>
                </div>

                {/* Expanded orders table */}
                {isOpen && (
                  <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", padding: "0 16px 12px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 8 }}>
                      <thead><tr>
                        {["Tarih", "Ürün", "Miktar", "Toplam", "Kar", "Marj", "Durum", ""].map(h => (<th key={h} style={{ padding: "6px 8px", textAlign: "left", fontWeight: 500, fontSize: 11, color: "var(--color-text-secondary)" }}>{h}</th>))}
                      </tr></thead>
                      <tbody>{group.orders.map(o => {
                        const revenue = o.qty * o.unitPrice;
                        const profit = revenue - o.qty * o.costPrice;
                        const margin = revenue > 0 ? (profit / revenue * 100) : 0;
                        const isDropdownOpen = statusDropdown === o.id;
                        return (
                          <tr key={o.id} style={{ borderTop: "0.5px solid var(--color-border-tertiary)" }}>
                            <td style={{ padding: "8px" }}>{o.date}</td>
                            <td style={{ padding: "8px" }}>{o.product}</td>
                            <td style={{ padding: "8px" }}>{o.qty.toLocaleString()}</td>
                            <td style={{ padding: "8px", fontWeight: 500 }}>{fmtCurrency(revenue, o.currency)}</td>
                            <td style={{ padding: "8px", color: profit > 0 ? "#3B6D11" : "#A32D2D", fontWeight: 500 }}>{fmtCurrency(profit, o.currency)}</td>
                            <td style={{ padding: "8px" }}><span style={{ background: margin > 25 ? "#EAF3DE" : margin > 15 ? "#FAEEDA" : "#FCEBEB", color: margin > 25 ? "#3B6D11" : margin > 15 ? "#854F0B" : "#A32D2D", padding: "2px 6px", borderRadius: 20, fontSize: 11, fontWeight: 500 }}>%{margin.toFixed(1)}</span></td>
                            <td style={{ padding: "8px", position: "relative" }}>
                              <button onClick={(e) => { e.stopPropagation(); setStatusDropdown(isDropdownOpen ? null : o.id); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                                <OrderStatusBadge status={o.orderStatus || "production"} />
                                <span style={{ fontSize: 10, marginLeft: 4, color: "var(--color-text-secondary)" }}>▼</span>
                              </button>
                              {isDropdownOpen && (
                                <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 100, background: "#fff", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, overflow: "hidden", minWidth: 140, boxShadow: "0 4px 12px rgba(0,0,0,0.12)" }}>
                                  {Object.entries(ORDER_STATUS).map(([key, val]) => {
                                    const isActive = (o.orderStatus || "production") === key;
                                    return (<div key={key} onClick={(e) => { e.stopPropagation(); setOrderStatus(o.id, key); }} style={{ padding: "8px 14px", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 8, background: isActive ? "#f0f0f0" : "#fff", color: "#222" }} onMouseEnter={e => e.currentTarget.style.background = "#f0f0f0"} onMouseLeave={e => e.currentTarget.style.background = isActive ? "#f0f0f0" : "#fff"}>
                                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: val.color, flexShrink: 0 }} />{val.label}
                                    </div>);
                                  })}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: "8px" }}><div style={{ display: "flex", gap: 4 }}>
                              <button onClick={(e) => { e.stopPropagation(); openOrderForm(o); }} style={{ background: "var(--color-background-secondary)", border: "none", borderRadius: 4, padding: "2px 6px", fontSize: 13, cursor: "pointer" }}>✎</button>
                              <button onClick={(e) => { e.stopPropagation(); deleteOrder(o.id); }} style={{ background: "#FCEBEB", border: "none", borderRadius: 4, padding: "2px 6px", fontSize: 13, cursor: "pointer", color: "#A32D2D" }}>×</button>
                            </div></td>
                          </tr>);
                      })}</tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {activeOrders.length === 0 && <div style={{ padding: 32, textAlign: "center", color: "var(--color-text-secondary)" }}>Tüm siparişler tamamlanmış</div>}
        <div style={{ marginTop: 12, fontSize: 12, color: "var(--color-text-secondary)", padding: "8px 10px", background: "var(--color-background-secondary)", borderRadius: 8 }}>
          Durum rozetine tıklayıp açılan menüden seçim yapın. Tamamlanan siparişler otomatik olarak tahsilata ve "Tamamlananlar" sekmesine aktarılır.
        </div>
      </div>
    );
  };

  const renderCollections = () => {
    const unpaid = data.collections.filter(c => c.status !== "paid");
    const filtered = collectionFilter === "all" ? unpaid : unpaid.filter(c => c.status === collectionFilter);
    const sorted = [...filtered].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    const totalPending = unpaid.reduce((s, c) => s + (c.amount - c.paidAmount), 0);
    const totalPaid = data.collections.filter(c => c.status === "paid").reduce((s, c) => s + c.paidAmount, 0);
    return (
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 16 }}>Tahsilat takibi</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
          <div style={{ background: "#FCEBEB", borderRadius: 10, padding: "14px 16px" }}><div style={{ fontSize: 12, color: "#791F1F", marginBottom: 4, fontWeight: 500 }}>Bekleyen toplam</div><div style={{ fontSize: 22, fontWeight: 500, color: "#A32D2D" }}>{fmtCurrency(totalPending)}</div></div>
          <div style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "14px 16px" }}><div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4, fontWeight: 500 }}>Bekleyen kayıt</div><div style={{ fontSize: 22, fontWeight: 500 }}>{unpaid.length}</div></div>
        </div>
        <div style={{ marginBottom: 16 }}><select value={collectionFilter} onChange={e => setCollectionFilter(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 160 }}><option value="all">Tümü</option><option value="pending">Bekliyor</option><option value="partial">Kısmi ödeme</option><option value="overdue">Gecikmiş</option></select></div>
        <div style={{ display: "grid", gap: 8 }}>
          {sorted.map(col => {
            const cust = data.customers.find(c => c.id === col.customerId); const order = data.orders.find(o => o.id === col.orderId);
            const remaining = col.amount - col.paidAmount; const progress = col.amount > 0 ? (col.paidAmount / col.amount * 100) : 0;
            const daysLeft = daysBetween(new Date().toISOString().slice(0, 10), col.dueDate);
            return (
              <div key={col.id} style={{ background: "var(--color-background-primary)", border: `0.5px solid ${col.status === "overdue" ? "#F09595" : "var(--color-border-tertiary)"}`, borderRadius: 12, padding: "14px 18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div onClick={() => updateCollection(col.id, { paidAmount: col.amount })} title="Tahsilatı tamamla" style={{
                      width: 22, height: 22, borderRadius: 4, border: "2px solid #B4B2A9", cursor: "pointer", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s"
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#3B6D11"; e.currentTarget.style.background = "#EAF3DE"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#B4B2A9"; e.currentTarget.style.background = "transparent"; }}
                    />
                    <div><span style={{ fontWeight: 500, fontSize: 15 }}>{cust?.name || "—"}</span><CollectionBadge status={col.status} />{order && <span style={{ fontSize: 12, color: "var(--color-text-secondary)", marginLeft: 8 }}>{order.product}</span>}</div>
                  </div>
                  <div style={{ textAlign: "right" }}><div style={{ fontWeight: 500, fontSize: 16 }}>{fmtCurrency(col.amount, col.currency)}</div>{remaining > 0 && <div style={{ fontSize: 12, color: "#A32D2D" }}>Kalan: {fmtCurrency(remaining, col.currency)}</div>}</div>
                </div>
                <div style={{ background: "var(--color-background-tertiary)", borderRadius: 6, height: 6, marginBottom: 10, overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 6, width: progress + "%", background: progress >= 100 ? "#3B6D11" : progress > 0 ? "#185FA5" : "transparent", transition: "width 0.3s" }} /></div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", gap: 14, color: "var(--color-text-secondary)" }}>
                    <span>Vade: {col.dueDate}</span>
                    <span style={{ color: daysLeft < 0 ? "#A32D2D" : daysLeft <= 7 ? "#854F0B" : "var(--color-text-secondary)" }}>{daysLeft < 0 ? `${Math.abs(daysLeft)} gün gecikmiş` : `${daysLeft} gün kaldı`}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {col.status !== "paid" && <button onClick={() => { const val = prompt("Ödenen tutarı girin:", col.paidAmount); if (val !== null) updateCollection(col.id, { paidAmount: Number(val) }); }} style={{ background: "#E6F1FB", border: "1px solid #85B7EB", borderRadius: 8, padding: "5px 12px", fontSize: 12, cursor: "pointer", color: "#185FA5", fontWeight: 500 }}>Ödeme gir</button>}
                    {col.status !== "paid" && cust?.phone && <button onClick={() => sendWhatsApp(cust.phone, cust.name, `Merhaba ${cust.name}, ${fmtCurrency(remaining, col.currency)} tutarındaki ödemeniz ${col.dueDate} tarihinde beklenmektedir.`)} style={{ background: "#E1F5EE", border: "1px solid #5DCAA5", borderRadius: 8, padding: "5px 12px", fontSize: 12, cursor: "pointer", color: "#0F6E56", fontWeight: 500 }}>Hatırlat</button>}
                    {col.status === "paid" && <span style={{ fontSize: 12, color: "#3B6D11", fontWeight: 500 }}>Tamamlandı</span>}
                  </div>
                </div>
                {col.notes && <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 6, fontStyle: "italic" }}>{col.notes}</div>}
              </div>
            );
          })}
          {sorted.length === 0 && <div style={{ padding: 32, textAlign: "center", color: "var(--color-text-secondary)" }}>Tahsilat kaydı bulunamadı</div>}
        </div>
      </div>
    );
  };

  const renderCompleted = () => {
    const completedOrders = data.orders.filter(o => o.orderStatus === "completed").sort((a, b) => new Date(b.date) - new Date(a.date));
    const paidCollections = data.collections.filter(c => c.status === "paid");
    const totalCompletedRevenue = completedOrders.reduce((s, o) => s + o.qty * o.unitPrice, 0);
    const totalCollected = paidCollections.reduce((s, c) => s + c.paidAmount, 0);
    return (
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 16 }}>Tamamlanan siparişler ve tahsilatlar</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
          <div style={{ background: "#EAF3DE", borderRadius: 10, padding: "14px 16px" }}><div style={{ fontSize: 12, color: "#27500A", marginBottom: 4, fontWeight: 500 }}>Tamamlanan sipariş</div><div style={{ fontSize: 22, fontWeight: 500, color: "#3B6D11" }}>{completedOrders.length}</div></div>
          <div style={{ background: "#EAF3DE", borderRadius: 10, padding: "14px 16px" }}><div style={{ fontSize: 12, color: "#27500A", marginBottom: 4, fontWeight: 500 }}>Toplam ciro</div><div style={{ fontSize: 22, fontWeight: 500, color: "#3B6D11" }}>{fmtCurrency(totalCompletedRevenue)}</div></div>
          <div style={{ background: "#E6F1FB", borderRadius: 10, padding: "14px 16px" }}><div style={{ fontSize: 12, color: "#0C447C", marginBottom: 4, fontWeight: 500 }}>Tahsil edilen</div><div style={{ fontSize: 22, fontWeight: 500, color: "#185FA5" }}>{fmtCurrency(totalCollected)}</div></div>
        </div>

        {completedOrders.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}>Tamamlanan siparişler</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ borderBottom: "1px solid var(--color-border-tertiary)" }}>
                  {["Tarih", "Müşteri", "Ürün", "Miktar", "Toplam", "Kar", "Marj"].map(h => (<th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 500, fontSize: 12, color: "var(--color-text-secondary)" }}>{h}</th>))}
                </tr></thead>
                <tbody>{completedOrders.map(o => {
                  const cust = data.customers.find(c => c.id === o.customerId);
                  const revenue = o.qty * o.unitPrice; const profit = revenue - o.qty * o.costPrice; const margin = revenue > 0 ? (profit / revenue * 100) : 0;
                  return (
                    <tr key={o.id} style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                      <td style={{ padding: "10px" }}>{o.date}</td>
                      <td style={{ padding: "10px", fontWeight: 500 }}>{cust?.name || "—"}</td>
                      <td style={{ padding: "10px" }}>{o.product}</td>
                      <td style={{ padding: "10px" }}>{o.qty.toLocaleString()}</td>
                      <td style={{ padding: "10px", fontWeight: 500 }}>{fmtCurrency(revenue, o.currency)}</td>
                      <td style={{ padding: "10px", color: profit > 0 ? "#3B6D11" : "#A32D2D", fontWeight: 500 }}>{fmtCurrency(profit, o.currency)}</td>
                      <td style={{ padding: "10px" }}><span style={{ background: margin > 25 ? "#EAF3DE" : margin > 15 ? "#FAEEDA" : "#FCEBEB", color: margin > 25 ? "#3B6D11" : margin > 15 ? "#854F0B" : "#A32D2D", padding: "2px 8px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>%{margin.toFixed(1)}</span></td>
                    </tr>);
                })}</tbody>
              </table>
            </div>
          </div>
        )}

        {paidCollections.length > 0 && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}>Tahsil edilen ödemeler</div>
            <div style={{ display: "grid", gap: 8 }}>
              {paidCollections.map(col => {
                const cust = data.customers.find(c => c.id === col.customerId); const order = data.orders.find(o => o.id === col.orderId);
                return (
                  <div key={col.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "12px 16px" }}>
                    <div onClick={() => updateCollection(col.id, { paidAmount: 0 })} title="Tahsilatı geri al" style={{
                      width: 22, height: 22, borderRadius: 4, border: "2px solid #3B6D11", background: "#EAF3DE", cursor: "pointer", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s"
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#A32D2D"; e.currentTarget.style.background = "#FCEBEB"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#3B6D11"; e.currentTarget.style.background = "#EAF3DE"; }}
                    >
                      <span style={{ color: "#3B6D11", fontWeight: 700, fontSize: 14, lineHeight: 1 }}>✓</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{cust?.name || "—"}</div>
                      <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{order?.product || "—"} — Vade: {col.dueDate}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: 14, color: "#3B6D11" }}>{fmtCurrency(col.paidAmount, col.currency)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: "var(--color-text-secondary)", padding: "6px 10px", background: "var(--color-background-secondary)", borderRadius: 8 }}>
              Tik kutusuna tıklayarak tahsilatı geri alıp tekrar tahsilat sekmesine gönderebilirsiniz.
            </div>
          </div>
        )}

        {completedOrders.length === 0 && paidCollections.length === 0 && <div style={{ padding: 32, textAlign: "center", color: "var(--color-text-secondary)" }}>Henüz tamamlanan sipariş yok</div>}
      </div>
    );
  };

  const renderReminders = () => {
    const activeWithOrders = data.customers.filter(c => c.status === "active" && customerStats[c.id]?.nextExpected).map(c => ({ ...c, ...customerStats[c.id] })).sort((a, b) => new Date(a.nextExpected) - new Date(b.nextExpected));
    const potentialCustomers = data.customers.filter(c => c.status === "potential").map(c => ({ ...c, daysSinceCreated: daysBetween(c.createdAt, new Date().toISOString().slice(0, 10)) })).sort((a, b) => b.daysSinceCreated - a.daysSinceCreated);
    const pendingCols = data.collections.filter(c => c.status !== "paid" && new Date(c.dueDate) <= new Date(Date.now() + 7 * 86400000)).map(c => { const cu = data.customers.find(x => x.id === c.customerId); return { ...c, customerName: cu?.name || "—", customerPhone: cu?.phone }; });
    return (
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 16 }}>Hatırlatmalar ve bildirimler</h2>
        {activeWithOrders.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 10, color: "#854F0B" }}>Sipariş zamanı gelen aktif müşteriler</div>
            <div style={{ display: "grid", gap: 8 }}>
              {activeWithOrders.map(c => { const dl = daysBetween(new Date().toISOString().slice(0, 10), c.nextExpected); const urgent = dl <= 0; return (
                <div key={c.id} style={{ background: "var(--color-background-primary)", border: `1px solid ${urgent ? "#F09595" : "#FAC775"}`, borderRadius: 12, padding: "12px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div><span style={{ fontWeight: 500, fontSize: 14 }}>{c.name}</span><StatusBadge status="active" /><span style={{ display: "inline-block", fontSize: 11, padding: "2px 8px", borderRadius: 20, marginLeft: 6, background: urgent ? "#FCEBEB" : "#FAEEDA", color: urgent ? "#791F1F" : "#854F0B", fontWeight: 500 }}>{urgent ? `${Math.abs(dl)} gün gecikmiş` : `${dl} gün kaldı`}</span></div>
                    {c.phone && <button onClick={() => sendWhatsApp(c.phone, c.name, `Merhaba ${c.name}, son siparişinizin üzerinden ${c.avgDays} gün geçti. Yeni sipariş vermek ister misiniz?`)} style={{ background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>WhatsApp</button>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4, display: "flex", gap: 16, flexWrap: "wrap" }}><span>Son: {c.lastOrder}</span><span>Beklenen: {c.nextExpected}</span><span>Ort. aralık: {c.avgDays} gün</span></div>
                </div>); })}
            </div>
          </div>
        )}
        {pendingCols.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 10, color: "#A32D2D" }}>Yaklaşan / gecikmiş tahsilatlar</div>
            <div style={{ display: "grid", gap: 8 }}>
              {pendingCols.map(c => { const rem = c.amount - c.paidAmount; const dl = daysBetween(new Date().toISOString().slice(0, 10), c.dueDate); return (
                <div key={c.id} style={{ background: "var(--color-background-primary)", border: `1px solid ${dl < 0 ? "#F09595" : "#FAC775"}`, borderRadius: 12, padding: "12px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div><span style={{ fontWeight: 500, fontSize: 14 }}>{c.customerName}</span><span style={{ fontSize: 13, color: "#A32D2D", marginLeft: 8, fontWeight: 500 }}>{fmtCurrency(rem, c.currency)}</span><span style={{ fontSize: 11, color: dl < 0 ? "#791F1F" : "#854F0B", marginLeft: 8 }}>{dl < 0 ? `${Math.abs(dl)} gün gecikmiş` : `${dl} gün kaldı`}</span></div>
                    {c.customerPhone && <button onClick={() => sendWhatsApp(c.customerPhone, c.customerName, `Merhaba ${c.customerName}, ${fmtCurrency(rem, c.currency)} tutarındaki ödemeniz beklenmektedir.`)} style={{ background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>Hatırlat</button>}
                  </div>
                </div>); })}
            </div>
          </div>
        )}
        {potentialCustomers.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 10, color: "#185FA5" }}>Potansiyel müşteriler — takip et</div>
            <div style={{ display: "grid", gap: 8 }}>
              {potentialCustomers.map(c => (
                <div key={c.id} style={{ background: "var(--color-background-primary)", border: "1px solid #85B7EB", borderRadius: 12, padding: "12px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div><span style={{ fontWeight: 500, fontSize: 14 }}>{c.name}</span><StatusBadge status="potential" /><span style={{ fontSize: 12, color: "var(--color-text-secondary)", marginLeft: 8 }}>{c.daysSinceCreated} gündür takipte — {c.country}, {c.sector}</span></div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {c.phone && <button onClick={() => sendWhatsApp(c.phone, c.name, `Merhaba ${c.name}, daha önce görüştüğümüz konuyla ilgili tekrar iletişime geçmek istiyoruz.`)} style={{ background: "#1D9E75", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>WhatsApp</button>}
                      <button onClick={() => { const d = { ...data }; d.customers = d.customers.map(cu => cu.id === c.id ? { ...cu, status: "active" } : cu); save(d); showToast(`${c.name} aktif müşteriye çevrildi`); }} style={{ background: "#E6F1FB", border: "1px solid #85B7EB", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", color: "#185FA5", fontWeight: 500 }}>Aktife al</button>
                    </div>
                  </div>
                  {c.notes && <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 4, fontStyle: "italic" }}>{c.notes}</div>}
                </div>))}
            </div>
          </div>
        )}
        {activeWithOrders.length === 0 && potentialCustomers.length === 0 && pendingCols.length === 0 && <div style={{ padding: 32, textAlign: "center", color: "var(--color-text-secondary)" }}>Henüz hatırlatma yok</div>}
      </div>
    );
  };

  const renderDrive = () => {
    const filtered = driveFiles.filter(f => { const ms = !driveSearch || f.name.toLowerCase().includes(driveSearch.toLowerCase()); const mc = driveCustomerFilter === "all" || f.customerId === driveCustomerFilter; return ms && mc; }).sort((a, b) => new Date(b.date) - new Date(a.date));
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <h2 style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>Drive — Proforma ve belgeler</h2>
          <button onClick={() => { const name = prompt("Dosya adı:"); if (name) { setDriveFiles([...driveFiles, { id: "f" + Date.now(), name, customerId: driveCustomerFilter !== "all" ? driveCustomerFilter : "", date: new Date().toISOString().slice(0, 10), size: "—" }]); showToast("Dosya eklendi"); }}} style={{ background: "#D85A30", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>+ Dosya ekle</button>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <input placeholder="Dosya ara..." value={driveSearch} onChange={e => setDriveSearch(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 180 }} />
          <select value={driveCustomerFilter} onChange={e => setDriveCustomerFilter(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 160 }}><option value="all">Tüm müşteriler</option>{data.customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          {filtered.map(f => { const cust = data.customers.find(c => c.id === f.customerId); const isPdf = f.name.toLowerCase().endsWith(".pdf"); const isDoc = f.name.toLowerCase().includes(".doc"); const isXls = f.name.toLowerCase().includes(".xls"); const iconColor = isPdf ? "#A32D2D" : isDoc ? "#185FA5" : isXls ? "#3B6D11" : "#534AB7"; const iconBg = isPdf ? "#FCEBEB" : isDoc ? "#E6F1FB" : isXls ? "#EAF3DE" : "#EEEDFE"; const iconText = isPdf ? "PDF" : isDoc ? "DOC" : isXls ? "XLS" : "FILE"; return (
            <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "10px 16px" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500, fontSize: 10, color: iconColor, flexShrink: 0 }}>{iconText}</div>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 500, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div><div style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "flex", gap: 12 }}>{cust && <span>{cust.name}</span>}<span>{f.date}</span><span>{f.size}</span></div></div>
              <button onClick={() => { setDriveFiles(driveFiles.filter(x => x.id !== f.id)); showToast("Dosya silindi", "warn"); }} style={{ background: "#FCEBEB", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 13, cursor: "pointer", color: "#A32D2D", flexShrink: 0 }}>×</button>
            </div>); })}
          {filtered.length === 0 && <div style={{ padding: 32, textAlign: "center", color: "var(--color-text-secondary)" }}>Dosya bulunamadı</div>}
        </div>
      </div>
    );
  };

  const handleAIFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    setAiImport({ step: "analyzing", loading: true, fileName: file.name, preview: null, editPreview: null, error: null });

    try {
      const ext = file.name.split(".").pop().toLowerCase();
      let text = "";

      if (ext === "pdf") {
        const arrayBuf = await file.arrayBuffer();
        const pdfjsLib = await new Promise((resolve, reject) => {
          if (window.pdfjsLib) { resolve(window.pdfjsLib); return; }
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
          script.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"; resolve(window.pdfjsLib); };
          script.onerror = () => reject("PDF kutuphanesi yuklenemedi");
          document.head.appendChild(script);
        });
        const pdf = await pdfjsLib.getDocument({ data: arrayBuf }).promise;
        for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
          const page = await pdf.getPage(i);
          const tc = await page.getTextContent();
          const items = tc.items.map(it => ({ str: it.str, x: Math.round(it.transform[4]), y: Math.round(it.transform[5]) }));
          const lineMap = {};
          items.forEach(it => { const key = it.y; if (!lineMap[key]) lineMap[key] = []; lineMap[key].push(it); });
          Object.keys(lineMap).map(Number).sort((a, b) => b - a).forEach(y => { text += lineMap[y].sort((a, b) => a.x - b.x).map(it => it.str).join(" ") + "\n"; });
        }
      } else {
        text = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => res(""); r.readAsText(file); });
      }

      if (!text.trim()) throw new Error("Dosyadan metin cikarilmadi");

      let company = "", country = "", phone = "", email = "", sector = "Ambalaj", proformaNo = "", proformaDate = "";
      const products = [];
      const countryMap = { "IRAQ":"Irak","IRAN":"Iran","TURKEY":"Turkiye","GERMANY":"Almanya","UK":"Ingiltere","ENGLAND":"Ingiltere","USA":"ABD","FRANCE":"Fransa","ITALY":"Italya","SPAIN":"Ispanya","NETHERLANDS":"Hollanda","UAE":"BAE","SAUDI ARABIA":"Suudi Arabistan","EGYPT":"Misir","GEORGIA":"Gurcistan","AZERBAIJAN":"Azerbaycan","GREECE":"Yunanistan","BULGARIA":"Bulgaristan","ROMANIA":"Romanya","POLAND":"Polonya","LIBYA":"Libya","JORDAN":"Urdun","LEBANON":"Lubnan","SYRIA":"Suriye","KUWAIT":"Kuveyt","QATAR":"Katar","PAKISTAN":"Pakistan","INDIA":"Hindistan","CHINA":"Cin","JAPAN":"Japonya","RUSSIA":"Rusya","BRAZIL":"Brezilya","CANADA":"Kanada","AUSTRALIA":"Avustralya" };

      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

      for (const line of lines) {
        const up = line.toUpperCase();
        if (up.includes("COMPANY") && line.includes(":")) { const v = line.substring(line.indexOf(":")+1).trim().replace(/COMPANY\s*OFFICIAL.*/i,"").trim(); if (v.length > 1 && !v.toUpperCase().startsWith("OFFICIAL")) company = v; }
        if ((up.includes("ADRESS") || up.includes("ADDRESS")) && line.includes(":")) { const v = line.substring(line.indexOf(":")+1).trim(); for (const [e,t] of Object.entries(countryMap)) { if (v.toUpperCase().includes(e)) { country = t; break; } } if (!country && v.length > 1) country = v; }
        if (!country) { for (const [e,t] of Object.entries(countryMap)) { if (up === e || (up.includes(e) && !up.includes("BANK") && !up.includes("IBAN") && up.length < 40)) { country = t; break; } } }
        if (up.includes("PROFORMA NO") || up.includes("INVOICE NO")) { const m = line.match(/[:\s]([A-Z]{0,4}-?\d{3,})/i); if (m) proformaNo = m[1].trim(); }
        if (up.includes("DATE") && !up.includes("UPDATE")) { const m = line.match(/(\d{1,2}[.\/\-]\d{1,2}[.\/\-]\d{2,4})/); if (m) proformaDate = m[1]; }
        if ((up.includes("PCS") || up.includes("ADET")) && (line.includes("$") || line.includes("\u20ac") || line.includes("\u00a3"))) {
          const nums = []; const re = /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,4})?)/g; let mm;
          while ((mm = re.exec(line)) !== null) nums.push(mm[1]);
          if (nums.length >= 3) {
            let desc = line.replace(/(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,4})?)/g," ").replace(/PCS|ADET|LABEL|UNIT|\$|mm/gi," ").replace(/GLOSSY\s*PAPER\s*\+?\s*\w*/gi,"").replace(/^\s*\d+\s+/,"").replace(/\s+/g," ").trim();
            if (desc.length < 2) desc = "Urun";
            const sizeM = line.match(/(\d+\s*x\s*\d+\s*mm)/i);
            const paperM = line.match(/(GLOSSY\s*PAPER\s*\+?\s*\w+|MATT\s*PAPER|KRAFT)/i);
            const pn = nums.map(n => parseFloat(n.replace(/\./g,"").replace(",",".")));
            const qty = Math.max(...pn.filter(n => n >= 100));
            const subtotal = pn[pn.length - 1] || 0;
            const unitP = pn.find(n => n < 1 && n > 0) || (qty > 0 && subtotal > 0 ? subtotal / qty : 0);
            let cur = "USD";
            if (line.includes("\u20ac")) cur = "EUR";
            else if (line.includes("\u20ba")) cur = "TRY";
            else if (line.includes("\u00a3")) cur = "GBP";
            if (qty > 0) products.push({ name: desc, size: sizeM?sizeM[1]:"", paper: paperM?paperM[1].trim():"", qty: Math.round(qty), unitPrice: Math.round(unitP*10000)/10000, subtotal: Math.round(subtotal*100)/100, currency: cur });
          }
        }
      }

      const totalAmount = products.reduce((s,p) => s + p.subtotal, 0);
      if (!company) company = file.name.replace(/\.[^.]+$/,"").replace(/[_-]/g," ");
      if (products.length === 0) products.push({ name:"", size:"", paper:"", qty:0, unitPrice:0, subtotal:0, currency:"USD" });
      const preview = { company, country, sector, phone, email, proformaNo, proformaDate, products, totalAmount };
      setAiImport({ step: "preview", loading: false, fileName: file.name, preview, editPreview: JSON.parse(JSON.stringify(preview)), error: null });
    } catch (err) {
      setAiImport({ step: "error", loading: false, fileName: file.name, preview: null, editPreview: null, error: err.message || "Dosya islenemedi" });
    }
  };

  const approveAIImport = () => {
    const p = aiImport.editPreview;
    if (!p) return;
    const d = { ...data };
    const custId = uid(d);
    d.customers.push({ id: custId, name: p.company, country: p.country, sector: p.sector, status: "active", phone: p.phone, email: p.email, notes: "Proforma: " + (p.proformaNo||"-") + " / " + (p.proformaDate||"-"), createdAt: new Date().toISOString().slice(0,10) });
    p.products.forEach(prod => {
      if (prod.qty > 0 || prod.name) {
        const dateStr = p.proformaDate ? p.proformaDate.split(".").reverse().join("-") : new Date().toISOString().slice(0,10);
        d.orders.push({ id: uid(d), customerId: custId, date: dateStr, product: [prod.name, prod.size, prod.paper].filter(Boolean).join(" - "), qty: Number(prod.qty)||0, unitPrice: Number(prod.unitPrice)||0, costPrice: 0, currency: prod.currency||"USD", orderStatus: "production" });
      }
    });
    save(d);
    // Drive'a dosya ekle
    setDriveFiles(prev => [...prev, {
      id: "f" + Date.now(),
      name: aiImport.fileName,
      customerId: custId,
      date: new Date().toISOString().slice(0, 10),
      size: "—"
    }]);
    showToast(p.company + " eklendi — Drive'a kaydedildi");
    setAiImport({ step: "idle", loading: false, fileName: "", preview: null, editPreview: null, error: null });
  };

  const renderImport = () => {
    const st = aiImport;
    const ep = st.editPreview;
    const updEp = (key, val) => setAiImport(prev => ({ ...prev, editPreview: { ...prev.editPreview, [key]: val } }));
    const updProduct = (idx, key, val) => setAiImport(prev => {
      const prods = [...prev.editPreview.products];
      prods[idx] = { ...prods[idx], [key]: val };
      return { ...prev, editPreview: { ...prev.editPreview, products: prods } };
    });

    return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 16 }}>İçe Aktar AI</h2>

      {/* STEP: IDLE — file upload */}
      {(st.step === "idle" || st.step === "error") && (
        <div style={{ background: "#fff", border: "1px solid #D85A30", borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 12, color: "#D85A30" }}>AI ile akıllı müşteri ekleme</div>
          <p style={{ fontSize: 14, color: "#444", marginBottom: 16, lineHeight: 1.6 }}>
            Proforma, fatura veya müşteri dosyanızı yükleyin. AI otomatik analiz eder, ön izleme gösterir ve onayınıza sunar.
          </p>
          {st.error && <div style={{ background: "#FCEBEB", border: "1px solid #F09595", borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 13, color: "#791F1F" }}>{st.error}</div>}
          <div style={{ position: "relative" }}>
            <input type="file" accept=".pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png,.tif,.tiff" id="ai-file-input" style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", top: 0, left: 0, cursor: "pointer", zIndex: 2 }} onChange={handleAIFileUpload} />
            <div style={{ border: "2px dashed #D85A30", borderRadius: 12, padding: 28, textAlign: "center", background: "#FFFAF7", position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 36, marginBottom: 8, color: "#D85A30", lineHeight: 1 }}>+</div>
              <div style={{ fontWeight: 500, fontSize: 15, color: "#D85A30", marginBottom: 6 }}>Dosya seçmek için tıklayın</div>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>PDF, Excel, Word veya görsel (JPG, PNG, TIF)</div>
              <div style={{ display: "inline-block", background: "#D85A30", color: "#fff", borderRadius: 8, padding: "10px 24px", fontSize: 13, fontWeight: 500 }}>Dosya Seç</div>
            </div>
          </div>
        </div>
      )}

      {/* STEP: ANALYZING */}
      {st.step === "analyzing" && (
        <div style={{ background: "#fff", border: "1px solid #D85A30", borderRadius: 12, padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 12, color: "#D85A30" }}>...</div>
          <div style={{ fontWeight: 500, fontSize: 16, color: "#D85A30", marginBottom: 8 }}>AI analiz ediyor</div>
          <div style={{ fontSize: 14, color: "#888" }}>{st.fileName}</div>
          <div style={{ fontSize: 13, color: "#aaa", marginTop: 8 }}>Bu işlem birkaç saniye sürebilir...</div>
          <button onClick={() => setAiImport({ step: "idle", loading: false, fileName: "", preview: null, editPreview: null, error: null })} style={{ marginTop: 16, padding: "8px 20px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13, color: "#666" }}>İptal</button>
        </div>
      )}

      {/* STEP: PREVIEW — editable */}
      {st.step === "preview" && ep && (
        <div style={{ background: "#fff", border: "1px solid #D85A30", borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 16, color: "#D85A30" }}>Ön izleme</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{st.fileName}</div>
            </div>
            <div style={{ fontSize: 12, color: "#0F6E56", background: "#E1F5EE", padding: "4px 10px", borderRadius: 20, fontWeight: 500 }}>Analiz tamamlandı</div>
          </div>

          {st.error && <div style={{ background: "#FAEEDA", border: "1px solid #FAC775", borderRadius: 8, padding: 10, marginBottom: 14, fontSize: 12, color: "#854F0B" }}>{st.error}</div>}

          {/* Proforma bilgileri */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #eee" }}>
            <div><label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 4, fontWeight: 500 }}>Proforma No</label><input style={inputStyle} value={ep.proformaNo || ""} onChange={e => updEp("proformaNo", e.target.value)} /></div>
            <div><label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 4, fontWeight: 500 }}>Tarih</label><input style={inputStyle} value={ep.proformaDate || ""} onChange={e => updEp("proformaDate", e.target.value)} /></div>
          </div>

          {/* Müşteri bilgileri */}
          <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #eee" }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#333", marginBottom: 8 }}>Müşteri bilgileri</div>
            <div style={{ marginBottom: 10 }}><label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 4, fontWeight: 500 }}>Firma adı</label><input style={inputStyle} value={ep.company} onChange={e => updEp("company", e.target.value)} /></div>
            <div style={{ marginBottom: 10 }}><label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 4, fontWeight: 500 }}>Ülke</label><input style={inputStyle} value={ep.country} onChange={e => updEp("country", e.target.value)} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 4, fontWeight: 500 }}>Telefon</label><input style={inputStyle} value={ep.phone} onChange={e => updEp("phone", e.target.value)} /></div>
              <div><label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 4, fontWeight: 500 }}>E-posta</label><input style={inputStyle} value={ep.email} onChange={e => updEp("email", e.target.value)} /></div>
            </div>
          </div>

          {/* Ürünler tablosu */}
          {ep.products && ep.products.length > 0 && (
            <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #eee" }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#333", marginBottom: 8 }}>Ürünler / Siparişler</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead><tr style={{ background: "#f8f8f8" }}>
                    <th style={{ padding: "6px 8px", textAlign: "left", color: "#888", fontWeight: 500 }}>Ürün</th>
                    <th style={{ padding: "6px 8px", textAlign: "left", color: "#888", fontWeight: 500 }}>Boyut</th>
                    <th style={{ padding: "6px 8px", textAlign: "left", color: "#888", fontWeight: 500 }}>Kağıt</th>
                    <th style={{ padding: "6px 8px", textAlign: "right", color: "#888", fontWeight: 500 }}>Miktar</th>
                    <th style={{ padding: "6px 8px", textAlign: "right", color: "#888", fontWeight: 500 }}>Birim fiyat</th>
                    <th style={{ padding: "6px 8px", textAlign: "right", color: "#888", fontWeight: 500 }}>Toplam</th>
                  </tr></thead>
                  <tbody>
                    {ep.products.map((prod, idx) => (
                      <tr key={idx} style={{ borderBottom: "0.5px solid #eee" }}>
                        <td style={{ padding: "6px 8px" }}><input style={{ ...inputStyle, padding: "4px 8px", fontSize: 12 }} value={prod.name || ""} onChange={e => updProduct(idx, "name", e.target.value)} /></td>
                        <td style={{ padding: "6px 8px" }}><input style={{ ...inputStyle, padding: "4px 8px", fontSize: 12, width: 80 }} value={prod.size || ""} onChange={e => updProduct(idx, "size", e.target.value)} /></td>
                        <td style={{ padding: "6px 8px" }}><input style={{ ...inputStyle, padding: "4px 8px", fontSize: 12, width: 100 }} value={prod.paper || ""} onChange={e => updProduct(idx, "paper", e.target.value)} /></td>
                        <td style={{ padding: "6px 8px", textAlign: "right" }}><input style={{ ...inputStyle, padding: "4px 8px", fontSize: 12, width: 70, textAlign: "right" }} type="number" value={prod.qty || ""} onChange={e => updProduct(idx, "qty", e.target.value)} /></td>
                        <td style={{ padding: "6px 8px", textAlign: "right" }}><input style={{ ...inputStyle, padding: "4px 8px", fontSize: 12, width: 70, textAlign: "right" }} type="number" step="0.001" value={prod.unitPrice || ""} onChange={e => updProduct(idx, "unitPrice", e.target.value)} /></td>
                        <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 500 }}>{prod.currency === "USD" ? "$" : prod.currency === "EUR" ? "€" : prod.currency}{(Number(prod.qty)||0) * (Number(prod.unitPrice)||0) > 0 ? ((Number(prod.qty)||0) * (Number(prod.unitPrice)||0)).toFixed(0) : prod.subtotal || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8, fontSize: 14, fontWeight: 500, color: "#D85A30" }}>
                Genel toplam: ${ep.products.reduce((s, p) => s + ((Number(p.qty)||0) * (Number(p.unitPrice)||0) || Number(p.subtotal)||0), 0).toFixed(0)}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, paddingTop: 14, borderTop: "1px solid #eee" }}>
            <button onClick={approveAIImport} style={{ flex: 1, padding: "10px 20px", borderRadius: 8, border: "none", background: "#0F6E56", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 500 }}>Onayla ve ekle</button>
            <button onClick={() => setAiImport({ step: "idle", loading: false, fileName: "", preview: null, editPreview: null, error: null })} style={{ flex: 1, padding: "10px 20px", borderRadius: 8, border: "1px solid #A32D2D", background: "#fff", color: "#A32D2D", cursor: "pointer", fontSize: 14, fontWeight: 500 }}>Reddet / İptal</button>
          </div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 8, textAlign: "center" }}>Tüm alanları düzenleyebilirsiniz</div>
        </div>
      )}

      <div style={{ background: "#fff", border: "0.5px solid #ddd", borderRadius: 12, padding: 24, marginTop: 20 }}>
        <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 8 }}>CSV ile toplu içe aktarma</div>
        <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>Alternatif olarak CSV dosyasıyla toplu müşteri ekleyebilirsiniz.</p>
        <input type="file" accept=".csv,.txt,.tsv" onChange={handleCSVImport} style={{ fontSize: 14 }} />
      </div>
    </div>
  );
  };

  const CustomerFormModal = () => {
    const [form, setForm] = useState(editItem); if (!form) return null; const upd = (k, v) => setForm({ ...form, [k]: v });
    const fieldRow = { paddingBottom: 14, marginBottom: 14, borderBottom: "1px solid #eee" };
    return (
      <Modal open={modal === "customer"} onClose={() => setModal(null)} title={form.id ? "Müşteri düzenle" : "Yeni müşteri"}>
        <div style={fieldRow}><Field label="Firma adı"><input style={inputStyle} value={form.name} onChange={e => upd("name", e.target.value)} /></Field></div>
        <div style={fieldRow}><Field label="Ülke"><select style={inputStyle} value={form.country} onChange={e => upd("country", e.target.value)}>{COUNTRIES.map(c => <option key={c}>{c}</option>)}</select></Field></div>
        <div style={fieldRow}><Field label="Sektör / Faaliyet"><input style={inputStyle} value={form.sector} onChange={e => upd("sector", e.target.value)} /></Field></div>
        <div style={fieldRow}><Field label="Durum"><div style={{ display: "flex", gap: 8 }}>{Object.entries(STATUS_MAP).map(([k, v]) => (<button key={k} onClick={() => upd("status", k)} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", border: form.status === k ? `2px solid ${v.border}` : "1px solid #ddd", background: form.status === k ? v.bg : "#fff", color: form.status === k ? v.color : "#888" }}>{v.label}</button>))}</div></Field></div>
        <div style={fieldRow}><Field label="Telefon"><input style={inputStyle} value={form.phone} onChange={e => upd("phone", e.target.value)} placeholder="+90 5XX XXX XXXX" /></Field></div>
        <div style={fieldRow}><Field label="E-posta"><input style={inputStyle} type="email" value={form.email} onChange={e => upd("email", e.target.value)} /></Field></div>
        <div style={{ paddingBottom: 8 }}><Field label="Notlar"><textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={form.notes} onChange={e => upd("notes", e.target.value)} /></Field></div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8, paddingTop: 14, borderTop: "1px solid #eee" }}>
          <button onClick={() => setModal(null)} style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13, color: "#333" }}>İptal</button>
          <button onClick={() => saveCustomer(form)} disabled={!form.name} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: form.name ? "#D85A30" : "#ccc", color: "#fff", cursor: form.name ? "pointer" : "default", fontSize: 13, fontWeight: 500 }}>Kaydet</button>
        </div>
      </Modal>
    );
  };

  const OrderFormModal = () => {
    const [form, setForm] = useState(editItem); if (!form) return null; const upd = (k, v) => setForm({ ...form, [k]: v }); const valid = form.customerId && form.product && form.qty > 0;
    const fieldRow = { paddingBottom: 14, marginBottom: 14, borderBottom: "1px solid #eee" };
    return (
      <Modal open={modal === "order"} onClose={() => setModal(null)} title={form.id ? "Sipariş düzenle" : "Yeni sipariş"}>
        <div style={fieldRow}><Field label="Müşteri"><select style={inputStyle} value={form.customerId} onChange={e => upd("customerId", e.target.value)}><option value="">Seçin...</option>{data.customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field></div>
        <div style={fieldRow}><Field label="Tarih"><input style={inputStyle} type="date" value={form.date} onChange={e => upd("date", e.target.value)} /></Field></div>
        <div style={fieldRow}><Field label="Para birimi"><select style={inputStyle} value={form.currency} onChange={e => upd("currency", e.target.value)}>{["USD", "EUR", "TRY", "GBP"].map(c => <option key={c}>{c}</option>)}</select></Field></div>
        <div style={fieldRow}><Field label="Durum"><select style={inputStyle} value={form.orderStatus || "production"} onChange={e => upd("orderStatus", e.target.value)}><option value="production">Üretimde</option><option value="shipment">Sevkiyatta</option><option value="completed">Tamamlandı</option></select></Field></div>
        <div style={fieldRow}><Field label="Ürün"><input style={inputStyle} value={form.product} onChange={e => upd("product", e.target.value)} /></Field></div>
        <div style={fieldRow}><Field label="Miktar"><input style={inputStyle} type="number" value={form.qty} onChange={e => upd("qty", e.target.value)} /></Field></div>
        <div style={fieldRow}><Field label="Birim satış fiyatı"><input style={inputStyle} type="number" step="0.01" value={form.unitPrice} onChange={e => upd("unitPrice", e.target.value)} /></Field></div>
        <div style={{ paddingBottom: 8 }}><Field label="Birim maliyet"><input style={inputStyle} type="number" step="0.01" value={form.costPrice} onChange={e => upd("costPrice", e.target.value)} /></Field></div>
        {form.qty > 0 && form.unitPrice > 0 && (
          <div style={{ background: "#f8f8f8", borderRadius: 8, padding: 12, marginTop: 4, marginBottom: 8, fontSize: 13 }}>
            <div style={{ marginBottom: 6 }}>Toplam: <b>{fmtCurrency(form.qty * form.unitPrice, form.currency)}</b></div>
            <div style={{ marginBottom: 6 }}>Maliyet: <b>{fmtCurrency(form.qty * form.costPrice, form.currency)}</b></div>
            <div>Kar: <b style={{ color: (form.qty * form.unitPrice - form.qty * form.costPrice) > 0 ? "#3B6D11" : "#A32D2D" }}>{fmtCurrency(form.qty * form.unitPrice - form.qty * form.costPrice, form.currency)}</b></div>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8, paddingTop: 14, borderTop: "1px solid #eee" }}>
          <button onClick={() => setModal(null)} style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13, color: "#333" }}>İptal</button>
          <button onClick={() => saveOrder(form)} disabled={!valid} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: valid ? "#D85A30" : "#ccc", color: "#fff", cursor: valid ? "pointer" : "default", fontSize: 13, fontWeight: 500 }}>Kaydet</button>
        </div>
      </Modal>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", background: "var(--color-background-tertiary)" }}>
      <div style={{ width: sideOpen ? 200 : 56, transition: "width 0.2s", background: "var(--color-background-primary)", borderRight: "0.5px solid var(--color-border-tertiary)", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" }}>
        <div style={{ padding: sideOpen ? "16px 18px" : "16px 12px", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setSideOpen(!sideOpen)}>
          <img src="data:image/png;base64,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" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, objectFit: "contain" }} alt="Nakapp" />
          {sideOpen && <span style={{ fontWeight: 500, fontSize: 17, whiteSpace: "nowrap" }}>Nakapp</span>}
        </div>
        <div style={{ padding: "8px 6px", flex: 1 }}>
          {navItems.map(n => (
            <div key={n.key} onClick={() => setPage(n.key)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: sideOpen ? "10px 14px" : "8px 6px", borderRadius: 8, cursor: "pointer", marginBottom: 4,
              background: page === n.key ? "#D85A30" : "transparent",
              color: page === n.key ? "#fff" : "var(--color-text-primary)",
              fontWeight: 500, fontSize: 13,
              border: page === n.key ? "none" : "0.5px solid var(--color-border-tertiary)"
            }}>
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sideOpen ? n.label : n.label.slice(0, 2)}</span>
              {n.key === "reminders" && overdueCustomers.length > 0 && <span style={{ background: page === n.key ? "rgba(255,255,255,0.3)" : "#534AB7", color: "#fff", fontSize: 10, fontWeight: 500, padding: "1px 6px", borderRadius: 10, minWidth: 16, textAlign: "center" }}>{overdueCustomers.length}</span>}
              {n.key === "collections" && pendingCollections.length > 0 && <span style={{ background: page === n.key ? "rgba(255,255,255,0.3)" : "#534AB7", color: "#fff", fontSize: 10, fontWeight: 500, padding: "1px 6px", borderRadius: 10, minWidth: 16, textAlign: "center" }}>{pendingCollections.length}</span>}
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, padding: "24px 28px", overflow: "auto", maxWidth: 960 }}>
        {page === "dashboard" && renderDashboard()}
        {page === "customers" && renderCustomers()}
        {page === "orders" && renderOrders()}
        {page === "collections" && renderCollections()}
        {page === "completed" && renderCompleted()}
        {page === "drive" && renderDrive()}
        {page === "reminders" && renderReminders()}
        {page === "import" && renderImport()}
      </div>
      <CustomerFormModal />
      <OrderFormModal />
      {toast && <div style={{ position: "fixed", bottom: 24, right: 24, background: toast.type === "success" ? "#1D9E75" : "#BA7517", color: "#fff", padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 500, zIndex: 2000, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>{toast.msg}</div>}
    </div>
  );
}
