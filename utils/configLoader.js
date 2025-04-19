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
  console.log(`loadConfigFromMongoDB çağrıldı (useCache=${useCache})`);
  
  // Eğer önbellekteki veri kullanılacaksa ve varsa, hemen geri dön
  if (useCache && cachedConfig) {
    console.log('Önbellek verileri kullanılıyor.');
    console.log(`Önbellekte ${cachedConfig.ASSISTANTS?.length || 0} asistan var.`);
    if (cachedConfig.ASSISTANTS?.length > 0) {
      console.log(`Önbellekteki asistan tipleri: ${JSON.stringify(cachedConfig.ASSISTANTS.map(a => a.type))}`);
    }
    return cachedConfig;
  }

  if (!MONGODB_URI || !MONGODB_DB) {
    console.warn('MongoDB bağlantı bilgileri eksik. Varsayılan config kullanılıyor.');
    console.log(`Varsayılan yapılandırmadaki asistan sayısı: ${defaultConfig.ASSISTANTS?.length || 0}`);
    if (defaultConfig.ASSISTANTS?.length > 0) {
      console.log(`Varsayılan asistan tipleri: ${JSON.stringify(defaultConfig.ASSISTANTS.map(a => a.type))}`);
    }
    return defaultConfig;
  }

  let client;
  try {
    // MongoDB'ye bağlan
    console.log(`MongoDB'ye bağlanılıyor: ${MONGODB_URI}`);
    client = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB bağlantısı başarılı');

    // Veritabanını seç
    const db = client.db(MONGODB_DB);
    console.log(`Veritabanı seçildi: ${MONGODB_DB}`);
    
    // Config koleksiyonunu seç
    const collection = db.collection('config');
    console.log('config koleksiyonu seçildi');
    
    // Config verisini al
    console.log('MongoDB\'den yapılandırma okunuyor...');
    const config = await collection.findOne({ _id: 'main-config' });
    
    if (config) {
      console.log('Config MongoDB\'den başarıyla yüklendi.');
      // _id ve _lastUpdated alanlarını temizle
      delete config._id;

      // Asistan bilgilerini logla
      console.log(`Veritabanından yüklenen yapılandırmada ${config.ASSISTANTS?.length || 0} asistan var.`);
      if (config.ASSISTANTS?.length > 0) {
        console.log(`Asistan tipleri: ${JSON.stringify(config.ASSISTANTS.map(a => a.type))}`);
        config.ASSISTANTS.forEach((asst, index) => {
          console.log(`Asistan ${index + 1} - Tip: ${asst.type}, ID: ${asst.assistant_id}`);
          console.log(`  Muscles özellikleri: ${JSON.stringify(Object.keys(asst.muscles || {}))}`);
        });
      } else {
        console.warn('Yapılandırmada ASSISTANTS dizisi bulunamadı veya boş!');
      }
      
      // Önbelleğe al
      cachedConfig = config;
      cachedClient = client;
      
      return config;
    } else {
      console.log('MongoDB\'de config bulunamadı. Varsayılan config kullanılıyor.');
      console.log(`Varsayılan yapılandırmadaki asistan sayısı: ${defaultConfig.ASSISTANTS?.length || 0}`);
      if (defaultConfig.ASSISTANTS?.length > 0) {
        console.log(`Varsayılan asistan tipleri: ${JSON.stringify(defaultConfig.ASSISTANTS.map(a => a.type))}`);
      }
      return defaultConfig;
    }
  } catch (error) {
    console.error('MongoDB\'den config yüklenirken hata oluştu:', error);
    console.error('Hata yığını:', error.stack);
    console.log('Varsayılan config kullanılıyor.');
    console.log(`Varsayılan yapılandırmadaki asistan sayısı: ${defaultConfig.ASSISTANTS?.length || 0}`);
    if (defaultConfig.ASSISTANTS?.length > 0) {
      console.log(`Varsayılan asistan tipleri: ${JSON.stringify(defaultConfig.ASSISTANTS.map(a => a.type))}`);
    }
    return defaultConfig;
  } finally {
    // Eğer önbelleğe alınmadıysa bağlantıyı kapat
    if (client && client !== cachedClient) {
      console.log('MongoDB bağlantısı kapatılıyor (önbelleğe alınmadı)');
      await client.close();
    }
  }
}

/**
 * Önbelleği temizle ve bağlantıyı kapat
 */
async function clearConfigCache() {
  console.log('Config önbelleği temizleniyor...');
  cachedConfig = null;
  if (cachedClient) {
    console.log('Önbelleklenmiş MongoDB bağlantısı kapatılıyor...');
    await cachedClient.close();
    cachedClient = null;
    console.log('MongoDB bağlantısı kapatıldı');
  }
  console.log('Önbellek temizlendi');
}

module.exports = {
  loadConfigFromMongoDB,
  clearConfigCache
}; 