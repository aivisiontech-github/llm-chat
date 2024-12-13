function getMusclesForAnalysisType(analyzeType, analyzeSideType) {
	const frontLowerMuscles = [
		'TopAdductor',
		'QuadricepsRectus',
		'QuadricepsVastus',
		'VastusMedialis',
		'Patellar',
		'Gastrocnemius',
		'TibialisAnterior',
		'FootAnkle',
		'Foot',
	]

	const backLowerMuscles = [
		'TopAdductor',
		'BicepsFemoris',
		'VastusLateralis',
		'HamstringMedial',
		'Popliteal',
		'CalfMedialis',
		'CalfLateralis',
		'Achilles',
		'Calceneal',
	]

	const frontUpperMuscles = [
		'Hand',
		'Carpel',
		'Flexor',
		'Extansor',
		'Olecranon',
		'Biceps',
		'Deltoid',
		'Cervical',
		'Collarbone',
		'Pectoral',
		'Abdominal',
		'Hipokondriak',
	]

	const backUpperMuscles = [
		'Hand',
		'Carpel',
		'Flexor',
		'Extansor',
		'Olecranon',
		'Deltoid',
		'Triceps',
		'Trapeze',
		'RotatorCuff',
		'Gluteal',
		'Lumbar',
	]

	switch (analyzeType) {
		case 'Lower':
			return analyzeSideType === 'Front' ? frontLowerMuscles : backLowerMuscles
		case 'Upper':
			return analyzeSideType === 'Front' ? frontUpperMuscles : backUpperMuscles
		case 'FullBody':
			return analyzeSideType === 'Front'
				? [...frontLowerMuscles, ...frontUpperMuscles]
				: [...backLowerMuscles, ...backUpperMuscles]
		default:
			return []
	}
}

function thermalAnalyze(data) {
	let anamolies = []
	for (let i = 0; i < data.length; i++) {
		let muscle = data[i]
		anamolies.push({
			muscleType: muscle.muscleType,
			tiredness: muscle.tiredness !== 'Normal' ? muscle.tiredness : undefined,
			disability:
				muscle.disability !== 'Normal' ? muscle.disability : undefined,
		})
	}
	return { anamolies }
}

module.exports = function promptGenerator(data) {
	const { id, analyzeType, analyzeSideType, athlete, thermalAnalyzeData } = data
	const { positionName, birthDate, gender, dominantSide, bodySize } = athlete
	const { height, weight } = bodySize
	const { anamolies } = thermalAnalyze(thermalAnalyzeData)

	const formatDate = dateString => {
		const options = { year: 'numeric', month: 'long', day: 'numeric' }
		return new Date(dateString).toLocaleDateString(undefined, options)
	}

	const relevantMuscles = getMusclesForAnalysisType(
		analyzeType,
		analyzeSideType
	)

	const generateAnomalyReport = anamolies => {
		if (anamolies.length === 0) {
			return 'No anomalies detected.'
		}

		// Sadece ilgili kas gruplarındaki anomalileri filtrele
		const filteredAnomalies = anamolies.filter(anomaly =>
			relevantMuscles.includes(anomaly.muscleType)
		)

		return filteredAnomalies
			.map(anomaly => {
				let details = `Muscle Type: ${anomaly.muscleType}`
				if (anomaly.tiredness && anomaly.disability) {
					details += `, Tiredness: ${anomaly.tiredness}, Disability: ${anomaly.disability}`
				} else if (anomaly.tiredness) {
					details += `, Tiredness: ${anomaly.tiredness}`
				} else if (anomaly.disability) {
					details += `, Disability: ${anomaly.disability}`
				}
				return details
			})
			.join('; ')
	}

	const prompt = `Sporcunun alınan ${analyzeType} ${analyzeSideType} termal görüntüsü değerlendirilmiştir.
    
Sporcu Bilgileri: ${positionName} pozisyonunda oynayan sporcu ${formatDate(
		birthDate
	)} doğumlu ve ${gender}. Sporcunun dominant tarafı ${dominantSide}. Boy: ${height} cm, Kilo: ${weight} kg.

Analiz Sonucu: ${generateAnomalyReport(anamolies)}

Not: Bu değerlendirme AI4Sports yapay zeka ve termografi ile sporcu sakatlık ve yorgunluk risk analizi sonucudur. Sakatlık riski seviyeleri (düşükten yükseğe): Normal, ShouldObserve, ShouldProtect, Attention, Urgent. Yorgunluk riski seviyeleri (düşükten yükseğe): Normal, Tired, Exhausted, Urgent.`

	return { prompt, id }
}
