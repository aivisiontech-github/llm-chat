// utils/assistant.js

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// OpenAI API anahtarınızı burada da dahil edin
const openai = require('./openai'); // openai.js dosyasından içe aktarın


// Mevcut asistan kimliği
const ASSISTANT_ID = 'asst_Z368IKrzBf1H6onIjVIdz28j'; // Mevcut asistan kimliği

// Asistan oluşturma veya mevcut olanı alma
async function getOrCreateAssistant() {
  if (ASSISTANT_ID) {
    // Mevcut asistanı alın
    try {
      const assistant = await openai.beta.assistants.retrieve(ASSISTANT_ID);
      console.log('Mevcut asistan kullanılıyor:', assistant.id);
      return assistant;
    } catch (error) {
      console.error('Mevcut asistan alınamadı, yeni bir asistan oluşturuluyor...');
    }
  }
  // Yeni bir asistan oluşturun
  const assistant = await openai.beta.assistants.create({
    name: 'Sağlık Analist Asistanı',
    instructions: 'With 20 years of experience and having worked as a physiotherapist in various parts of the world, you are an expert in analyzing medical data to assess which training exercises might be risky for professional players. You are an AI designed to evaluate the given information about a professional player, then provide insights into which training exercises could be potentially harmful based on their previous and current training routines. While considering on-field activities such as shooting drills, running drills, and other common exercises, you give technical advice on exercises that might pose a risk, explaining why they could be dangerous. You offer suggestions but avoid making absolute statements, providing balanced guidance on what could impact the player’s health and performance.',
    model: 'gpt-4o',
    tools: [{ type: 'file_search' }],
  });
  console.log('Yeni asistan oluşturuldu:', assistant.id);
  return assistant;
}

// İleti dizisi oluşturma
async function createThread(userMessage) {
  const thread = await openai.beta.threads.create({
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  });
  console.log('İleti dizisi oluşturuldu:', thread.id);
  return thread;
}

// Asistan yanıtını alma
async function getAssistantResponsev0(thread, assistant) {
  return new Promise((resolve, reject) => {
    let assistantResponse = '';
    const stream = openai.beta.threads.runs
      .stream(thread.id, {
        assistant_id: assistant.id,
      })
      .on('textCreated', () => console.log('Asistan yanıtlıyor...'))
      .on('messageDone', async (event) => {
        if (event.content[0].type === 'text') {
          const { text } = event.content[0];
          assistantResponse = text.value;
          console.log('Asistanın yanıtı:');
          console.log(assistantResponse);
          resolve(assistantResponse);
        } else {
          resolve('');
        }
      })
      .on('error', (error) => {
        console.error('Hata oluştu:', error);
        reject(error);
      });
  });
}

async function getAssistantResponse(thread, assistant, res) {
  try {
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
      stream: true
    });

    for await (const event of run) {
      if (event.event === "thread.message.delta") {
        const content = event.data.delta.content;
        if (content && content.length > 0 && content[0].type === "text") {
          const textValue = content[0].text.value;
          res.write(`data: ${JSON.stringify({ text: textValue })}\n\n`);
        }
      } else if (event.event === "thread.run.completed") {
        res.write(`data: ${JSON.stringify({ status: 'completed' })}\n\n`);
        res.write('data: [DONE]\n\n');
      } else if (event.event === "thread.run.failed") {
        res.write(`data: ${JSON.stringify({ status: 'failed', error: event.data.last_error })}\n\n`);
        res.write('data: [DONE]\n\n');
      }
    }
  } catch (error) {
    console.error('Error in getAssistantResponse:', error);
    res.write(`data: ${JSON.stringify({ status: 'error', message: error.message })}\n\n`);
    res.write('data: [DONE]\n\n');
  } finally {
    res.end();
  }
}
// Fonksiyonları dışa aktar
module.exports = {
  getOrCreateAssistant,
  createThread,
  getAssistantResponse,
};