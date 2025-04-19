const config = require('./utils/consts');

console.log("prompter.js modülü yükleniyor...");
console.log(`Mevcut asistan tipleri: ${JSON.stringify(config.ASSISTANTS.map(a => a.type))}`);

const getMusclesForAnalysisType = (analyzeType, analyzeSideType) => {
    console.log(`getMusclesForAnalysisType çağrıldı - analyzeType: ${analyzeType}, analyzeSideType: ${analyzeSideType}`);
    
    // analyzeType'ı büyük harfe çevir, config ile eşleşmesi için
    const assistantType = analyzeType.toUpperCase();
    console.log(`Asistan tipi (büyük harfle): ${assistantType}`);
    
    // Config'den asistan konfigürasyonunu bul
    const assistantConfig = config.ASSISTANTS.find(asst => asst.type === assistantType);
    console.log(`${assistantType} için asistan konfigürasyonu bulundu mu?: ${assistantConfig ? 'Evet' : 'Hayır'}`);
    
    if (!assistantConfig) {
        console.warn(`${assistantType} için asistan konfigürasyonu bulunamadı, boş array dönülüyor.`);
        return [];
    }
    
    console.log(`Asistan konfigürasyonu bulundu: Tip=${assistantConfig.type}`);
    console.log(`Muscles özellikleri: ${JSON.stringify(Object.keys(assistantConfig.muscles || {}))}`);
    
    // NORMAL asistanında, Lower ve Upper gibi ayrıca bir seviye var
    if (assistantType === 'NORMAL') {
        console.log(`NORMAL asistanı için özel yapı kullanılıyor.`);
        // analyzeType veri tarafından geldiği için (Lower/Upper) olduğu gibi kullan
        const originalType = analyzeType; // Lower veya Upper
        
        if (!assistantConfig.muscles[originalType]) {
            console.warn(`NORMAL asistanında ${originalType} tipi için kas bilgisi bulunamadı.`);
            return [];
        }
        
        if (!assistantConfig.muscles[originalType][analyzeSideType]) {
            console.warn(`NORMAL asistanında ${originalType} tipinin ${analyzeSideType} yönü için kas bilgisi bulunamadı.`);
            return [];
        }
        
        const muscles = assistantConfig.muscles[originalType][analyzeSideType] || [];
        console.log(`${originalType} ${analyzeSideType} için bulunan kaslar: ${muscles.length} adet`);
        return muscles;
    }
    
    // TEST asistanı için özel kontrol
    if (assistantType === 'TEST') {
        console.log(`TEST asistanı için özel yapı kullanılıyor.`);
        // TEST asistanı için test kısmı kullanılıyor
        if (!assistantConfig.muscles["test"]) {
            console.warn(`TEST asistanında test tipi için kas bilgisi bulunamadı.`);
            return [];
        }
        
        const muscles = assistantConfig.muscles["test"] || [];
        console.log(`TEST için bulunan kaslar: ${muscles.length} adet`);
        return muscles; 
    }
    
    // Diğer asistanlarda direkt Front/Back yapısı var
    if (!assistantConfig.muscles[analyzeSideType]) {
        console.warn(`${assistantType} asistanında ${analyzeSideType} yönü için kas bilgisi bulunamadı.`);
        return [];
    }
    
    const muscles = assistantConfig.muscles[analyzeSideType] || [];
    console.log(`${assistantType} ${analyzeSideType} için bulunan kaslar: ${muscles.length} adet`);
    return muscles;
}

function thermalAnalyze(data) {
    console.log(`thermalAnalyze fonksiyonu çağrıldı - Data uzunluğu: ${data?.length || 0}`);
    
    let anamolies = [];
    for (let i = 0; i < data.length; i++) {
        let muscle = data[i];
        if ((muscle.tiredness !== null && muscle.tiredness !== "Normal") || 
            (muscle.disability !== null && muscle.disability !== "Normal")) {
            let anomaly = { muscleType: muscle.muscleType };
            if (muscle.tiredness !== null && muscle.tiredness !== "Normal") {
                anomaly.tiredness = muscle.tiredness;
            }
            if (muscle.disability !== null && muscle.disability !== "Normal") {
                anomaly.disability = muscle.disability;
            }
            anamolies.push(anomaly);
        }
    }
    console.log(`Tespit edilen anomali sayısı: ${anamolies.length}`);
    return { anamolies };
}

function generatePrompt(athlete, analyzeType, analyzeSideType, anamolies, relevantMuscles) {
    console.log(`generatePrompt fonksiyonu çağrıldı - analyzeType: ${analyzeType}, analyzeSideType: ${analyzeSideType}, İlgili kas sayısı: ${relevantMuscles.length}`);
    
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('tr-TR', options);
    };

    const generateAnomalyReport = (anamolies) => {
        if (anamolies.length === 0) return "Herhangi bir anomali tespit edilmedi.";

        const filteredAnomalies = anamolies.filter(anomaly =>
            relevantMuscles.includes(anomaly.muscleType)
        );
        
        console.log(`Filtrelenmiş anomali sayısı: ${filteredAnomalies.length}`);

        return filteredAnomalies.map(anomaly => {
            let details = `Kas Bölgesi: ${anomaly.muscleType}`;
            if (anomaly.tiredness && anomaly.disability) {
                details += `, Yorgunluk: ${anomaly.tiredness}, Sakatlık: ${anomaly.disability}`;
            } else if (anomaly.tiredness) {
                details += `, Yorgunluk: ${anomaly.tiredness}`;
            } else if (anomaly.disability) {
                details += `, Sakatlık: ${anomaly.disability}`;
            }
            return details;
        }).join('; ');
    };

    let title = '';
    if (analyzeType === 'Carpal') {
        title = `El ${analyzeSideType} termal görüntüsü değerlendirilmiştir.`;
    } else if (analyzeType === 'test') {
        title = `Test ${analyzeSideType} termal görüntüsü değerlendirilmiştir.`;
    } else {
        title = `Sporcunun alınan ${analyzeType} ${analyzeSideType} termal görüntüsü değerlendirilmiştir.`;
    }

    const athleteInfo = `Sporcu Bilgileri: ${athlete.positions.join(', ')} pozisyonunda oynayan sporcu ${formatDate(athlete.birthDate)} doğumlu ve ${athlete.gender}. Sporcunun dominant tarafı ${athlete.dominantSide}. Boy: ${athlete.bodySize.height} cm, Kilo: ${athlete.bodySize.weight} kg.`;
    
    const analysisResult = `Analiz Sonucu: ${generateAnomalyReport(anamolies)}`;

    const note = `Not: Bu değerlendirme AI4Sports yapay zeka ve termografi ile sporcu sakatlık ve yorgunluk risk analizi sonucudur. Sakatlık riski seviyeleri (düşükten yükseğe): Normal, Should Observe, Should Protect, Attention, Urgent. Yorgunluk riski seviyeleri (düşükten yükseğe): Normal, Low, Average, High.`;

    let additionalInfo = '';
    if (analyzeType === 'Carpal') {
        additionalInfo = `
    Sen bir ortopedistsin. Yukarıdaki sporcunun analiz sonuçlarına göre:
    
    1. Önce sporcunun karpal tünel risk durumunu değerlendir ve bunu açıkla
    2. Risk durumuna uygun olarak 4-6 haftalık bir egzersiz programı oluştur:
       - Her egzersiz için set sayısı, tekrar sayısı ve dinlenme sürelerini belirt
       - Her egzersizin hangi el fonksiyonlarını iyileştireceğini açıkla
       - Program önerilerini ve dikkat edilecek noktaları listele
    3. İlerleme takibi için önerilerde bulun
    4. Üzerine düşünerek özgün egzersizler ver tekrara düşme
    
    Lütfen tüm bu bilgileri profesyonel bir dille ve organize şekilde sun.`;
    }

    const promptResult = `${title}
    
${athleteInfo}

${analysisResult}
${additionalInfo}

${note}`;

    console.log(`Prompt oluşturuldu, uzunluk: ${promptResult.length} karakter`);
    return promptResult;
}

module.exports = function promptGenerator(data) {
    console.log(`promptGenerator fonksiyonu çağrıldı`);
    console.log(`Data içeriği kontrol ediliyor: ${Object.keys(data).join(', ')}`);
    
    const { id, analyzeType, analyzeSideType, athlete, thermalAnalyzeData } = data;
    console.log(`Alınan parametreler - id: ${id}, analyzeType: ${analyzeType}, analyzeSideType: ${analyzeSideType}`);
    
    const { anamolies } = thermalAnalyze(thermalAnalyzeData);
    const relevantMuscles = getMusclesForAnalysisType(analyzeType, analyzeSideType);

    const prompt = generatePrompt(athlete, analyzeType, analyzeSideType, anamolies, relevantMuscles);

    console.log(`promptGenerator tamamlandı - id: ${id}, analyzeType: ${analyzeType}`);
    return { 
        prompt, 
        id,
        analyzeType 
    };
};

console.log("prompter.js modülü yüklendi.");