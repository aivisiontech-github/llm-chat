// utils/vectorstore.js

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// OpenAI API anahtarınızı burada da dahil edin
const openai = require('./openai'); // openai.js dosyasından içe aktarın
const config = require('./consts');

async function getOrCreateVectorStore(analyzeType) {
  console.log(`getOrCreateVectorStore - analyzeType: ${analyzeType}`);
  
  // Asistan konfigürasyonunu array içinden bulalım
  const assistantConfig = config.ASSISTANTS.find(asst => asst.type === analyzeType);
  
  if (!assistantConfig) {
    console.error(`${analyzeType} için asistan konfigürasyonu bulunamadı. Eşleşme yapılamadı.`);
    throw new Error(`${analyzeType} için asistan konfigürasyonu bulunamadı. Lütfen utils/consts.js dosyasında bu analiz tipi için bir konfigürasyon ekleyin.`);
  }

  try {
    const vectorStore = await openai.beta.vectorStores.retrieve(assistantConfig.vector_store_id);
    console.log(`${analyzeType} için mevcut vektör deposu: ${vectorStore.id}`);
    return vectorStore;
  } catch (error) {
    console.error(`${analyzeType} için mevcut vektör deposu alınamadı, yeni oluşturuluyor...`);
    try {
      const vectorStore = await openai.beta.vectorStores.create({
        name: assistantConfig.name + ' Belgeleri',
      });
      console.log(`${analyzeType} için yeni vektör deposu: ${vectorStore.id}`);
      return vectorStore;
    } catch (createError) {
      console.error(`${analyzeType} için vektör deposu oluşturulurken hata:`, createError.message);
      throw new Error(`${analyzeType} için vektör deposu oluşturulamadı: ${createError.message}`);
    }
  }
}

// Vektör deposuna dosyalar ekleme
async function addFilesToVectorStore(vectorStore, filePaths) {
  try {
    console.log(`addFilesToVectorStore - ${filePaths.length} dosya yükleniyor...`);
    const fileStreams = filePaths.map((path) => fs.createReadStream(path));

    // Dosyaların varlığını kontrol edin
    filePaths.forEach((path) => {
      if (!fs.existsSync(path)) {
        throw new Error(`Dosya bulunamadı: ${path}`);
      }
    });

    // Dosyaları vektör deposuna yükleyin ve işlem tamamlanana kadar bekleyin
    await openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
      files: fileStreams,
    });

    console.log('Dosyalar vektör deposuna yüklendi.');
  } catch (error) {
    console.error('Dosyalar vektör deposuna yüklenirken hata:', error.message);
    throw error;
  }
}

// Klasörden dosyaları vektör deposuna ekleme
async function addFilesFromFolderToVectorStore(vectorStore, folderPath) {
  try {
    console.log(`addFilesFromFolderToVectorStore - Klasör: ${folderPath}`);
    // Klasördeki tüm dosya ve klasörlerin isimlerini al
    const fileNames = fs.readdirSync(folderPath);

    // Tam dosya yollarını oluştur ve sadece dosyaları seç
    const filePaths = fileNames
      .map((fileName) => path.join(folderPath, fileName))
      .filter((filePath) => fs.statSync(filePath).isFile());

    if (filePaths.length === 0) {
      throw new Error('Belirtilen klasörde yüklenebilecek dosya bulunamadı.');
    }

    console.log(`${filePaths.length} dosya bulundu.`);
    // Dosyaların varlığını kontrol edin ve dosya akışlarını oluşturun
    const fileStreams = filePaths.map((filePath) => {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Dosya bulunamadı: ${filePath}`);
      }
      return fs.createReadStream(filePath);
    });

    // Dosyaları vektör deposuna yükleyin ve işlem tamamlanana kadar bekleyin
    await openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
      files: fileStreams,
    });

    console.log('Klasördeki dosyalar vektör deposuna yüklendi.');
  } catch (error) {
    console.error('Klasördeki dosyalar vektör deposuna yüklenirken hata:', error.message);
    throw error;
  }
}

// Asistanı vektör deposuyla güncelleme
async function updateAssistantWithVectorStore(assistant, vectorStore) {
  try {
    await openai.beta.assistants.update(assistant.id, {
      tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
    });
    console.log(`Asistan (${assistant.id}) vektör deposu (${vectorStore.id}) ile güncellendi.`);
  } catch (error) {
    console.error('Asistan vektör deposuyla güncellenirken hata:', error.message);
    throw error;
  }
}

// Fonksiyonları dışa aktar
module.exports = {
  getOrCreateVectorStore,
  addFilesToVectorStore,
  addFilesFromFolderToVectorStore,
  updateAssistantWithVectorStore,
};