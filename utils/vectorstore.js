// utils/vectorstore.js

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// OpenAI API anahtarınızı burada da dahil edin
const openai = require('./openai'); // openai.js dosyasından içe aktarın

const NORMAL_VECTOR_STORE_ID = 'vs_tYRGrhw3IFawWD2TayYfHvFp';
const CARPAL_VECTOR_STORE_ID = "vs_YqC6CaLVXmFTeaURJq2wp4ey";

async function getOrCreateVectorStore(analyzeType) {
  const VECTOR_STORE_ID = analyzeType === 'Carpal' ? CARPAL_VECTOR_STORE_ID : NORMAL_VECTOR_STORE_ID;

  try {
    const vectorStore = await openai.beta.vectorStores.retrieve(VECTOR_STORE_ID);
    console.log('Mevcut vektör deposu kullanılıyor:', vectorStore.id);
    return vectorStore;
  } catch (error) {
    console.error('Mevcut vektör deposu alınamadı, yeni bir vektör deposu oluşturuluyor...');
    const vectorStore = await openai.beta.vectorStores.create({
      name: analyzeType === 'Carpal' ? 'El Sağlık Belgeleri' : 'Sağlık Belgeleri',
    });
    console.log('Yeni vektör deposu oluşturuldu:', vectorStore.id);
    return vectorStore;
  }
}

// Vektör deposuna dosyalar ekleme
async function addFilesToVectorStore(vectorStore, filePaths) {
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
}

// Klasörden dosyaları vektör deposuna ekleme
async function addFilesFromFolderToVectorStore(vectorStore, folderPath) {
  // Klasördeki tüm dosya ve klasörlerin isimlerini al
  const fileNames = fs.readdirSync(folderPath);

  // Tam dosya yollarını oluştur ve sadece dosyaları seç
  const filePaths = fileNames
    .map((fileName) => path.join(folderPath, fileName))
    .filter((filePath) => fs.statSync(filePath).isFile());

  if (filePaths.length === 0) {
    throw new Error('Belirtilen klasörde yüklenebilecek dosya bulunamadı.');
  }

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
}

// Asistanı vektör deposuyla güncelleme
async function updateAssistantWithVectorStore(assistant, vectorStore) {
  await openai.beta.assistants.update(assistant.id, {
    tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
  });
  console.log('Asistan güncellendi ve vektör deposu eklendi.');
}

// Fonksiyonları dışa aktar
module.exports = {
  getOrCreateVectorStore,
  addFilesToVectorStore,
  addFilesFromFolderToVectorStore,
  updateAssistantWithVectorStore,
};