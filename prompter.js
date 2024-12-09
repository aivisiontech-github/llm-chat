const fs = require('fs');

// JSON dosyasının yolunu belirtin
const filePath = './exampledata.json';


function getMusclesForAnalysisType(analyzeType, analyzeSideType) {
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
        }
    };

    if (analyzeType === 'Fullbody') {
        return analyzeSideType === 'Front' ?
            [...muscles['Upper']['Front'], ...muscles['Lower']['Front']] :
            [...muscles['Upper']['Back'], ...muscles['Lower']['Back']];
    }

    return muscles[analyzeType][analyzeSideType];
}


function thermalAnalyze(data) {
    let anamolies = [];
    for (let i = 0; i < data.length; i++) {
        let muscle = data[i];
        if (muscle.tiredness !== "Normal" && muscle.disability === "Normal") {
            anamolies.push({ muscleType: muscle.muscleType, tiredness: muscle.tiredness });
        } else if (muscle.tiredness === "Normal" && muscle.disability !== "Normal") {
            anamolies.push({ muscleType: muscle.muscleType, disability: muscle.disability });
        } else if (muscle.tiredness !== "Normal" && muscle.disability !== "Normal") {
            anamolies.push({ muscleType: muscle.muscleType, disability: muscle.disability, tiredness: muscle.tiredness });
        }
    }
    return { anamolies };
}

module.exports = function promptGenerator(data) {
    const { id, analyzeType, analyzeSideType, athlete, thermalAnalyzeData } = data;
    const { positionName, birthDate, gender, dominantSide, bodySize } = athlete;
    const { height, weight } = bodySize;
    const { anamolies } = thermalAnalyze(thermalAnalyzeData);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const relevantMuscles = getMusclesForAnalysisType(analyzeType, analyzeSideType);

    const generateAnomalyReport = (anamolies) => {
        if (anamolies.length === 0) {
            return "No anomalies detected.";
        }

        // Sadece ilgili kas gruplarındaki anomalileri filtrele
        const filteredAnomalies = anamolies.filter(anomaly =>
            relevantMuscles.includes(anomaly.muscleType)
        );

        return filteredAnomalies.map(anomaly => {
            let details = `Muscle Type: ${anomaly.muscleType}`;
            if (anomaly.tiredness && anomaly.disability) {
                details += `, Tiredness: ${anomaly.tiredness}, Disability: ${anomaly.disability}`;
            } else if (anomaly.tiredness) {
                details += `, Tiredness: ${anomaly.tiredness}`;
            } else if (anomaly.disability) {
                details += `, Disability: ${anomaly.disability}`;
            }
            return details;
        }).join('; ');
    };

    const prompt = `Sporcunun alınan ${analyzeType} ${analyzeSideType} termal görüntüsü değerlendirilmiştir.
    
Sporcu Bilgileri: ${positionName} pozisyonunda oynayan sporcu ${formatDate(birthDate)} doğumlu ve ${gender}. Sporcunun dominant tarafı ${dominantSide}. Boy: ${height} cm, Kilo: ${weight} kg.

Analiz Sonucu: ${generateAnomalyReport(anamolies)}

Not: Bu değerlendirme AI4Sports yapay zeka ve termografi ile sporcu sakatlık ve yorgunluk risk analizi sonucudur. Sakatlık riski seviyeleri (düşükten yükseğe): Normal, Should Observe, Should Protect, Attention, Urgent. Yorgunluk riski seviyeleri (düşükten yükseğe): Normal, Low, Average, High.`;

    return { prompt, id };
}


