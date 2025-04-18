const { MongoClient } = require('mongodb');
const config = require('./consts');

let cachedClient = null;
let cachedDb = null;

// MongoDB bağlantısını oluştur
async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!config.MONGODB.URI) {
    throw new Error('MONGODB_URI çevre değişkeni tanımlanmamış');
  }

  if (!config.MONGODB.DB) {
    throw new Error('MONGODB_DB çevre değişkeni tanımlanmamış');
  }

  try {
    const client = await MongoClient.connect(config.MONGODB.URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = client.db(config.MONGODB.DB);
    
    cachedClient = client;
    cachedDb = db;
    
    console.log('MongoDB bağlantısı başarılı olarak kuruldu');
    return { client, db };
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    throw error;
  }
}

// Analiz sonuçlarını MongoDB'ye kaydet
async function saveAnalysis(id, analysis) {
  if (!config.MONGODB.COLLECTION) {
    throw new Error('MONGODB_COLLECTION çevre değişkeni tanımlanmamış');
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection(config.MONGODB.COLLECTION);
    
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
    
    console.log(`Analiz başarıyla MongoDB'ye kaydedildi. ID: ${id}`);
    return result;
  } catch (error) {
    console.error('MongoDB kayıt hatası:', error);
    throw error;
  }
}

// Analiz sonucunu ID'ye göre getir
async function getAnalysisById(id) {
  if (!config.MONGODB.COLLECTION) {
    throw new Error('MONGODB_COLLECTION çevre değişkeni tanımlanmamış');
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection(config.MONGODB.COLLECTION);
    
    const result = await collection.findOne({ _id: id });
    if (result) {
      console.log(`Analiz başarıyla MongoDB'den alındı. ID: ${id}`);
    } else {
      console.log(`ID için analiz bulunamadı: ${id}`);
    }
    return result;
  } catch (error) {
    console.error('MongoDB okuma hatası:', error);
    throw error;
  }
}

module.exports = {
  connectToDatabase,
  saveAnalysis,
  getAnalysisById
}; 