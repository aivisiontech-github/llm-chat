# Uzhane

Bu proje, çeşitli eğitim araçları sağlayan API'ler içermektedir. API'ler arasında hikaye yazıcı, illüstrasyon oluşturucu, bilmece üretici, yemek çizdirme, sevilmeyen yemek, matematik soru üretici, bilim deneyi üretici, bilim soruları üretici, dil öğrenme oyunu, resimli kelime öğretici, şiir yazma oyunu, zeka oyunları, mantık bulmacaları, bilgi yarışması ve zeka soruları gibi araçlar bulunmaktadır.

## Gereksinimler

- Node.js
- Express.js
- Body-parser
- Axios
- dotenv

## Kurulum

1. Bu depoyu klonlayın veya indirin.
2. Proje dizininde bir `.env` dosyası oluşturun ve OpenAI API anahtarınızı ekleyin:
   ```
   OPEN_API_KEY=your_openai_api_key
   ```
3. Gerekli paketleri yükleyin:
   ```
   npm install
   ```

## Çalıştırma

Sunucuyu başlatmak için aşağıdaki komutu kullanın:
```
node app.js
```

Sunucu varsayılan olarak 3000 portunda çalışacaktır.

## API Kullanımı

### Eğitim Araçları

#### 1. Hikaye Yazıcı API

Hikaye ve tema bilgilerini kullanarak hikaye tamamlayan bir API.

- URL: `/egitim/hikaye/:apiAnahtari`
- Metod: POST
- İstek Gövdesi:
  ```json
  {
    "story": "Hikayenin başlangıcı...",
    "theme": "Tema"
  }
  ```
- Yanıt:
  ```json
  {
    "storyCompletion": "Tamamlanan hikaye..."
  }
  ```

#### 2. İllustrasyon API

Çocuklar için renklendirme kitabı illüstrasyonları oluşturan bir API.

- URL: `/egitim/illustrasyon/:apiAnahtari`
- Metod: POST
- İstek Gövdesi:
  ```json
  {
    "prompt": "Çizilecek şeyin tanımı"
  }
  ```
- Yanıt:
  ```json
  {
    "imageUrl": "Oluşturulan resmin URL'si"
  }
  ```

#### 3. Bilmece Üretici API

Belirtilen konuya göre bilmeceler oluşturan bir API.

- URL: `/egitim/bilmece/:apiAnahtari`
- Metod: POST
- İstek Gövdesi:
  ```json
  {
    "topic": "Bilmece konusu"
  }
  ```
- Yanıt:
  ```json
  {
    "riddles": "Oluşturulan bilmeceler"
  }
  ```

### Beslenme Araçları

#### 1. Yemek Çizdirme API

Çocuklar için eğlenceli yemek çizimleri oluşturan bir API.

- URL: `/beslenme/yemekcizdirme/:apiAnahtari`
- Metod: POST
- İstek Gövdesi:
  ```json
  {
    "soup": "Çorba adı",
    "mainDish": "Ana yemek adı",
    "dessert": "Tatlı adı"
  }
  ```
- Yanıt:
  ```json
  {
    "imageUrl": "Oluşturulan resmin URL'si"
  }
  ```

#### 2. Sevilmeyen Yemek API

Çocukların sevmediği yemeklerin çizimlerini oluşturan bir API.

- URL: `/beslenme/sevilmeyenyemek/:apiAnahtari`
- Metod: POST
- İstek Gövdesi:
  ```json
  {
    "gender": "Cinsiyet (erkek/kız)",
    "food": "Yemek adı",
    "character": "Karakter adı"
  }
  ```
- Yanıt:
  ```json
  {
    "imageUrl": "Oluşturulan resmin URL'si"
  }
  ```

### Matematik ve Bilim Araçları

#### 1. Matematik Sorusu Üreteci API

Belirtilen zorluk seviyesinde matematik soruları oluşturan bir API.

- URL: `/matematik/soruuretici/:apiAnahtari`
- Metod: POST
- İstek Gövdesi:
  ```json
  {
    "difficulty": "Zorluk seviyesi (kolay/orta/zor)"
  }
  ```
- Yanıt:
  ```json
  {
    "mathQuestions": "Oluşturulan matematik soruları"
  }
  ```

#### 2. Bilim Deneyi Üretici API

Belirtilen konuda bilim deneyleri öneren bir API.

- URL: `/bilim/deneyuretici/:apiAnahtari`
- Metod: POST
- İstek Gövdesi:
  ```json
  {
    "topic": "Bilim deneyi konusu"
  }
  ```
- Yanıt:
  ```json
  {
    "scienceExperiments": "Oluşturulan bilim deneyleri"
  }
  ```

#### 3. Bilim Soruları Üretici API

Belirtilen zorluk seviyesinde bilim soruları oluşturan bir API.

- URL: `/bilim/soruuretici/:apiAnahtari`
- Metod: POST
- İstek Gövdesi:
  ```json
  {
    "difficulty": "Zorluk seviyesi (kolay/orta/zor)"
  }
  ```
- Yanıt:
  ```json
  {
    "scienceQuestions": "Oluşturulan bilim soruları"
  }
  ```

### Dil ve Kelime Araçları

#### 1. Dil Öğrenme Oyunu API

Belirtilen dil ve kategoriye göre dil öğrenme oyunları oluşturan bir API.

- URL: `/dil/ogrenme/:apiAnahtari`
- Metod: POST
- İstek Gövdesi:
  ```json
  {
    "language": "Öğrenilecek dil",
    "category": "Kategori"
  }
  ```
- Yanıt:
  ```json
  {
    "languageGames": "Oluşturulan dil öğrenme oyunları"
  }
  ```

#### 2. Resimli Kelime Öğretici API

Çocuklara resimlerle yeni kelimeler öğreten bir API.

- URL: `/dil/kelimeogretici/:apiAnahtari`
- Metod: POST
- İstek Gövdesi:
  ```json
  {
    "word": "Öğretilecek kelime"
  }
  ```
- Yanıt:
  ```json
  {
    "wordExplanation": "Kelimenin açıklaması",
    "imageUrl": "Oluşturulan resmin URL'si"
  }
  ```

#### 3. Şiir Yazma Oyunu API

Belirtilen tema ile ilgili eğlenceli şiirler oluşturan bir API.

- URL: `/dil/siiryazma/:apiAnahtari`
- Metod: POST
- İstek Gövdesi:
  ```json
  {
    "theme": "Şiir teması"
  }
  ```
- Yanıt:
  ```json
  {
    "poem": "Oluşturulan şiir"
  }
  ```

### Zeka ve Bilgi Araçları

#### 1. Zeka Oyunları API

Belirtilen yaşa uygun zeka oyunları talimatları oluşturan bir API.

- URL: `/zeka/zekaoyunlari/:apiAnahtari`
- Metod: POST
- İstek Gövdesi:
  ```json
  {
    "age": "Çocuğun yaşı"
  }
  ```
- Yanıt:
  ```json
  {
    "gameInstructions": "Oluşturulan oyun talimatları"
  }
  ```

#### 2. Mantık Bulmacaları API

Belirtilen zorluk seviyesinde mantık bulmacaları oluşturan bir API.

- URL: `/zeka/mantikbulmacalari/:apiAnahtari`
- Metod: POST
- İstek Gövdesi:
  ```json
  {
    "difficulty": "Zorluk seviyesi (kolay/orta/zor)"
  }
  ```
- Yanıt:
  ```json
  {
    "puzzles": "Oluşturulan mantık bulmacaları"
  }
  ```

#### 3. Bilgi Yarışması Aracı API

Belirtilen konuya göre bilgi yarışması soruları oluşturan bir API.

- URL: `/zeka/bilgiyarismasi/:apiAnahtari`
- Metod: POST
- İstek Gövdesi:
  ```json
  {
    "topic": "Bilgi yarışması konusu"
  }
  ```
- Yanıt:
  ```json
  {
    "quizQuestions": "Oluşturulan bilgi yarışması soruları"
  }
  ```

#### 4. Zeka Soruları API

Belirtilen seviyeye uygun zeka soruları oluşturan bir API.

- URL: `/zeka/zekasorulari/:apiAnahtari`
- Metod: POST
- İstek Gövdesi

  ```json
  {
    "level": "Zorluk seviyesi (kolay/orta/zor)"
  }
  ```
- Yanıt:
  ```json
  {
    "intelligenceQuestions": "Oluşturulan zeka soruları"
  }
  ```

### Doğa ve Bilim Araçları

#### 1. Doğa Bilimleri Öğretici API

Belirtilen konu hakkında doğa bilimleri bilgileri veren bir API.

- URL: `/dogabilim/dogabilimleri/:apiAnahtari`
- Metod: POST
- İstek Gövdesi:
  ```json
  {
    "topic": "Doğa bilimi konusu"
  }
  ```
- Yanıt:
  ```json
  {
    "natureFacts": "Oluşturulan doğa bilimi bilgileri"
  }
  ```

## Yazar

Bu proje AyanEduTech tarafından geliştirilmiştir.