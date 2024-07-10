const fs = require('fs');

// JSON dosyasının yolunu belirtin
const filePath = './exampledata.json';

// JSON dosyasını oku ve objeye çevir
// fs.readFile(filePath, 'utf8', (err, data) => {
//     if (err) {
//         console.error('Dosya okuma hatası:', err);
//         return;
//     }
//     try {
//         const jsonObject = JSON.parse(data).value;
//         const response = promptGenerator(jsonObject)
//         console.log(response);
//     } catch (parseErr) {
//         console.error('JSON parse hatası:', parseErr);
//     }
// });

function thermalAnalyze(data){
    let anamolies = [];
    for (let i = 0; i < data.length; i++){
        let muscle = data[i];
        if (muscle.tiredness !== "Normal" && muscle.disability === "Normal"){
            anamolies.push({ muscleType: muscle.muscleType, tiredness: muscle.tiredness });
        } else if (muscle.tiredness === "Normal" && muscle.disability !== "Normal"){
            anamolies.push({ muscleType: muscle.muscleType, disability: muscle.disability });
        } else if (muscle.tiredness !== "Normal" && muscle.disability !== "Normal") {
            anamolies.push({ muscleType: muscle.muscleType, disability: muscle.disability, tiredness: muscle.tiredness });
        }
    }
    return { anamolies };
}

module.exports = function promptGenerator(data){
    const { id, analyzeType, analyzeSideType, athlete, thermalAnalyzeData } = data;
    const { positionName, birthDate, gender, dominantSide, bodySize } = athlete;
    const { height, weight } = bodySize;
    const { anamolies } = thermalAnalyze(thermalAnalyzeData);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const generateAnomalyReport = (anamolies) => {
        if (anamolies.length === 0) {
            return "No anomalies detected.";
        }

        return anamolies.map(anomaly => {
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

    const prompt = `The athlete, who plays as a ${positionName}, was born on ${formatDate(birthDate)} and is ${gender}. The athlete's dominant side is ${dominantSide}. With a height of ${height} cm and a weight of ${weight} kg, the athlete underwent a ${analyzeType} focusing on the ${analyzeSideType} side.Upon analyzing the thermal data, the following anomalies were detected: ${generateAnomalyReport(anamolies)}.`;

    return {prompt, id};
}

