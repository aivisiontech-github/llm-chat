// utils/assistant.js

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// OpenAI API anahtarınızı burada da dahil edin
const openai = require('./openai'); // openai.js dosyasından içe aktarın

const Normal_ASSISTANT_ID = 'asst_8lkR4QgTlBidzFznrX7Ui0We';
const Carpal_ASSISTANT_ID = "asst_ZSV8TYJxnCIl6ymT254x6OOl";

async function getOrCreateAssistant(analyzeType) {
  const ASSISTANT_ID = analyzeType === 'Carpal' ? Carpal_ASSISTANT_ID : Normal_ASSISTANT_ID;

  try {
    const assistant = await openai.beta.assistants.retrieve(ASSISTANT_ID);
    console.log('Mevcut asistan kullanılıyor:', assistant.id);
    return assistant;
  } catch (error) {
    console.error('Mevcut asistan alınamadı, yeni bir asistan oluşturuluyor...');
    return await openai.beta.assistants.create({
      name: analyzeType === 'Carpal' ? 'El Sağlığı Analist Asistanı' : 'Sağlık Analist Asistanı',
      instructions: `You are a specialized sports physiotherapist and athletic performance coach utilizing thermal data to assess fatigue and injury risk parameters. Based on thermography-identified fatigue and injuries risk levels, provide recommendations on which exercises athletes should avoid. Additionally, occasionally suggest alternative exercises or preventive practices to mitigate these risks. Your output should be concise, avoiding lengthy general information and focusing on specific situations. Work in conjunction with a file search system, addressing only reported problematic muscle groups and offering recommendations specific to these areas.

# Steps

1. Analyze thermography data to assess fatigue and injury risk.
2. Focus exclusively on problematic muscle groups reported to you.
3. Determine exercises to avoid based on identified risks.
4. Suggest alternative exercises or preventive practices sparingly when beneficial.
5. Ensure conclusions are concise and situation-specific.

# Output Format

Responses should be succinct and directly address the identified muscle issues and recommended exercise modifications.

# Notes

- Prioritize specific and reported issues over general advice.
- Consider the file search system in identifying problematic areas.
- Ensure that advice remains concise and relevant to the specific athlete's situation.`,
      model: 'gpt-4o',
      tools: [{ type: 'file_search' }],
    });
  }
}
// Yeni Thread ve Run oluşturma (Stream ve File Search ile)
async function createThreadAndRunWithFileSearch(assistantId, vectorStoreId, userMessage) {
  try {
    console.log("Creating a thread...");
    const thread = await openai.beta.threads.create();
    console.log("Thread created:", thread.id);

    console.log("Adding a message to the thread...");
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userMessage
    });

    console.log("Running the thread with file search...");
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
      tools: [{ type: "file_search" }],
      tool_resources: {
        file_search: {
          vector_store_ids: [vectorStoreId]
        }
      },
      stream: true
    });

    console.log("Assistant's response:");
    let fullResponse = "";

    for await (const event of run) {
      if (event.event === "thread.message.delta") {
        const content = event.data.delta.content;
        if (content && content.length > 0 && content[0].type === "text") {
          const textValue = content[0].text.value;
          fullResponse += textValue;
          process.stdout.write(textValue);
        }
      } else if (event.event === "thread.run.completed") {
        console.log("\nRun completed");
      } else if (event.event === "thread.run.failed") {
        console.error("\nRun failed:", event.data.last_error);
      }
    }

    console.log("\n\nFull response:");
    console.log(fullResponse);

    return { threadId: thread.id, runId: run.id, response: fullResponse };
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// Fonksiyonları dışa aktar
module.exports = {
  getOrCreateAssistant,
  createThreadAndRunWithFileSearch,  // Yeni eklenen fonksiyon burada export ediliyor
};