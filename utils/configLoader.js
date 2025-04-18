require('dotenv').config();
const { MongoClient } = require('mongodb');
const defaultConfig = require('./consts');

// MongoDB bağlantı bilgileri
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

let cachedConfig = null;
let cachedClient = null;

/**
 * MongoDB'den config verilerini yükler
 * @param {boolean} useCache - Önbellekteki veriyi kullanıp kullanmayacağını belirtir
 * @returns {Promise<object>} - Config verilerini içeren Promise
 */
async function loadConfigFromMongoDB(useCache = true) {
  // Eğer önbellekteki veri kullanılacaksa ve varsa, hemen geri dön
  if (useCache && cachedConfig) {
    return cachedConfig;
  }

  if (!MONGODB_URI || !MONGODB_DB) {
    console.warn('MongoDB bağlantı bilgileri eksik. Varsayılan config kullanılıyor.');
    return defaultConfig;
  }

  let client;
  try {
    // MongoDB'ye bağlan
    client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Veritabanını seç
    const db = client.db(MONGODB_DB);
    
    // Config koleksiyonunu seç
    const collection = db.collection('config');
    
    // Config verisini al
    const config = await collection.findOne({ _id: 'main-config' });
    
    if (config) {
      console.log('Config MongoDB\'den başarıyla yüklendi.');
      // _id ve _lastUpdated alanlarını temizle
      delete config._id;
      
      // Önbelleğe al
      cachedConfig = config;
      cachedClient = client;
      
      return config;
    } else {
      console.log('MongoDB\'de config bulunamadı. Varsayılan config kullanılıyor.');
      return defaultConfig;
    }
  } catch (error) {
    console.error('MongoDB\'den config yüklenirken hata oluştu:', error);
    console.log('Varsayılan config kullanılıyor.');
    return defaultConfig;
  } finally {
    // Eğer önbelleğe alınmadıysa bağlantıyı kapat
    if (client && client !== cachedClient) {
      await client.close();
    }
  }
}

/**
 * Önbelleği temizle ve bağlantıyı kapat
 */
async function clearConfigCache() {
  cachedConfig = null;
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
  }
}

module.exports = {
  loadConfigFromMongoDB,
  clearConfigCache
}; 