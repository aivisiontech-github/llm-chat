const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')
const dotenv = require('dotenv')
const cors = require('cors')

// OpenAI API anahtarınızı burada da dahil edin
const openai = require('./utils/openai') // openai.js dosyasından içe aktarın

// MongoDB'den yapılandırma yükleme fonksiyonunu içe aktar
const { loadConfigFromMongoDB, clearConfigCache } = require('./utils/configLoader')

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

// MongoDB fonksiyonlarını içe aktar
const {
	connectToDatabase,
	saveAnalysis,
	getAnalysisById
} = require('./utils/mongodb')

const promptGenerator = require('./prompter')

dotenv.config() // Bu satır en üstte olmalı, ardından process.env kullanabilirsiniz.

const app = express()
const PORT = process.env.PORT || 3000

let assistant
let vectorStore

function generateUserMessage(config, language, sport, prompt, analyzeType) {
	if (analyzeType === 'Carpal') {
		return config.PROMPT_TEMPLATES.CARPAL
			.replace('{language}', language)
			.replace('{sport}', sport)
			.replace('{prompt}', prompt);
	}
	return config.PROMPT_TEMPLATES.NORMAL
		.replace('{language}', language)
		.replace('{sport}', sport)
		.replace('{prompt}', prompt);
}

;(async () => {
	try {
		// İlk başlangıçta MongoDB bağlantısını test et
		await connectToDatabase();
		console.log('MongoDB bağlantısı başarılı');
		
		// Config bağlantısını test et
		const initialConfig = await loadConfigFromMongoDB();
		console.log('MongoDB\'den yapılandırma yüklenmesi test edildi');
		
		// Sunucuyu başlat
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`)
		})
	} catch (error) {
		console.error('Error initializing connection:', error)
	}
})()

app.use(bodyParser.json())
app.use(cors())

app.post('/analiz/:apiAnahtari', async (req, res) => {
	try {
		// Her sorgu için MongoDB'den yapılandırmayı yeniden yükle
		const config = await loadConfigFromMongoDB(false); // Önbelleği kullanma, her zaman yeni veri al
		console.log('Bu sorgu için MongoDB\'den yapılandırma yüklendi');
		
		// API anahtarını doğrula
		const apiKey = req.params.apiAnahtari;
		if (apiKey !== config.API_KEY) {
			return res.status(403).json({ message: 'Geçersiz API anahtarı' });
		}

		const { language, data, sport } = req.body;

		if (!language || !data) {
			return res
				.status(400)
				.json({ message: 'Geçersiz istek. Dil ve veri gereklidir.' });
		}

		const { prompt, id, analyzeType } = promptGenerator(data.value);

		vectorStore = await getOrCreateVectorStore(analyzeType);
		assistant = await getOrCreateAssistant(analyzeType);
		await updateAssistantWithVectorStore(assistant, vectorStore);

		// MongoDB'den mevcut analizi kontrol et
		const existingAnalysis = await getAnalysisById(id);
		
		if (existingAnalysis) {
			res.writeHead(200, {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive',
			});
			res.write(`data: ${JSON.stringify({ content: existingAnalysis.analysis })}\n\n`);
			return res.end();
		}

		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
		});

		const userMessage = generateUserMessage(
			config,
			language,
			sport,
			prompt,
			analyzeType
		);
		let fullResponse = '';

		console.log('UserMessage: ', userMessage);

		const thread = await openai.beta.threads.create();
		await openai.beta.threads.messages.create(thread.id, {
			role: 'user',
			content: userMessage,
		});

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
		});

		for await (const event of run) {
			if (event.event === 'thread.message.delta') {
				const content = event.data.delta.content;
				if (content && content.length > 0 && content[0].type === 'text') {
					const textValue = content[0].text.value;
					fullResponse += textValue;
					res.write(`data: ${JSON.stringify({ content: textValue })}\n\n`);
				}
			}
		}

		// MongoDB'ye analiz sonucunu kaydet
		await saveAnalysis(id, fullResponse);

		// İşlem bittikten sonra önbelleği temizle
		await clearConfigCache();

		res.end();
	} catch (error) {
		console.error('Error:', error);
		res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
		res.end();
	}
});
