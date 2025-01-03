const getMusclesForAnalysisType = (analyzeType, analyzeSideType) => {
    const muscles = {
        'Lower': {
            'Front': [
                'Patellar', 'Tibialis Anterior', 'Quadriceps Vastus', 'Ankle',
                'Vastus Medialis', 'Top Adductor', 'Quadriceps Rectus',
                'Gastrocnemius and Soleus', 'Feet'
            ],
            'Back': [
                'Achilles', 'Biceps Femoris / Hamstring Lateral', 'Calceneal',
                'Gastrocnemius Lateralis / Calf Lateralis',
                'Gastrocnemius Medialis / Calf Medialis', 'Hamstring Medialis',
                'Popliteal', 'Top Adductor', 'Vastus Lateralis'
            ]
        },
        'Upper': {
            'Front': [
                'Abdominal', 'Biceps', 'Carpel', 'Cervical', 'Deltoid',
                'Extansor', 'Flexor', 'Hand', 'Hypochondriac region',
                'Olecranon', 'Pectoral', 'Upper Collarbone and Supraclavicular Region'
            ],
            'Back': [
                'Carpel', 'Cervical', 'Deltoid', 'Extansor', 'Flexor',
                'Gluteal', 'Hand', 'Lumbar(Paravertebral/Latissumus Dorsi)',
                'Olecranon', 'Rotator Cuff', 'Trapezius', 'Triceps'
            ]
        },
        'Carpal': {
            'Front': [
                'Pinky', 'Ring', 'Middle', 'Index', 'Tumb', 
                'HandCarpal', 'Palmaris', 'Hypothenar', 'Thenar'
            ],
            'Back': [
                'Pinky', 'Ring', 'Middle', 'Index', 'Tumb',
                'HandCarpal', 'Palmaris', 'Hypothenar', 'Thenar'
            ]
        }
    };

    return muscles[analyzeType]?.[analyzeSideType] || [];
}

function thermalAnalyze(data) {
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
    return { anamolies };
}

function generateCarpalPrompt(athlete, analyzeType, analyzeSideType, anamolies, relevantMuscles) {
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('tr-TR', options);
    };

    const generateAnomalyReport = (anamolies) => {
        if (anamolies.length === 0) return "Herhangi bir anomali tespit edilmedi.";

        const filteredAnomalies = anamolies.filter(anomaly =>
            relevantMuscles.includes(anomaly.muscleType)
        );

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

    return `El ${analyzeSideType} termal görüntüsü değerlendirilmiştir.
    
    Sporcu Bilgileri: ${athlete.positions.join(', ')} pozisyonunda oynayan sporcu ${formatDate(athlete.birthDate)} doğumlu ve ${athlete.gender}. Sporcunun dominant tarafı ${athlete.dominantSide}. Boy: ${athlete.bodySize.height} cm, Kilo: ${athlete.bodySize.weight} kg.
    
    Analiz Sonucu: ${generateAnomalyReport(anamolies)}
    
    Sen bir ortopedistsin. Yukarıdaki sporcunun analiz sonuçlarına göre:
    
    1. Önce sporcunun karpal tünel risk durumunu değerlendir ve bunu açıkla
    2. Risk durumuna uygun olarak 4-6 haftalık bir egzersiz programı oluştur:
       - Her egzersiz için set sayısı, tekrar sayısı ve dinlenme sürelerini belirt
       - Her egzersizin hangi el fonksiyonlarını iyileştireceğini açıkla
       - Program önerilerini ve dikkat edilecek noktaları listele
    3. İlerleme takibi için önerilerde bulun
    4. Üzerine düşünerek özgün egzersizler ver tekrara düşme
    
    Lütfen tüm bu bilgileri profesyonel bir dille ve organize şekilde sun.
    
    Not: Bu değerlendirme AI4Sports yapay zeka ve termografi ile sporcu sakatlık ve yorgunluk risk analizi sonucudur. Sakatlık riski seviyeleri (düşükten yükseğe): Normal, Should Observe, Should Protect, Attention, Urgent. Yorgunluk riski seviyeleri (düşükten yükseğe): Normal, Low, Average, High.`;
    
}

function generateStandardPrompt(athlete, analyzeType, analyzeSideType, anamolies, relevantMuscles) {
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('tr-TR', options);
    };

    const generateAnomalyReport = (anamolies) => {
        if (anamolies.length === 0) return "Herhangi bir anomali tespit edilmedi.";

        const filteredAnomalies = anamolies.filter(anomaly =>
            relevantMuscles.includes(anomaly.muscleType)
        );

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

    return `Sporcunun alınan ${analyzeType} ${analyzeSideType} termal görüntüsü değerlendirilmiştir.
    
Sporcu Bilgileri: ${athlete.positions.join(', ')} pozisyonunda oynayan sporcu ${formatDate(athlete.birthDate)} doğumlu ve ${athlete.gender}. Sporcunun dominant tarafı ${athlete.dominantSide}. Boy: ${athlete.bodySize.height} cm, Kilo: ${athlete.bodySize.weight} kg.

Analiz Sonucu: ${generateAnomalyReport(anamolies)}

Not: Bu değerlendirme AI4Sports yapay zeka ve termografi ile sporcu sakatlık ve yorgunluk risk analizi sonucudur. Sakatlık riski seviyeleri (düşükten yükseğe): Normal, Should Observe, Should Protect, Attention, Urgent. Yorgunluk riski seviyeleri (düşükten yükseğe): Normal, Low, Average, High.`;
}

module.exports = function promptGenerator(data) {
    const { id, analyzeType, analyzeSideType, athlete, thermalAnalyzeData } = data;
    const { anamolies } = thermalAnalyze(thermalAnalyzeData);
    const relevantMuscles = getMusclesForAnalysisType(analyzeType, analyzeSideType);

    const prompt = analyzeType === 'Carpal' 
        ? generateCarpalPrompt(athlete, analyzeType, analyzeSideType, anamolies, relevantMuscles)
        : generateStandardPrompt(athlete, analyzeType, analyzeSideType, anamolies, relevantMuscles);

    return { 
        prompt, 
        id,
        analyzeType 
    };
};