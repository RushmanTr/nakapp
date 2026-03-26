# Nakapp — Kurulum Rehberi

## Gereksinimler
- Node.js (https://nodejs.org — LTS sürümü indirin)
- Git (opsiyonel)

---

## ADIM 1: Firebase Hesabı Oluşturma (5 dakika)

1. https://console.firebase.google.com adresine gidin
2. Google hesabınızla giriş yapın
3. **"Add Project"** tıklayın → Proje adı: `nakapp` → Create
4. Sol menüden **Authentication** > **Get Started** > **Sign-in method** sekmesi
5. **Email/Password** satırına tıklayın → **Enable** yapın → Save
6. Sol menüden **Firestore Database** > **Create database** > **Start in test mode** > Next > Create
7. Sol üstteki ⚙️ (ayarlar) > **Project Settings** > Aşağı kaydırın > **"Your apps"** bölümünde **Web (</> ikonu)** tıklayın
8. App nickname: `nakapp` → Register app
9. Ekranda çıkan `firebaseConfig` değerlerini kopyalayın

---

## ADIM 2: Projeyi Bilgisayarınıza Kurma (3 dakika)

1. Bu ZIP dosyasını bir klasöre açın
2. Terminal/Komut Satırı açın, klasöre gidin:
```bash
cd nakapp-pwa
```
3. Bağımlılıkları yükleyin:
```bash
npm install
```
4. `src/lib/firebase.js` dosyasını açın ve Firebase'den aldığınız değerleri yapıştırın:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",           // Firebase'den kopyalayın
  authDomain: "nakapp.firebaseapp.com",
  projectId: "nakapp",
  storageBucket: "nakapp.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
};
```
5. Test edin:
```bash
npm run dev
```
6. Tarayıcıda http://localhost:3000 açın — çalışıyor olmalı!

---

## ADIM 3: İnternete Yayınlama — Vercel (3 dakika)

1. https://vercel.com adresine gidin → GitHub ile giriş yapın
2. Projeyi GitHub'a yükleyin:
```bash
git init
git add .
git commit -m "Nakapp v1"
```
3. GitHub'da yeni repo oluşturun (nakapp) ve push edin:
```bash
git remote add origin https://github.com/KULLANICI_ADINIZ/nakapp.git
git branch -M main
git push -u origin main
```
4. Vercel'de **"New Project"** > GitHub reponuzu seçin > **Deploy**
5. Birkaç dakika sonra `nakapp-XXXXX.vercel.app` adresiniz hazır!

### Özel domain (opsiyonel):
Vercel Dashboard > Settings > Domains > kendi domain adresinizi ekleyebilirsiniz.

---

## ADIM 4: iPhone'a Kurma

1. iPhone'da **Safari** ile `nakapp-XXXXX.vercel.app` adresinizi açın
2. Alttaki **paylaş butonuna** (kare + yukarı ok) tıklayın
3. **"Ana Ekrana Ekle"** seçin
4. İsim: Nakapp → **Ekle**
5. Ana ekranda Nakapp ikonu çıkacak — uygulama gibi açılır!

---

## ADIM 5: Windows'a Kurma

1. **Chrome** ile `nakapp-XXXXX.vercel.app` adresinizi açın
2. Adres çubuğunun sağında **"Uygulamayı yükle"** ikonu çıkar (⊕ veya bilgisayar ikonu)
3. Tıklayın → **"Yükle"**
4. Masaüstünde ve Başlat menüsünde Nakapp uygulaması çıkar!

---

## Özellikler

- ✅ E-posta ile giriş / kayıt
- ✅ Müşteri yönetimi (aktif/potansiyel/pasif)
- ✅ Sipariş takibi (üretim/sevkiyat/tamamlandı)
- ✅ Tahsilat takibi
- ✅ PDF proforma analizi (AI ile otomatik veri çıkarma)
- ✅ Drive — dosya yönetimi
- ✅ WhatsApp entegrasyonu
- ✅ Piyasa verileri (USD/TRY, EUR/TRY, altın)
- ✅ Hatırlatma sistemi
- ✅ Windows + iPhone senkronizasyon
- ✅ Offline çalışma (PWA)

---

## Sorun Giderme

**"Firebase bağlantı hatası":**
- `firebase.js` dosyasındaki değerleri doğru yapıştırdığınızdan emin olun
- Firebase Console'da Firestore ve Authentication aktif mi kontrol edin

**iPhone'da uygulama gözükmüyor:**
- Sadece Safari'den "Ana Ekrana Ekle" çalışır (Chrome iOS'ta çalışmaz)

**Veriler kayboldu:**
- Firestore "test mode" 30 gün sonra sona erer
- Firebase Console > Firestore > Rules'da süreyi uzatın:
```
allow read, write: if request.time < timestamp.date(2026, 12, 31);
```
