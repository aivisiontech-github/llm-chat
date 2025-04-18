require('dotenv').config();
const { MongoClient } = require('mongodb');
const config = require('../utils/consts');

// MongoDB bağlantı bilgileri
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

async function uploadConfigToMongoDB() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI çevre değişkeni tanımlanmamış');
    process.exit(1);
  }

  if (!MONGODB_DB) {
    console.error('MONGODB_DB çevre değişkeni tanımlanmamış');
    process.exit(1);
  }

  let client;
  try {
    // MongoDB'ye bağlan
    client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB bağlantısı başarılı');
    
    // Veritabanını seç
    const db = client.db(MONGODB_DB);
    
    // Config koleksiyonu oluştur veya var olanı kullan
    const collection = db.collection('config');
    
    // Çevresel değişkenlerin çalışma zamanındaki değerlerini korumak için
    // config nesnesini klonlayalım ve MongoDB için güvenli hale getirelim
    const configToSave = JSON.parse(JSON.stringify(config));
    
    // MongoDB'ye yüklenen config nesnesine son güncelleme tarihini ekle
    configToSave._lastUpdated = new Date();
    configToSave._id = 'main-config'; // Sabit bir ID kullanarak güncellenebilir yapıyoruz
    
    // Mevcut config varsa güncelle, yoksa yeni oluştur
    const result = await collection.updateOne(
      { _id: 'main-config' },
      { $set: configToSave },
      { upsert: true }
    );
    
    if (result.matchedCount) {
      console.log('Config MongoDB\'de başarıyla güncellendi');
    } else {
      console.log('Config MongoDB\'ye başarıyla kaydedildi');
    }
    
    // Config'in içeriğini kontrol et
    const savedConfig = await collection.findOne({ _id: 'main-config' });
    console.log('Kaydedilen config:', savedConfig);
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    // Bağlantıyı kapat
    if (client) {
      await client.close();
      console.log('MongoDB bağlantısı kapatıldı');
    }
  }
}

// Scripti çalıştır
uploadConfigToMongoDB().catch(console.error); 