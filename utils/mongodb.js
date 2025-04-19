const { MongoClient } = require('mongodb');
const config = require('./consts');

let cachedClient = null;
let cachedDb = null;

// MongoDB bağlantısını oluştur
async function connectToDatabase() {
  console.log('connectToDatabase fonksiyonu çağrıldı');
  
  if (cachedClient && cachedDb) {
    console.log('Önbellekteki MongoDB bağlantısı kullanılıyor');
    return { client: cachedClient, db: cachedDb };
  }

  if (!config.MONGODB.URI) {
    throw new Error('MONGODB_URI çevre değişkeni tanımlanmamış');
  }

  if (!config.MONGODB.DB) {
    throw new Error('MONGODB_DB çevre değişkeni tanımlanmamış');
  }

  try {
    console.log(`MongoDB'ye bağlanılıyor: ${config.MONGODB.URI}`);
    const client = await MongoClient.connect(config.MONGODB.URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = client.db(config.MONGODB.DB);
    console.log(`Veritabanı seçildi: ${config.MONGODB.DB}`);
    
    cachedClient = client;
    cachedDb = db;
    
    console.log('MongoDB bağlantısı başarılı olarak kuruldu');
    return { client, db };
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    console.error('Hata yığını:', error.stack);
    throw error;
  }
}

// Analiz sonuçlarını MongoDB'ye kaydet
async function saveAnalysis(id, analysis) {
  console.log(`saveAnalysis fonksiyonu çağrıldı - ID: ${id}, Analiz uzunluğu: ${analysis?.length || 0} karakter`);
  
  if (!config.MONGODB.COLLECTION) {
    throw new Error('MONGODB_COLLECTION çevre değişkeni tanımlanmamış');
  }

  try {
    console.log('MongoDB bağlantısı alınıyor...');
    const { db } = await connectToDatabase();
    const collection = db.collection(config.MONGODB.COLLECTION);
    console.log(`Koleksiyon seçildi: ${config.MONGODB.COLLECTION}`);
    
    console.log(`${id} ID'li analiz kaydediliyor...`);
    const result = await collection.updateOne(
      { _id: id },
      { 
        $set: { 
          analysis: analysis,
          timestamp: new Date() 
        } 
      },
      { upsert: true }
    );
    
    console.log(`Analiz başarıyla MongoDB'ye kaydedildi. ID: ${id}, Etkilenen belge sayısı: ${result.modifiedCount || result.upsertedCount || 0}`);
    return result;
  } catch (error) {
    console.error('MongoDB kayıt hatası:', error);
    console.error('Hata yığını:', error.stack);
    throw error;
  }
}

// Analiz sonucunu ID'ye göre getir
async function getAnalysisById(id) {
  console.log(`getAnalysisById fonksiyonu çağrıldı - ID: ${id}`);
  
  if (!config.MONGODB.COLLECTION) {
    throw new Error('MONGODB_COLLECTION çevre değişkeni tanımlanmamış');
  }

  try {
    console.log('MongoDB bağlantısı alınıyor...');
    const { db } = await connectToDatabase();
    const collection = db.collection(config.MONGODB.COLLECTION);
    console.log(`Koleksiyon seçildi: ${config.MONGODB.COLLECTION}`);
    
    console.log(`${id} ID'li analiz sorgulanıyor...`);
    const result = await collection.findOne({ _id: id });
    if (result) {
      console.log(`Analiz başarıyla MongoDB'den alındı. ID: ${id}, Analiz uzunluğu: ${result.analysis?.length || 0} karakter`);
    } else {
      console.log(`ID için analiz bulunamadı: ${id}`);
    }
    return result;
  } catch (error) {
    console.error('MongoDB okuma hatası:', error);
    console.error('Hata yığını:', error.stack);
    throw error;
  }
}

module.exports = {
  connectToDatabase,
  saveAnalysis,
  getAnalysisById
}; 