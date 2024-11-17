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
    // Veritabanı kontrolü
    const snapshot = await analysisRef.once('value');
    if (snapshot.exists()) {
      // Eğer analiz varsa, SSE formatında gönder ve bitir
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });
      const existingAnalysis = snapshot.val().analysis;
      res.write(`data: ${JSON.stringify({ content: existingAnalysis })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    // SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    // Kullanıcı mesajını oluştur
    const userMessage = `Based on provided data, create a focused analysis of risky exercises for ${sport} sport in ${language}. Use RAG system references for sport-specific exercise recommendations.

    HEADING STRUCTURE:
    ${language === 'Turkish' ? `
    # Analiz ve Riskli Antrenman Egzersizleri
    
    ## Riskli Egzersizler ve Öneriler
    
    ### 1. [Egzersiz Adı]
    
    ## Sonuç ve Öneriler`
        : language === 'English' ? `
    # Analysis and High-Risk Training Exercises
    
    ## High-Risk Exercises and Recommendations
    
    ### 1. [Exercise Name]
    
    ## Conclusions and Recommendations`
          : `[Other languages follow similar structure]`}
    
    EXERCISE ANALYSIS FORMAT:
    ### [Number]. **[Egzersiz Adı]**
    - **Risk Düzeyi:** {Normal/ShouldObserve/ShouldProtect/Attention/Urgent}
    - **Etkilenen Kas Grupları:** {İlgili kas grupları}
    - **Detaylı Açıklama:** {En az 3 cümlelik detaylı açıklama}
    - **Alternatif Öneriler:**
      - {Alternatif 1}
      - {Alternatif 2}
      - {Alternatif 3}
    
    ANALYSIS REQUIREMENTS:
    - Analyze at least 7 different exercises
    - Focus on exercises specific to ${sport}
    - Consider athlete's current risk levels from data
    - Reference training methodologies from database
    - Provide practical, implementable alternatives
    - Add specific warnings using block quotes (>)
    
    CONCLUSIONS SHOULD:
    - Summarize key risk areas
    - Provide general training modification guidelines
    - Include monitoring recommendations
    
    Data for analysis: ${prompt}`;

    let fullResponse = '';

    // Thread ve run oluştur
    const thread = await openai.beta.threads.create();
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userMessage
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
      tools: [{ type: "file_search" }],
      tool_resources: {
        file_search: {
          vector_store_ids: [vectorStore.id]
        }
      },
      stream: true
    });

    // Stream'i işle ve gönder
    for await (const event of run) {
      if (event.event === "thread.message.delta") {
        const content = event.data.delta.content;
        if (content && content.length > 0 && content[0].type === "text") {
          const textValue = content[0].text.value;
          fullResponse += textValue;
          res.write(`data: ${JSON.stringify({ content: textValue })}\n\n`);
        }
      }
    }

    // Veritabanına kaydet
    await analysisRef.set({
      analysis: fullResponse,
      timestamp: admin.database.ServerValue.TIMESTAMP
    });

    // Stream'i sonlandır
    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// Tekrar app.listen çağrısına gerek yok, yukarıda zaten var
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });