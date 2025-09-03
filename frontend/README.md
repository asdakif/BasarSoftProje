# BasarSoft Proje - Frontend

Modern ve kullanıcı dostu bir harita uygulaması. Türkiye haritası üzerinde coğrafi konumlar oluşturabilir, görüntüleyebilir ve yönetebilirsiniz.

## 🚀 Özellikler

### 🗺️ Harita Görünümü
- **Çizim Araçları**: Nokta, çizgi ve alan çizimi
- **Konum Görüntüleme**: Haritadaki konumları tıklayarak detaylarını görme
- **Otomatik Yükleme**: Tüm kayıtlı konumlar haritada otomatik görüntülenir

### 📋 Tüm Konumlar Listesi
- **Arama**: Konum adına göre filtreleme
- **Silme**: Konumları güvenli bir şekilde silme
- **Görüntüleme**: Konumları haritada gösterme
- **Yenileme**: Listeyi güncelleme

### 🔍 Arama Ekranı
- **Hızlı Arama**: Konum adına göre anında arama
- **Sonuç Listesi**: Bulunan konumları listeleme
- **Haritada Gösterme**: Arama sonuçlarını haritada görüntüleme

## 🎨 Tasarım Özellikleri

- **Modern UI**: Bootstrap 5 ile modern tasarım
- **Responsive**: Mobil ve masaüstü uyumlu
- **Animasyonlar**: Yumuşak geçişler ve hover efektleri
- **Gradient Renkler**: Modern gradient renk paleti
- **Gölge Efektleri**: Derinlik hissi veren gölgeler

## 🛠️ Teknolojiler

- **React 18**: Modern React hooks ve functional components
- **TypeScript**: Tip güvenliği
- **OpenLayers**: Harita görüntüleme ve etkileşim
- **Bootstrap 5**: UI framework
- **Axios**: HTTP istekleri

## 📱 Kullanım

### Harita Görünümü
1. **Çizim**: Sağ üstteki araçlarla nokta, çizgi veya alan çizin
2. **Konum Ekleme**: Çizim tamamlandıktan sonra konum adını girin
3. **Görüntüleme**: Haritadaki konumları tıklayarak detaylarını görün

### Konum Listesi
1. **Listeleme**: Tüm kayıtlı konumları görüntüleyin
2. **Arama**: Üst kısımdaki arama kutusuyla filtreleme yapın
3. **Silme**: Konum yanındaki "Sil" butonuna tıklayın
4. **Görüntüleme**: "Görüntüle" butonuyla haritada gösterin

### Arama
1. **Arama**: Konum adını yazın ve "Ara" butonuna tıklayın
2. **Sonuçlar**: Bulunan konumlar listelenir
3. **Haritada Göster**: İstediğiniz konumu haritada görüntüleyin

## 🎯 Özellikler

- ✅ Modern ve responsive tasarım
- ✅ Harita üzerinde çizim yapma
- ✅ Konum ekleme ve silme
- ✅ Arama ve filtreleme
- ✅ Tüm konumları listeleme
- ✅ Haritada konum görüntüleme
- ✅ Popup bilgi pencereleri
- ✅ Loading durumları
- ✅ Hata yönetimi
- ✅ TypeScript desteği

## 🚀 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm start

# Production build
npm run build
```

## 📁 Proje Yapısı

```
src/
├── components/
│   ├── Map.tsx              # Ana harita bileşeni
│   ├── FeatureForm.tsx      # Özellik ekleme formu
│   ├── FeatureList.tsx      # Özellik listesi
│   ├── FeatureSearch.tsx    # Arama bileşeni
│   └── Navbar.tsx           # Navigasyon çubuğu
├── services/
│   └── api.ts              # API servisleri
├── types/
│   └── index.ts            # TypeScript tipleri
├── App.tsx                 # Ana uygulama bileşeni
└── index.css              # Stil dosyası
```

## 🔧 API Endpoints

Uygulama aşağıdaki API endpoint'lerini kullanır:

- `GET /api/features` - Tüm konumları listele
- `POST /api/features` - Yeni konum ekle
- `DELETE /api/features/{id}` - Konum sil
- `PUT /api/features/{id}` - Konum güncelle

## 🎨 Renk Paleti

- **Primary**: #2563eb (Mavi)
- **Success**: #10b981 (Yeşil)
- **Danger**: #ef4444 (Kırmızı)
- **Warning**: #f59e0b (Turuncu)
- **Info**: #06b6d4 (Cyan)
- **Light**: #f8fafc (Açık gri)
- **Dark**: #1e293b (Koyu gri)
