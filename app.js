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
	console.log(`generateUserMessage - Analiz tipi: ${analyzeType}, Mevcut asistanlar: ${JSON.stringify(config.ASSISTANTS.map(a => a.type))}`);
	
	// Asistan konfigürasyonunu array içinden bulalım
	const assistantConfig = config.ASSISTANTS.find(asst => asst.type === analyzeType);
	if (!assistantConfig) {
		console.warn(`${analyzeType} için asistan konfigürasyonu bulunamadı, varsayılan olarak NORMAL kullanılıyor.`);
		// Varsayılan olarak NORMAL tipi kullan
		const defaultConfig = config.ASSISTANTS.find(asst => asst.type === 'NORMAL');
		if (!defaultConfig) {
			throw new Error('Varsayılan asistan konfigürasyonu (NORMAL) bulunamadı!');
		}
		console.log(`Varsayılan asistan (NORMAL) kullanılıyor - ID: ${defaultConfig.assistant_id}`);
		return defaultConfig.prompt_template
			.replace('{language}', language)
			.replace('{sport}', sport)
			.replace('{prompt}', prompt);
	}
	
	console.log(`Asistan bulundu - Tip: ${assistantConfig.type}, ID: ${assistantConfig.assistant_id}`);
	return assistantConfig.prompt_template
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
		console.log('MongoDB\'den yapılandırma yükleniyor...');
		// MongoDB'den yapılandırmayı her istekte yeniden yüklemek yerine, cache kullanarak yükleyelim
		// İlk seferde false ile çağırıp güncel veriyi alalım, sonraki isteklerde önbellekteki veriyi kullanabiliriz
		const config = await loadConfigFromMongoDB(true); // Önbelleği kullan
		console.log(`Yapılandırma yüklendi. Mevcut asistan tipleri: ${JSON.stringify(config.ASSISTANTS.map(a => a.type))}`);
		
		// API anahtarını doğrula
		const apiKey = req.params.apiAnahtari;
		if (apiKey !== config.API_KEY) {
			console.error(`Geçersiz API anahtarı: ${apiKey}`);
			return res.status(403).json({ message: 'Geçersiz API anahtarı' });
		}
		console.log('API anahtarı doğrulandı');

		const { language, data, sport } = req.body;
		console.log(`İstek: Dil=${language}, Spor=${sport}`);
		// Çok uzun log çıktısını kısaltalım
		console.log(`Data tipi ve ID: ${data.value?.analyzeType}, ${data.value?.id}`);

		if (!language || !data) {
			console.error('Eksik veri: Dil veya veri eksik');
			return res
				.status(400)
				.json({ message: 'Geçersiz istek. Dil ve veri gereklidir.' });
		}

		console.log('promptGenerator fonksiyonu çağrılıyor...');
		const { prompt, id, analyzeType } = promptGenerator(data.value);
		console.log(`Verilerden analiz tipi belirlendi: ${analyzeType} (orjinal)`);
		
		// analyzeType değerini büyük harfe çevirerek asistan yapısındaki type ile eşleştir
		const assistantType = analyzeType.toUpperCase();
		console.log(`Asistan tipi (büyük harfle): ${assistantType}`);
		
		// MongoDB'den mevcut analizi kontrol et
		console.log(`MongoDB'den ID=${id} için mevcut analiz kontrol ediliyor...`);
		const existingAnalysis = await getAnalysisById(id);
		
		// Önce mevcut analiz kontrolü yapalım, böylece eğer varsa gereksiz asistan yükleme gibi işlemler yapmayalım
		if (existingAnalysis) {
			console.log(`Mevcut analiz bulundu, doğrudan dönülüyor: ID=${id}`);
			res.writeHead(200, {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive',
			});
			res.write(`data: ${JSON.stringify({ content: existingAnalysis.analysis })}\n\n`);
			return res.end();
		}
		console.log(`Mevcut analiz bulunamadı, yeni analiz yapılacak`);
		
		// Asistanın yapılandırmada mevcut olup olmadığını kontrol et
		const assistantConfig = config.ASSISTANTS.find(asst => asst.type === assistantType);
		if (!assistantConfig) {
			console.warn(`${assistantType} için yapılandırmada bir asistan bulunamadı. NORMAL tip kullanılacak.`);
		} else {
			console.log(`Asistan konfigürasyonu bulundu: Tip=${assistantConfig.type}, ID=${assistantConfig.assistant_id}, VectorStore=${assistantConfig.vector_store_id}`);
		}
		
		// Asistan ve vektör deposunu yükle
		try {
			console.log(`${assistantType} için asistan ve vektör deposu alınıyor...`);
			
			vectorStore = await getOrCreateVectorStore(assistantType);
			console.log(`Vektör deposu alındı: ${vectorStore.id}`);
			
			assistant = await getOrCreateAssistant(assistantType);
			console.log(`Asistan alındı: ${assistant.id}`);
			
			await updateAssistantWithVectorStore(assistant, vectorStore);
			console.log(`Asistan vektör deposu ile güncellendi`);
		} catch (error) {
			console.warn(`${assistantType} için asistan bulunamadı, varsayılan olarak NORMAL kullanılıyor:`, error.message);
			
			console.log(`NORMAL tipi için asistan ve vektör deposu alınıyor...`);
			vectorStore = await getOrCreateVectorStore('NORMAL');
			console.log(`NORMAL vektör deposu alındı: ${vectorStore.id}`);
			
			assistant = await getOrCreateAssistant('NORMAL');
			console.log(`NORMAL asistan alındı: ${assistant.id}`);
			
			await updateAssistantWithVectorStore(assistant, vectorStore);
			console.log(`NORMAL asistan vektör deposu ile güncellendi`);
		}

		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
		});

		console.log(`Kullanıcı mesajı oluşturuluyor...`);
		const userMessage = generateUserMessage(
			config,
			language,
			sport,
			prompt,
			assistantType // Burada assistantType kullanıyoruz
		);

		console.log(`OpenAI thread oluşturuluyor...`);
		const thread = await openai.beta.threads.create();
		console.log(`Thread oluşturuldu: ${thread.id}`);

		console.log(`Thread'e mesaj ekleniyor...`);
		await openai.beta.threads.messages.create(thread.id, {
			role: 'user',
			content: userMessage,
		});
		console.log(`Mesaj eklendi`);

		console.log(`Thread çalıştırılıyor... Asistan ID: ${assistant.id}`);
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
		console.log(`Run başlatıldı: ${run.id || 'ID bulunamadı'}`);

		console.log(`Stream'den yanıt bekleniyor...`);
		let fullResponse = '';
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
		console.log(`Stream tamamlandı, yanıt alındı (${fullResponse.length} karakter)`);

		// MongoDB'ye analiz sonucunu kaydet
		console.log(`Analiz sonucu MongoDB'ye kaydediliyor: ID=${id}`);
		await saveAnalysis(id, fullResponse);
		console.log(`Analiz kaydedildi`);

		// İşlem bittikten sonra önbelleği temizlemeyi artık yapmayalım
		// Her istekte önbelleği temizlemek yerine, uzun periyotlarla ya da gerektiğinde temizlenebilir
		// console.log(`Config önbelleği temizleniyor...`);
		// await clearConfigCache();
		// console.log(`Önbellek temizlendi`);

		console.log(`İşlem başarıyla tamamlandı`);
		res.end();
	} catch (error) {
		console.error('Hata oluştu:', error);
		console.error('Hata yığını:', error.stack);
		res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
		res.end();
	}
});
