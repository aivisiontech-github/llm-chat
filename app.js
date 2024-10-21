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
  createThread,
  getAssistantResponse,
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
      const userMessage = `
      Using the data provided, create an analysis in ${language} (ensure the analysis is primarily focused on this language: ${language}). Please identify exercises that **may** pose potential risks, avoiding definitive conclusions if the information is uncertain. When explaining the reasons, use concise sentences. If possible, provide approximate risk levels using the following rating system:

      DisabilityType / Injury Levels: { Normal, ShouldObserve, ShouldProtect, Attention, Urgent }  
      TirednessType / Fatigue Levels: { Normal, Tired, Exhausted, Urgent }
            
      > **Note**: When presenting important points or emphasizing specific considerations, use markdown blockquotes for clarity. This will help to separate key notes from the main content. For example, critical observations or warnings can be highlighted in this format.
            
      Additionally, consider noting if the analysis involves assumptions, even if the data suggests certain trends or insights. Present the output in markdown format based on the given data: ${prompt}.
      `
      // İleti dizisi oluştur
      const thread = await createThread(userMessage);

      // SSE başlat
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      // Asistan yanıtını stream et
      await getAssistantResponse(thread, assistant, res);

      // Analizi veritabanına kaydetme işlemi burada yapılabilir,
      // ancak tam analiz metnini elde etmek için ek bir işlem gerekebilir

  } catch (error) {
      console.error('Error:', error.message);
      res.write(`data: ${JSON.stringify({ status: 'error', message: error.message })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
  }
});

// Tekrar app.listen çağrısına gerek yok, yukarıda zaten var
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });