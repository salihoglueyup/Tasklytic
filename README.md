# Tasklytic

<div align="center">

![Tasklytic Logo](./tasklytic-logo.svg)

**Modern, Akıllı ve Güçlü Görev Yönetim Sistemi**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)](https://nodejs.org/)
[![Electron](https://img.shields.io/badge/Electron-Ready-47848f?logo=electron)](https://www.electronjs.org/)

[Özellikler](#-özellikler) • [Kurulum](#-kurulum) • [Kullanım](#-kullanım) • [Teknolojiler](#-teknolojiler) • [Katkıda Bulunun](#-katkıda-bulunun)

</div>

---

## 📖 Hakkında

**Tasklytic**, görev yönetimini bir üst seviyeye taşıyan, modern ve kullanıcı dostu bir uygulamadır. Pomodoro tekniği, istatistiksel analiz, gamification özellikleri ve detaylı takip sistemleri ile verimliliğinizi maksimize edin.

### ✨ Neden Tasklytic?

- 🎯 **Odaklanma Modu** - Pomodoro tekniği ile kesintisiz çalışma
- 📊 **Detaylı Analiz** - İstatistikler ve grafiklerle performans takibi
- 🎮 **Gamification** - Seviye sistemi, başarımlar ve streak takibi
- 🌓 **Dark Mode** - Göz dostu karanlık tema desteği
- 📱 **Responsive** - Her cihazda mükemmel görünüm
- 🔄 **Senkronizasyon** - Verileriniz güvende
- 🎨 **Modern UI** - Tailwind CSS ile şık tasarım
- ⚡ **Hızlı** - React ve modern teknolojilerle yüksek performans

---

## 🎯 Özellikler

### 📝 Görev Yönetimi
- ✅ Görev ekleme, düzenleme ve silme
- 🏷️ Kategoriler (Kişisel, İş, Alışveriş, Sağlık)
- ⚡ Öncelik seviyeleri (Düşük, Orta, Yüksek, Acil)
- 📅 Tarihleme ve son tarih takibi
- 🔖 Etiket sistemi
- 📎 Alt görev desteği
- 🔄 Tekrarlanan görevler
- ⏰ Hatırlatıcılar
- 🎯 Drag & Drop ile sıralama

### 🍅 Pomodoro & Zaman Yönetimi
- ⏱️ 25 dakikalık Pomodoro timer
- 🎯 Odaklanma modu (Tam ekran çalışma ortamı)
- 📊 Görev başına pomodoro sayacı
- ⏳ Toplam çalışma süresi takibi
- 🔔 Görsel ve sesli bildirimler

### 📊 İstatistikler & Analiz
- 📈 Haftalık tamamlama trendi
- 🥧 Kategorilere göre dağılım grafiği
- 📊 Tamamlanma yüzdesi
- 🎯 Günlük ortalama görev sayısı
- ⚡ Verimlilik skoru
- 🔥 Acil görev takibi

### 🎮 Gamification
- 🏆 Seviye sistemi (XP ve Level)
- 🔥 Streak takibi (Ardışık gün sayısı)
- 🏅 Başarımlar (10+ farklı başarım)
- ⭐ XP kazanma sistemi
- 👑 Milestone'lar

### 🎨 Kullanıcı Deneyimi
- 🌓 Dark/Light mode
- 🎨 Modern ve şık arayüz
- 📱 Responsive tasarım
- 🔍 Gelişmiş arama ve filtreleme
- 📥 Dışa/İçe aktarma (JSON)
- 🎯 Şablon sistemi
- 💾 Otomatik kaydetme
- 🖱️ Sürükle-bırak desteği

---

## 🚀 Kurulum

### Gereksinimler

- Node.js 20 veya üzeri
- npm veya yarn

### Backend Kurulumu

```bash
# Proje klasörüne gidin
cd server

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Sunucu http://localhost:3001 adresinde çalışacak
```

### Frontend Kurulumu

```bash
# Proje klasörüne gidin
cd client

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Uygulama http://localhost:5173 adresinde açılacak
```


---

## 💻 Kullanım

### Görev Ekleme
1. Ana ekrandaki "Yeni Görev Ekle" formunu doldurun
2. Kategori, öncelik ve tarih seçin
3. "Görev Ekle" butonuna tıklayın

### Alt Görev Oluşturma
1. Ana görevi seçin
2. Sağ taraftaki detay panelinde "Alt Görev Ekle" butonuna tıklayın
3. Alt görev başlığını girin ve kaydedin

### Pomodoro Kullanımı
1. Bir görev seçin
2. "Odaklanma Moduna Geç" butonuna tıklayın
3. Timer'ı başlatın ve çalışmaya odaklanın
4. 25 dakika sonunda mola verin

### İstatistikleri Görüntüleme
1. Üst menüden "İstatistikler" butonuna tıklayın
2. Haftalık trendleri, kategorilere göre dağılımı görüntüleyin
3. Performans metriklerinizi takip edin

### Veri Yedekleme
```bash
# Export - Sağ üst köşedeki ⬇️ ikonuna tıklayın
# JSON dosyası indirilecek

# Import - Sağ üst köşedeki ⬆️ ikonuna tıklayın
# JSON dosyasını seçin
```

---

## 🛠️ Teknolojiler

### Frontend
- **React 18.3.1** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Recharts** - Charts & Analytics
- **@dnd-kit** - Drag & Drop
- **date-fns** - Date utilities

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **SQL.js** - In-memory SQLite database
- **CORS** - Cross-origin support

### Desktop
- **Electron** - Desktop app framework
- **electron-builder** - Build & package

---

## 📁 Proje Yapısı

```
tasklytic/
├── client/                 # Frontend React uygulaması
│   ├── src/
│   │   ├── App.jsx        # Ana component
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   └── package.json
│
├── server/                # Backend API
│   ├── src/
│   │   ├── server.js      # Express server
│   │   └── database.js    # Database operations
│   └── package.json
│
├── electron/              # Desktop app
│   ├── main.js           # Electron main process
│   └── package.json
│
├── logo.svg              # Logo dosyası
└── README.md            # Bu dosya
```

---

## 🎨 Ekran Görüntüleri

### Ana Ekran
![Main Screen](https://via.placeholder.com/800x450/667eea/ffffff?text=Tasklytic+Main+Screen)

### İstatistikler
![Statistics](https://via.placeholder.com/800x450/764ba2/ffffff?text=Tasklytic+Statistics)

### Odaklanma Modu
![Focus Mode](https://via.placeholder.com/800x450/f5576c/ffffff?text=Tasklytic+Focus+Mode)

### Dark Mode
![Dark Mode](https://via.placeholder.com/800x450/1a202c/ffffff?text=Tasklytic+Dark+Mode)

---

## 🔧 Geliştirme

### Yeni Özellik Ekleme

1. Frontend'de yeni component oluşturun
```jsx
// client/src/components/NewFeature.jsx
export const NewFeature = () => {
  return <div>Yeni Özellik</div>;
};
```

2. Backend'de endpoint ekleyin
```javascript
// server/src/server.js
app.get('/api/new-feature', (req, res) => {
  res.json({ message: 'Yeni özellik' });
});
```

3. Database'e tablo ekleyin
```javascript
// server/src/database.js
db.exec(`
  CREATE TABLE IF NOT EXISTS new_feature (
    id TEXT PRIMARY KEY,
    data TEXT
  );
`);
```

### Debug Modu

```bash
# Backend debug
DEBUG=* npm run dev

# Frontend debug
# Browser DevTools'u kullanın (F12)

# Electron debug
npm start --enable-logging
```

---

## 🤝 Katkıda Bulunun

Katkılarınızı bekliyoruz!

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit yapın (`git commit -m 'Add some AmazingFeature'`)
4. Push yapın (`git push origin feature/AmazingFeature`)
5. Pull Request açın

### Geliştirme Kuralları
- ✅ ESLint kurallarına uyun
- 📝 Kod yorumları ekleyin
- 🧪 Test yazın
- 📖 README'yi güncelleyin

---

## 📝 Lisans

Bu proje [MIT](LICENSE) lisansı altında lisanslanmıştır.

---

## 👨‍💻 Geliştirici

**Your Name**
- GitHub: [@salihoglueyup](https://github.com/salihoglueyup)
- Email: eyupzekisalihoglu@gmail.com

---

## 🙏 Teşekkürler

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Recharts](https://recharts.org/)
- [DND Kit](https://dndkit.com/)

---

## 📈 Roadmap

- [ ] Cloud senkronizasyon
- [ ] Takım çalışması özellikleri
- [ ] AI destekli görev önerileri
- [ ] Takvim entegrasyonu (Google Calendar, Outlook)
- [ ] Slack/Discord bot entegrasyonu
- [ ] Web clipper browser extension
- [ ] API dokümantasyonu
- [ ] Çoklu dil desteği
- [ ] Tema özelleştirme

---

<div align="center">

**⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın! ⭐**

Made with ❤️ and ☕

[⬆ Başa Dön](#-tasklytic)

</div>