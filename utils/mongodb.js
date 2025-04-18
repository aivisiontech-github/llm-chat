const { MongoClient } = require('mongodb');
const { MONGODB_URI, MONGODB_DB, MONGODB_COLLECTION } = require('./consts');

let cachedClient = null;
let cachedDb = null;

// MongoDB bağlantısını oluştur
async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = client.db(MONGODB_DB);
    
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    throw error;
  }
}

// Analiz sonuçlarını MongoDB'ye kaydet
async function saveAnalysis(id, analysis) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection(MONGODB_COLLECTION);
    
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
    
    return result;
  } catch (error) {
    console.error('MongoDB kayıt hatası:', error);
    throw error;
  }
}

// Analiz sonucunu ID'ye göre getir
async function getAnalysisById(id) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection(MONGODB_COLLECTION);
    
    const result = await collection.findOne({ _id: id });
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