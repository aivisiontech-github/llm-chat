const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')
const dotenv = require('dotenv')
const admin = require('firebase-admin')
const cors = require('cors')

// OpenAI API anahtarınızı burada da dahil edin
const openai = require('./utils/openai') // openai.js dosyasından içe aktarın

// Sabitleri içe aktar
const {
	API_KEY,
	normalPromptTemplate,
	carpalPromptTemplate
} = require('./utils/consts')

// Fonksiyonları içe aktar
const {
	getOrCreateAssistant,
	createThreadAndRunWithFileSearch, // Yeni stream fonksiyonu eklendi
} = require('./utils/assistant')

const {
	getOrCreateVectorStore,
	addFilesToVectorStore,
	addFilesFromFolderToVectorStore,
	updateAssistantWithVectorStore,
} = require('./utils/vectorstore')

const promptGenerator = require('./prompter')

dotenv.config() // Bu satır en üstte olmalı, ardından process.env kullanabilirsiniz.

const app = express()
const PORT = process.env.PORT || 3000

// Firebase Admin SDK'yı başlatma
const serviceAccount = require('./database.json')

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://ai4sports-analysis-default-rtdb.firebaseio.com',
})

let assistant
let vectorStore

function generateUserMessage(language, sport, prompt, analyzeType) {
	if (analyzeType === 'Carpal') {
		return carpalPromptTemplate.replace('{language}', language)
			.replace('{sport}', sport)
			.replace('{prompt}', prompt);
	}
	return normalPromptTemplate.replace('{language}', language)
		.replace('{sport}', sport)
		.replace('{prompt}', prompt);
}

;(async () => {
	try {
		// Asistanı al veya oluştur
		// Sunucuyu başlat
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`)
		})
	} catch (error) {
		console.error('Error initializing assistant or vector store:', error)
	}
})()

const db = admin.database()

app.use(bodyParser.json())
app.use(cors())

function apiKeyMiddleware(req, res, next) {
	const apiKey = req.params.apiAnahtari
	if (apiKey !== API_KEY) {
		return res.status(403).json({ message: 'Geçersiz API anahtarı' })
	}
	next()
}

app.post('/analiz/:apiAnahtari', apiKeyMiddleware, async (req, res) => {
	const { language, data, sport } = req.body

	if (!language || !data) {
		return res
			.status(400)
			.json({ message: 'Geçersiz istek. Dil ve veri gereklidir.' })
	}

	const { prompt, id, analyzeType } = promptGenerator(data.value)

	vectorStore = await getOrCreateVectorStore(analyzeType)
	assistant = await getOrCreateAssistant(analyzeType)
	await updateAssistantWithVectorStore(assistant, vectorStore)

	const ref = db.ref('analyses')
	const analysisRef = ref.child(id)

	try {
		const snapshot = await analysisRef.once('value')
		if (snapshot.exists()) {
			res.writeHead(200, {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive',
			})
			const existingAnalysis = snapshot.val().analysis
			res.write(`data: ${JSON.stringify({ content: existingAnalysis })}\n\n`)
			return res.end()
		}

		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
		})

		const userMessage = generateUserMessage(
			language,
			sport,
			prompt,
			analyzeType
		)
		let fullResponse = ''

		console.log('UserMessage: ', userMessage)

		const thread = await openai.beta.threads.create()
		await openai.beta.threads.messages.create(thread.id, {
			role: 'user',
			content: userMessage,
		})

		const run = await openai.beta.threads.runs.create(thread.id, {
			assistant_id: assistant.id,
			tools: [
				{
					type: 'file_search',
					file_search: {
						max_num_results: 10,
					},
				},
			],
			tool_resources: {
				file_search: {
					vector_store_ids: [vectorStore.id],
				},
			},
			stream: true,
		})

		for await (const event of run) {
			if (event.event === 'thread.message.delta') {
				const content = event.data.delta.content
				if (content && content.length > 0 && content[0].type === 'text') {
					const textValue = content[0].text.value
					fullResponse += textValue
					res.write(`data: ${JSON.stringify({ content: textValue })}\n\n`)
				}
			}
		}

		await analysisRef.set({
			analysis: fullResponse,
			timestamp: admin.database.ServerValue.TIMESTAMP,
		})

		res.end()
	} catch (error) {
		console.error('Error:', error)
		res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`)
		res.end()
	}
})

// Tekrar app.listen çağrısına gerek yok, yukarıda zaten var
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
