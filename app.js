// app.js
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();  // Bu satır en üstte olmalı, ardından process.env kullanabilirsiniz.

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = 'test';
const openAPIkey = process.env.OPEN_API_KEY;

app.use(bodyParser.json());

function apiKeyMiddleware(req, res, next) {
  const apiKey = req.params.apiAnahtari;
  if (apiKey !== API_KEY) {
    return res.status(403).json({ message: 'Geçersiz API anahtarı' });
  }
  next();
}

// Eğitim Araçları - Hikaye Yazıcı API
app.post('/egitim/hikaye/:apiAnahtari', apiKeyMiddleware, async (req, res) => {
  const { story, theme } = req.body;

  if (!story || !theme) {
    return res.status(400).json({ message: 'Geçersiz istek. Hikaye ve tema gereklidir.' });
  }

  const messages = [
    { role: "system", content: `Sen Türkiye'de müslüman çocuklar için okul öncesinde dini değerleri veren bir hikaye tamamlayıcısın. Çocukların sana yazdığı hikayelerin devamını getiriyorsun. Olaylar Türkiye'de geçiyor ve tema ${theme}.` },
    { role: "user", content: story }
  ];

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: messages,
        temperature: 0
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
      const storyCompletion = result.choices[0].message.content;
      res.json({ storyCompletion });
    } else {
      res.status(500).json({ message: 'API yanıtı beklenmeyen bir biçimde: ', result });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'API çağrısı sırasında bir hata oluştu.', error: error.message });
  }
});

// Eğitim Araçları - İllustrasyon API
app.post('/egitim/illustrasyon/:apiAnahtari', apiKeyMiddleware, async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Geçersiz istek. Prompt gereklidir.' });
  }

  const resolution = '1024x1024'; // Geçerli bir boyut seçildi
  const modifiedPrompt = `A coloring book illustration of a ${prompt} for 6 years old`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        model: 'dall-e-3',
        prompt: modifiedPrompt,
        n: 1,
        size: resolution
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAPIkey}`
        }
      }
    );

    const result = response.data;
    if (result.data && result.data[0] && result.data[0].url) {
      const imageUrl = result.data[0].url;
      res.json({ imageUrl });
    } else {
      res.status(500).json({ message: 'API yanıtı beklenmeyen bir biçimde: ', result });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'API çağrısı sırasında bir hata oluştu.', error: error.message });
  }
});

// Eğitim Araçları - Bilmece Üretici API
app.post('/egitim/bilmece/:apiAnahtari', apiKeyMiddleware, async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ message: 'Geçersiz istek. Konu gereklidir.' });
  }

  const messages = [
    { role: "system", content: `Sen Türkiye'de okul öncesi ve ilkokul seviyesindeki çocuklar için bilmeceler oluşturan bir yardımcısın. Çocukların seçtiği konuya göre eğitici ve eğlenceli bilmeceler oluşturuyorsun. Konu: ${topic}.` },
    { role: "user", content: `${topic} konusunda birkaç bilmece oluştur.` }
  ];

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: messages,
        temperature: 0.7
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
      const riddles = result.choices[0].message.content;
      res.json({ riddles });
    } else {
      res.status(500).json({ message: 'API yanıtı beklenmeyen bir biçimde: ', result });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'API çağrısı sırasında bir hata oluştu.', error: error.message });
  }
});

// Beslenme Araçları - Yemek Çizdirme API
app.post('/beslenme/yemekcizdirme/:apiAnahtari', apiKeyMiddleware, async (req, res) => {
    const { soup, mainDish, dessert } = req.body;
  
    if (!soup || !mainDish || !dessert) {
      return res.status(400).json({ message: 'Geçersiz istek. Çorba, ana yemek ve tatlı gereklidir.' });
    }
  
    const modifiedPrompt = `A fun and colorful illustration of a meal for kids, including ${soup} soup, ${mainDish} as the main dish, and ${dessert} for dessert.`;
  
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          model: 'dall-e-3',
          prompt: modifiedPrompt,
          n: 1,
          size: '1024x1024'  // Geçerli bir boyut
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAPIkey}`
          }
        }
      );
  
      const result = response.data;
      if (result.data && result.data[0] && result.data[0].url) {
        const imageUrl = result.data[0].url;
        res.json({ imageUrl });
      } else {
        res.status(500).json({ message: 'API yanıtı beklenmeyen bir biçimde: ', result });
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      res.status(500).json({ message: 'API çağrısı sırasında bir hata oluştu.', error: error.response ? error.response.data : error.message });
    }
  });


// Beslenme Araçları - Sevilmeyen Yemek API
app.post('/beslenme/sevilmeyenyemek/:apiAnahtari', apiKeyMiddleware, async (req, res) => {
    const { gender, food, character } = req.body;
  
    if (!gender || !food || !character) {
      return res.status(400).json({ message: 'Geçersiz istek. Cinsiyet, yemek ve karakter gereklidir.' });
    }
  
    const modifiedPrompt = `A fun and colorful illustration of a ${gender === 'erkek' ? 'boy' : 'girl'} eating ${food} with ${character}. Make it look like a scene from a cartoon.`;
  
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          model: 'dall-e-3',
          prompt: modifiedPrompt,
          n: 1,
          size: '1024x1024'  // Geçerli bir boyut
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAPIkey}`
          }
        }
      );
  
      const result = response.data;
      if (result.data && result.data[0] && result.data[0].url) {
        const imageUrl = result.data[0].url;
        res.json({ imageUrl });
      } else {
        res.status(500).json({ message: 'API yanıtı beklenmeyen bir biçimde: ', result });
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      res.status(500).json({ message: 'API çağrısı sırasında bir hata oluştu.', error: error.response ? error.response.data : error.message });
    }
  });

// Matematik ve Bilim Araçları - Matematik Sorusu Üreteci API
app.post('/matematik/soruuretici/:apiAnahtari', apiKeyMiddleware, async (req, res) => {
    const { difficulty } = req.body;
  
    if (!difficulty) {
      return res.status(400).json({ message: 'Geçersiz istek. Zorluk seviyesi gereklidir.' });
    }
  
    const messages = [
      { role: "system", content: `Sen Türkiye'de okul öncesi ve ilkokul seviyesindeki çocuklar için matematik soruları oluşturan bir yardımcısın. Çocukların seçtiği zorluk seviyesine göre uygun sorular oluşturuyorsun. Her bir soruyu kısa bir hikaye içinde veriyorsun. Zorluk seviyesi: ${difficulty}.` },
      { role: "user", content: `Bana ${difficulty} seviyesinde 10 tane matematik sorusu oluştur.` }
    ];
  
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: messages,
          temperature: 0
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
        const mathQuestions = result.choices[0].message.content;
        res.json({ mathQuestions });
      } else {
        res.status(500).json({ message: 'API yanıtı beklenmeyen bir biçimde: ', result });
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      res.status(500).json({ message: 'API çağrısı sırasında bir hata oluştu.', error: error.response ? error.response.data : error.message });
    }
  });
// Matematik ve Bilim Araçları - Bilim Deneyi Üretici API
app.post('/bilim/deneyuretici/:apiAnahtari', apiKeyMiddleware, async (req, res) => {
    const { topic } = req.body;
  
    if (!topic) {
      return res.status(400).json({ message: 'Geçersiz istek. Konu gereklidir.' });
    }
  
    const messages = [
      { role: "system", content: `Sen Türkiye'de okul öncesi ve ilkokul seviyesindeki çocuklara evde yapılabilecek eğlenceli bilim deneyleri öneren bir yardımcısın. Çocukların seçtiği konuya göre basit ve anlaşılır deneyler öneriyorsun. Konu: ${topic}.` },
      { role: "user", content: `${topic} konusunda birkaç eğlenceli bilim deneyi öner.` }
    ];
  
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: messages,
          temperature: 0.7
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
        const scienceExperiments = result.choices[0].message.content;
        res.json({ scienceExperiments });
      } else {
        res.status(500).json({ message: 'API yanıtı beklenmeyen bir biçimde: ', result });
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      res.status(500).json({ message: 'API çağrısı sırasında bir hata oluştu.', error: error.response ? error.response.data : error.message });
    }
  });

  // Matematik ve Bilim Araçları - Bilim Soruları Üretici API
app.post('/bilim/soruuretici/:apiAnahtari', apiKeyMiddleware, async (req, res) => {
    const { difficulty } = req.body;
  
    if (!difficulty) {
      return res.status(400).json({ message: 'Geçersiz istek. Zorluk seviyesi gereklidir.' });
    }
  
    const messages = [
      { role: "system", content: `Sen Türkiye'de okul öncesi ve ilkokul seviyesindeki çocuklar için bilimle ilgili eğlenceli ve öğretici sorular hazırlayan bir yardımcısın. Çocukların seçtiği zorluk seviyesine göre sorular oluşturuyorsun. Zorluk Seviyesi: ${difficulty}.` },
      { role: "user", content: `${difficulty} seviyesinde birkaç bilim sorusu hazırla.` }
    ];
  
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: messages,
          temperature: 0.7
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
        const scienceQuestions = result.choices[0].message.content;
        res.json({ scienceQuestions });
      } else {
        res.status(500).json({ message: 'API yanıtı beklenmeyen bir biçimde: ', result });
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      res.status(500).json({ message: 'API çağrısı sırasında bir hata oluştu.', error: error.response ? error.response.data : error.message });
    }
  });


  // Dil ve Kelime Araçları - Dil Öğrenme Oyunu API
app.post('/dil/ogrenme/:apiAnahtari', apiKeyMiddleware, async (req, res) => {
    const { language, category } = req.body;
  
    if (!language || !category) {
      return res.status(400).json({ message: 'Geçersiz istek. Dil ve kategori gereklidir.' });
    }
  
    const messages = [
      { role: "system", content: `Sen Türkiye'de okul öncesi ve ilkokul seviyesindeki çocuklara yabancı dil öğretmek için oyunlar oluşturan bir yardımcısın. Çocukların seçtiği dile ve kategoriye göre uygun oyunlar oluşturuyorsun. Dil: ${language}, Kategori: ${category}.` },
      { role: "user", content: `${language} dilinde ${category} kategorisinde bir dil öğrenme oyunu oluştur.` }
    ];
  
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: messages,
          temperature: 0.7
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
        const languageGames = result.choices[0].message.content;
        res.json({ languageGames });
      } else {
        res.status(500).json({ message: 'API yanıtı beklenmeyen bir biçimde: ', result });
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      res.status(500).json({ message: 'API çağrısı sırasında bir hata oluştu.', error: error.response ? error.response.data : error.message });
    }
  });

  // Dil ve Kelime Araçları - Resimli Kelime Öğretici API
app.post('/dil/kelimeogretici/:apiAnahtari', apiKeyMiddleware, async (req, res) => {
    const { word } = req.body;
  
    if (!word) {
      return res.status(400).json({ message: 'Geçersiz istek. Kelime gereklidir.' });
    }
  
    try {
      // Kelime açıklama API çağrısı
      const explainResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            { role: "system", content: `Sen Türkiye'de okul öncesi ve ilkokul seviyesindeki çocuklara resimlerle yeni kelimeler öğreten bir yardımcısın. Çocukların seçtiği kelimenin anlamını açıklıyor ve ilgili bir resimle birlikte gösteriyorsun. Kelime: ${word}.` },
            { role: "user", content: `Kelime: ${word} ile ilgili bir resim göster ve kelimenin anlamını açıkla.` }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAPIkey}`
          }
        }
      );
  
      const explainResult = explainResponse.data;
      if (!explainResult.choices || !explainResult.choices[0].message || !explainResult.choices[0].message.content) {
        return res.status(500).json({ message: 'API yanıtı beklenmeyen bir biçimde: ', explainResult });
      }
  
      const wordExplanation = explainResult.choices[0].message.content;
  
      // Resim oluşturma API çağrısı
      const imageResponse = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          model: 'dall-e-3',
          prompt: `A drawing of a ${word} for children`,
          n: 1,
          size: '1024x1024'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAPIkey}`
          }
        }
      );
  
      const imageResult = imageResponse.data;
      if (!imageResult.data || !imageResult.data[0] || !imageResult.data[0].url) {
        return res.status(500).json({ message: 'API yanıtı beklenmeyen bir biçimde: ', imageResult });
      }
  
      const imageUrl = imageResult.data[0].url;
  
      res.json({ wordExplanation, imageUrl });
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      res.status(500).json({ message: 'API çağrısı sırasında bir hata oluştu.', error: error.response ? error.response.data : error.message });
    }
  });
// Dil ve Kelime Araçları - Şiir Yazma Oyunu API
app.post('/dil/siiryazma/:apiAnahtari', apiKeyMiddleware, async (req, res) => {
    const { theme } = req.body;
  
    if (!theme) {
      return res.status(400).json({ message: 'Geçersiz istek. Tema gereklidir.' });
    }
  
    const messages = [
      { role: "system", content: `Sen Türkiye'de okul öncesi ve ilkokul seviyesindeki çocuklara belirli temalarla ilgili eğlenceli şiirler yazma imkanı sunan bir yardımcısın. Çocukların seçtiği temaya göre basit ve eğlenceli şiirler oluşturuyorsun. Tema: ${theme}.` },
      { role: "user", content: `${theme} temalı bir şiir yaz.` }
    ];
  
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: messages,
          temperature: 0.7
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
        const poem = result.choices[0].message.content;
        res.json({ poem });
      } else {
        res.status(500).json({ message: 'API yanıtı beklenmeyen bir biçimde: ', result });
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      res.status(500).json({ message: 'API çağrısı sırasında bir hata oluştu.', error: error.response ? error.response.data : error.message });
    }
  });

// Zeka ve Bilgi Araçları - Zeka Oyunları API
app.post('/zeka/zekaoyunlari/:apiAnahtari', apiKeyMiddleware, async (req, res) => {
    const { age } = req.body;
  
    if (!age) {
      return res.status(400).json({ message: 'Geçersiz istek. Yaş gereklidir.' });
    }
  
    const messages = [
      { role: "system", content: `Sen Türkiye'de okul öncesi ve ilkokul seviyesindeki çocuklar için zeka geliştiren oyunlar hazırlayan bir yardımcısın. Çocukların yaşına göre oyun talimatları oluşturuyorsun. Yaş: ${age}.` },
      { role: "user", content: `${age} yaşındaki çocuklar için bir zeka oyunu talimatı hazırla.` }
    ];
  
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: messages,
          temperature: 0.7
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
        const gameInstructions = result.choices[0].message.content;
        res.json({ gameInstructions });
      } else {
        res.status(500).json({ message: 'API yanıtı beklenmeyen bir biçimde: ', result });
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      res.status(500).json({ message: 'API çağrısı sırasında bir hata oluştu.', error: error.response ? error.response.data : error.message });
    }
  });

  // Zeka ve Bilgi Araçları - Mantık Bulmacaları API
app.post('/zeka/mantikbulmacalari/:apiAnahtari', apiKeyMiddleware, async (req, res) => {
    const { difficulty } = req.body;
  
    if (!difficulty) {
      return res.status(400).json({ message: 'Geçersiz istek. Zorluk seviyesi gereklidir.' });
    }
  
    const messages = [
      { role: "system", content: `Sen Türkiye'de okul öncesi ve ilkokul seviyesindeki çocuklar için mantık bulmacaları hazırlayan bir yardımcısın. Çocukların seçtiği zorluk seviyesine göre bulmacalar oluşturuyorsun. Zorluk Seviyesi: ${difficulty}.` },
      { role: "user", content: `${difficulty} seviyesinde birkaç mantık bulmacası hazırla.` }
    ];
  
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: messages,
          temperature: 0.7
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
        const puzzles = result.choices[0].message.content;
        res.json({ puzzles });
      } else {
        res.status(500).json({ message: 'API yanıtı beklenmeyen bir biçimde: ', result });
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      res.status(500).json({ message: 'API çağrısı sırasında bir hata oluştu.', error: error.response ? error.response.data : error.message });
    }
  });
// Zeka ve Bilgi Araçları - Bilgi Yarışması Aracı API
app.post('/zeka/bilgiyarismasi/:apiAnahtari', apiKeyMiddleware, async (req, res) => {
    const { topic } = req.body;
  
    if (!topic) {
      return res.status(400).json({ message: 'Geçersiz istek. Konu gereklidir.' });
    }
  
    const messages = [
      { role: "system", content: `Sen Türkiye'de okul öncesi ve ilkokul seviyesindeki çocuklar için bilgi yarışması soruları hazırlayan bir yardımcısın. Çocukların seçtiği konuya göre eğlenceli ve öğretici sorular oluşturuyorsun. Konu: ${topic}.` },
      { role: "user", content: `${topic} konusunda birkaç bilgi yarışması sorusu hazırla.` }
    ];
  
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: messages,
          temperature: 0.7
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
        const quizQuestions = result.choices[0].message.content;
        res.json({ quizQuestions });
      } else {
        res.status(500).json({ message: 'API yanıtı beklenmeyen bir biçimde: ', result });
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      res.status(500).json({ message: 'API çağrısı sırasında bir hata oluştu.', error: error.response ? error.response.data : error.message });
    }
  });

// Zeka ve Bilgi Araçları - Zeka Soruları API
app.post('/zeka/zekasorulari/:apiAnahtari', apiKeyMiddleware, async (req, res) => {
    const { level } = req.body;
  
    if (!level) {
      return res.status(400).json({ message: 'Geçersiz istek. Seviye gereklidir.' });
    }
  
    const messages = [
      { role: "system", content: `Sen Türkiye'de okul öncesi ve ilkokul seviyesindeki çocuklar için zeka soruları hazırlayan bir yardımcısın. Çocukların seçtiği seviyeye göre sorular oluşturuyorsun. Seviye: ${level}.` },
      { role: "user", content: `${level} seviyesinde birkaç zeka sorusu hazırla.` }
    ];
  
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: messages,
          temperature: 0.7
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
        const intelligenceQuestions = result.choices[0].message.content;
        res.json({ intelligenceQuestions });
      } else {
        res.status(500).json({ message: 'API yanıtı beklenmeyen bir biçimde: ', result });
      }
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      res.status(500).json({ message: 'API çağrısı sırasında bir hata oluştu.', error: error.response ? error.response.data : error.message });
    }
  });
// Doğa ve Bilim Araçları - Doğa Bilimleri Öğretici API
app.post('/dogabilim/dogabilimleri/:apiAnahtari', apiKeyMiddleware, async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ message: 'Geçersiz istek. Konu başlığı gereklidir.' });
  }

  const messages = [
    { role: "system", content: `Sen Türkiye'de okul öncesi ve ilkokul seviyesindeki çocuklara doğa bilimleri hakkında öğretici bilgiler sunan bir yardımcısın. Çocukların seçtiği konu hakkında ilginç ve öğretici bilgiler veriyorsun. Konu: ${topic}.` },
    { role: "user", content: `${topic} hakkında öğretici bilgiler ver.` }
  ];

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: messages,
        temperature: 0.7
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
      const natureFacts = result.choices[0].message.content;
      res.json({ natureFacts });
    } else {
      res.status(500).json({ message: 'API yanıtı beklenmeyen bir biçimde: ', result });
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'API çağrısı sırasında bir hata oluştu.', error: error.response ? error.response.data : error.message });
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});