// utils/assistant.js

const OpenAI = require('openai')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

// OpenAI API anahtarınızı burada da dahil edin
const openai = require('./openai') // openai.js dosyasından içe aktarın
const config = require('./consts')

async function getOrCreateAssistant(analyzeType) {
	console.log(`getOrCreateAssistant - analyzeType: ${analyzeType}`);
	
	// Asistan konfigürasyonunu array içinden bulalım
	const assistantConfig = config.ASSISTANTS.find(asst => asst.type === analyzeType);
	
	if (!assistantConfig) {
		console.error(`${analyzeType} için asistan konfigürasyonu bulunamadı.`);
		throw new Error(`${analyzeType} için asistan konfigürasyonu bulunamadı. Lütfen utils/consts.js dosyasında bu analiz tipi için bir konfigürasyon ekleyin.`);
	}

	console.log(`${analyzeType} için asistan konfigürasyonu bulundu (ID: ${assistantConfig.assistant_id})`);
	
	try {
		// Var olan asistanı getir
		const assistant = await openai.beta.assistants.retrieve(assistantConfig.assistant_id);
		console.log(`${analyzeType} için mevcut asistan bulundu: ${assistant.id}`);
		return assistant;
	} catch (error) {
		console.error(`${analyzeType} için mevcut asistan alınamadı, yeni oluşturuluyor...`);
		
		try {
			// Yeni asistan oluştur
			const assistant = await openai.beta.assistants.create({
				name: assistantConfig.name,
				instructions: assistantConfig.instructions,
				model: assistantConfig.model || 'gpt-4o',
				tools: [{ type: 'file_search' }],
			});
			console.log(`${analyzeType} için yeni asistan oluşturuldu: ${assistant.id}`);
			return assistant;
		} catch (createError) {
			console.error(`${analyzeType} için asistan oluşturulurken hata:`, createError.message);
			throw new Error(`${analyzeType} için asistan oluşturulamadı: ${createError.message}`);
		}
	}
}

// Yeni Thread ve Run oluşturma (Stream ve File Search ile)
async function createThreadAndRunWithFileSearch(
	assistantId,
	vectorStoreId,
	userMessage
) {
	try {
		console.log('Creating a thread...')
		const thread = await openai.beta.threads.create()
		console.log('Thread created:', thread.id)

		console.log('Adding a message to the thread...')
		await openai.beta.threads.messages.create(thread.id, {
			role: 'user',
			content: userMessage,
		})

		console.log('Running the thread with file search...')
		const run = await openai.beta.threads.runs.create(thread.id, {
			assistant_id: assistantId,
			tools: [{ type: 'file_search' }],
			tool_resources: {
				file_search: {
					vector_store_ids: [vectorStoreId],
				},
			},
			stream: true,
		})

		console.log("Assistant's response:")
		let fullResponse = ''

		for await (const event of run) {
			if (event.event === 'thread.message.delta') {
				const content = event.data.delta.content
				if (content && content.length > 0 && content[0].type === 'text') {
					const textValue = content[0].text.value
					fullResponse += textValue
					process.stdout.write(textValue)
				}
			} else if (event.event === 'thread.run.completed') {
				console.log('\nRun completed')
			} else if (event.event === 'thread.run.failed') {
				console.error('\nRun failed:', event.data.last_error)
			}
		}

		console.log('\n\nFull response:')
		console.log(fullResponse)

		return { threadId: thread.id, runId: run.id, response: fullResponse }
	} catch (error) {
		console.error('An error occurred:', error)
		throw error
	}
}

// Fonksiyonları dışa aktar
module.exports = {
	getOrCreateAssistant,
	createThreadAndRunWithFileSearch, // Yeni eklenen fonksiyon burada export ediliyor
}
