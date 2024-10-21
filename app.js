const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const cors = require('cors');

// OpenAI API anahtarınızı burada da dahil edin
const openai = require('./utils/openai'); // openai.js dosyasından içe aktarın

// Fonksiyonları içe aktar
const {
  getOrCreateAssistant,
  createThreadAndRunWithFileSearch,  // Yeni stream fonksiyonu eklendi
} = require('./utils/assistant');

const {
  getOrCreateVectorStore,
  addFilesToVectorStore,
  addFilesFromFolderToVectorStore,
  updateAssistantWithVectorStore,
} = require('./utils/vectorstore');

const promptGenerator = require("./prompter");

dotenv.config();  // Bu satır en üstte olmalı, ardından process.env kullanabilirsiniz.

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = 'test';

// Firebase Admin SDK'yı başlatma
const serviceAccount = require('./database.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ai4sports-analysis-default-rtdb.firebaseio.com"
});

let assistant;
let vectorStore;

(async () => {
  try {
    // Asistanı al veya oluştur
    assistant = await getOrCreateAssistant();

    // Vektör deposunu al veya oluştur
    vectorStore = await getOrCreateVectorStore();

    // Asistanı vektör deposuyla güncelle
    await updateAssistantWithVectorStore(assistant, vectorStore);

    // Sunucuyu başlat
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error initializing assistant or vector store:', error);
  }
})();

const db = admin.database();

app.use(bodyParser.json());
app.use(cors()); 

function apiKeyMiddleware(req, res, next) {
  const apiKey = req.params.apiAnahtari;
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: 'Geçersiz API anahtarı' });
  }
  next();
}

app.post('/analiz/:apiAnahtari', apiKeyMiddleware, async (req, res) => {
    const { language, data, sport } = req.body;

    if (!language || !data) {
        return res.status(400).json({ message: 'Geçersiz istek. Dil ve veri gereklidir.' });
    }

    const { prompt, id } = promptGenerator(data.value);

    const ref = db.ref("analyses");
    const analysisRef = ref.child(id);

    try {
        // Veritabanında belirli bir ID ile analiz olup olmadığını kontrol etme
        const snapshot = await analysisRef.once('value');
        if (snapshot.exists()) {
            // Eğer analiz zaten varsa, bu analizi döndür
            const existingAnalysis = snapshot.val().analysis;
            return res.json({ analysis: existingAnalysis });
        }

        // Kullanıcı mesajını oluştur
        const userMessage = `Using the data provided to you, create an analysis in ${language} and specifically identify which training exercises are risky. Explain the reasons in short sentences. When providing risk levels, keep in mind that the rating system is as follows: DisabilityType / Injury Levels are: { Normal, ShouldObserve, ShouldProtect, Attention, Urgent } TirednessType / Fatigue Levels are: { Normal, Tired, Exhausted, Urgent } Data: ${prompt}`;

        // Yeni thread ve dosya arama işlemi başlat
        const { threadId, runId, response } = await createThreadAndRunWithFileSearch(assistant.id, vectorStore.id, userMessage);

        // Yeni analizi veritabanına kaydetme
        await analysisRef.set({
            analysis: response,
            timestamp: admin.database.ServerValue.TIMESTAMP
        });

        return res.json({ analysis: response });
    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({ message: 'API çağrısı sırasında bir hata oluştu.', error: error.message });
    }
});

// Tekrar app.listen çağrısına gerek yok, yukarıda zaten var
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });