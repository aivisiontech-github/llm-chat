const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const dotenv = require('dotenv');
const admin = require('firebase-admin');

const promptGenerator = require("./prompter");

dotenv.config();  // Bu satır en üstte olmalı, ardından process.env kullanabilirsiniz.

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = 'test';
const openAPIkey = process.env.OPEN_API_KEY;

// Firebase Admin SDK'yı başlatma
const serviceAccount = require('./database.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ai4sports-analysis-default-rtdb.firebaseio.com"
});

const db = admin.database();

app.use(bodyParser.json());

function apiKeyMiddleware(req, res, next) {
  const apiKey = req.params.apiAnahtari;
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: 'Geçersiz API anahtarı' });
  }
  next();
}

app.post('/analiz/:apiAnahtari', apiKeyMiddleware, async (req, res) => {
  const { language, data } = req.body;

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

    const messages = [
      { role: "system", content: `With 20 years of experience and having worked as a physiotherapist in various parts of the world, you are an expert in analyzing medical data to determine which training exercises are not recommended for basketball players. You are an AI designed to obtain, read, and consider the given information about a basketball player, then evaluate and express which training exercises might be harmful based on previous and current training routines in basketball. Considering both on-field training activities such as shooting drills, running drills, and other common basketball exercises, you provide comprehensive advice on what might be detrimental to the player’s health and performance.` },
      { role: "user", content: `Using the data provided to you, create an analysis in ${language} and specifically identify which training exercises are risky. Include percentage levels and explain the reasons in short sentences. Data: ${prompt}` }
    ];

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo-16k',
        messages: messages,
        temperature: 0.8,
        max_tokens: 2000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAPIkey}`
        }
      }
    );

    const result = response.data;
    if (result.choices && result.choices[0].message && result.choices[0].message.content) {
      const analysis = result.choices[0].message.content;

      // Yeni analizi veritabanına kaydetme
      await analysisRef.set({
        analysis: analysis,
        timestamp: admin.database.ServerValue.TIMESTAMP
      });

      return res.json({ analysis });
    } else {
      return res.status(500).json({ message: 'API yanıtı beklenmeyen bir biçimde: ', result });
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    return res.status(500).json({ message: 'API çağrısı sırasında bir hata oluştu.', error: error.response ? error.response.data : error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});