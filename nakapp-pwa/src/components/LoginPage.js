import { useState } from "react";

export default function LoginPage({ onLogin, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        await onRegister(email, password);
      } else {
        await onLogin(email, password);
      }
    } catch (err) {
      const msg = err.code === "auth/user-not-found" ? "Kullanıcı bulunamadı"
        : err.code === "auth/wrong-password" ? "Yanlış şifre"
        : err.code === "auth/email-already-in-use" ? "Bu e-posta zaten kayıtlı"
        : err.code === "auth/weak-password" ? "Şifre en az 6 karakter olmalı"
        : err.code === "auth/invalid-email" ? "Geçersiz e-posta"
        : "Giriş hatası: " + err.message;
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 40, width: "min(90vw, 400px)", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 600, color: "#D85A30", marginBottom: 4 }}>Nakapp</div>
          <div style={{ fontSize: 14, color: "#888" }}>Müşteri ve sipariş yönetimi</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 6, fontWeight: 500 }}>E-posta</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: "100%", padding: "10px 14px", fontSize: 15, borderRadius: 8, border: "1px solid #ddd", background: "#fff", boxSizing: "border-box" }}
              placeholder="ornek@email.com" />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 6, fontWeight: 500 }}>Şifre</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width: "100%", padding: "10px 14px", fontSize: 15, borderRadius: 8, border: "1px solid #ddd", background: "#fff", boxSizing: "border-box" }}
              placeholder="••••••" />
          </div>

          {error && (
            <div style={{ background: "#FCEBEB", border: "1px solid #F09595", borderRadius: 8, padding: 10, marginBottom: 16, fontSize: 13, color: "#791F1F" }}>{error}</div>
          )}

          <button type="submit" disabled={loading}
            style={{ width: "100%", padding: "12px", fontSize: 15, fontWeight: 500, borderRadius: 8, border: "none", background: loading ? "#ccc" : "#D85A30", color: "#fff", cursor: loading ? "default" : "pointer" }}>
            {loading ? "..." : isRegister ? "Kayıt ol" : "Giriş yap"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={() => { setIsRegister(!isRegister); setError(""); }}
            style={{ background: "none", border: "none", color: "#D85A30", cursor: "pointer", fontSize: 13 }}>
            {isRegister ? "Zaten hesabım var — Giriş yap" : "Hesabım yok — Kayıt ol"}
          </button>
        </div>
      </div>
    </div>
  );
}
