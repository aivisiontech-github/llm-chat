const { loadConfigFromMongoDB, clearConfigCache } = require('../utils/configLoader');

async function getConfigExample() {
  try {
    console.log('MongoDB\'den config yükleniyor...');
    const config = await loadConfigFromMongoDB();
    
    console.log('MongoDB\'den yüklenen config:');
    console.log('API_KEY:', config.API_KEY);
    console.log('NORMAL_ASSISTANT_ID:', config.ASSISTANTS.NORMAL);
    console.log('CARPAL_ASSISTANT_ID:', config.ASSISTANTS.CARPAL);
    console.log('Vektor depoları:', config.VECTOR_STORES);
    console.log('MongoDB:', config.MONGODB);
    
    // İstenirse önbelleği temizle
    await clearConfigCache();
    console.log('Config önbelleği temizlendi');
    
  } catch (error) {
    console.error('Hata:', error);
  }
}

// Scripti çalıştır
getConfigExample().catch(console.error); 