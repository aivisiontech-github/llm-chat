// utils/assistant.js

const OpenAI = require('openai')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

// OpenAI API anahtarınızı burada da dahil edin
const openai = require('./openai') // openai.js dosyasından içe aktarın
const config = require('./consts')

async function getOrCreateAssistant(analyzeType) {
	console.log(`getOrCreateAssistant çağrıldı - analyzeType: ${analyzeType}`);
	console.log(`Mevcut asistan tipleri: ${JSON.stringify(config.ASSISTANTS.map(asst => asst.type))}`);
	
	// Direkt olarak config içeriğini kontrol edelim
	const configAssistants = config.ASSISTANTS || [];
	console.log(`Config'den gelen asistan sayısı: ${configAssistants.length}`);
	configAssistants.forEach((asst, index) => {
		console.log(`Config'den gelen Asistan ${index + 1} - Tip: ${asst.type}, ID: ${asst.assistant_id}`);
	});
	
	// Asistan konfigürasyonunu array içinden bulalım
	const assistantConfig = config.ASSISTANTS.find(asst => asst.type === analyzeType);
	console.log(`${analyzeType} için asistan konfigürasyonu bulundu mu?: ${assistantConfig ? 'Evet' : 'Hayır'}`);
	
	if (!assistantConfig) {
		console.error(`${analyzeType} için asistan konfigürasyonu bulunamadı. Eşleşme yapılamadı.`);
		console.log(`Tüm asistanların eşitlik kontrolü:`);
		config.ASSISTANTS.forEach((asst, index) => {
			console.log(`Asistan ${index + 1} - Tip: ${asst.type}, Eşleşme: ${asst.type === analyzeType}, Tam karşılaştırma: "${asst.type}" === "${analyzeType}"`);
			console.log(`Tip türü: ${typeof asst.type}, analyzeType türü: ${typeof analyzeType}`);
		});
		
		throw new Error(`${analyzeType} için asistan konfigürasyonu bulunamadı. Lütfen utils/consts.js dosyasında bu analiz tipi için bir konfigürasyon ekleyin.`)
	}

	console.log(`Asistan konfigürasyonu bulundu: Tip=${assistantConfig.type}, ID=${assistantConfig.assistant_id}`);

	try {
		console.log(`${analyzeType} için asistan sorgulanıyor: ${assistantConfig.assistant_id}`);
		const assistant = await openai.beta.assistants.retrieve(assistantConfig.assistant_id)
		console.log(`${analyzeType} için mevcut asistan kullanılıyor:`, assistant.id)
		return assistant
	} catch (error) {
		console.error(`${analyzeType} için mevcut asistan alınamadı (${assistantConfig.assistant_id}), yeni bir asistan oluşturuluyor...`)
		console.error(`Hata detayları:`, error);
		try {
			console.log(`${analyzeType} için yeni asistan oluşturuluyor...`);
			console.log(`Parametreler: Tip=${assistantConfig.type}, Ad=${assistantConfig.name}`);
			console.log(`Talimatlar uzunluğu: ${assistantConfig.instructions?.length || 0} karakter`);
			
			const newAssistant = await openai.beta.assistants.create({
				name: assistantConfig.name,
				instructions: assistantConfig.instructions,
				model: 'gpt-4o',
				tools: [{ type: 'file_search' }],
			})
			console.log(`${analyzeType} için yeni asistan oluşturuldu:`, newAssistant.id)
			// Burada normalde config'i güncellemek isteyebilirsiniz, ancak şu an için bunu yapamıyoruz
			return newAssistant
		} catch (createError) {
			console.error(`${analyzeType} için asistan oluşturulurken hata:`, createError)
			console.error(`Hata detayları:`, createError.toString());
			console.error(`Hata yığını:`, createError.stack);
			throw new Error(`${analyzeType} için asistan oluşturulamadı: ${createError.message}`)
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
