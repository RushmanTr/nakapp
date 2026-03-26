import Head from "next/head";
import { useAuth } from "../lib/useAuth";
import { useFirestoreData } from "../lib/useFirestoreData";
import LoginPage from "../components/LoginPage";
import CRMApp from "../components/CRMApp";

export default function Home() {
  const { user, loading: authLoading, login, register, logout } = useAuth();
  const { data, loading: dataLoading, saveData } = useFirestoreData(user?.uid);

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: "#D85A30", marginBottom: 8 }}>Nakapp</div>
          <div style={{ fontSize: 14, color: "#888" }}>Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Head>
          <title>Nakapp | Giriş</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#D85A30" />
        </Head>
        <LoginPage onLogin={login} onRegister={register} />
      </>
    );
  }

  return (
    <CRMApp
      user={user}
      data={data}
      loading={dataLoading}
      onSave={saveData}
      onLogout={logout}
    />
  );
}