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

  const { prompt, id , analyzeType} = promptGenerator(data.value);

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
      //res.write('data: [DONE]\n\n');
      return res.end();
    }

    // SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const userMessage = `Create a focused exercise risk assessment in ${language} and spesificly this sport: ${sport}.

    STRUCTURE:
    1. Title: Exercise Assessment (Start with one hashtag # hierarchy)
    
    2. Overview section:
       - One paragraph summarizing all identified risks and key recommendations from the detailed sections below
       
    3. Main section for each affected muscle:
       ### [Muscle Name] ([High Risk Exercise]) (with two hashtag ## hierarchy)
       - Detailed explanation (2-3 sentences):
         • Specific injury risks and mechanisms
         • Potential complications
         • Direct connection to current condition
       - One precise alternative exercise with implementation details
       > Critical warning signs to monitor
    
    4. Training Modifications section by exercise type
    
    KEY REQUIREMENTS:
    - Provide clean markdown output without code blocks
    - Keep technical terminology minimal
    - Ensure overview accurately summarizes all detailed sections
    - Focus on practical, forward-looking recommendations
    - Give clear reasoning for each exercise restriction
    - Do not make the headings in other languages other than ${language}
    - Provide one specific, detailed alternative per muscle
    - Include only affected muscles from data
    
    IMPORTANT:
    - Do not mention analysis methods or data sources in the output
    - Keep focus on recommendations and risks, not diagnostics
    - Avoid technical jargon when possible
    - Make sure overview connects with detailed sections
    - Start the report with one hashtag # hierarchy
    
    Data for analysis: ${prompt}`;


    let fullResponse = '';

    console.log("UserMessage: ", userMessage);


    // Thread ve run oluştur
    const thread = await openai.beta.threads.create();
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userMessage
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
      tools: [{
        type: "file_search",
        file_search: {
          max_num_results: 10
        }
      }],
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
    //res.write('data: [DONE]\n\n');
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