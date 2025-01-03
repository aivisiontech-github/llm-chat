const promptGenerator = require("./prompter")


const data = {
    "language": "Turkish",
    "sport": "Football",
    "data": {
      "value": {
        "id": "b486355d-84c5-410d-b455-97f29470c2b2",
        "sessionId": "22f58672-353d-4bed-8233-cc4562f4d73b",
        "analyzeType": "Carpal",
        "analyzeSideType": "Front",
        "date": "2024-11-12T12:22:00.397",
        "thermalAnalyzeData": [
          {
            "id": "1bea59c0-2081-4f17-ac7c-59c6fec7e371",
            "muscleType": "Pinky",
            "date": "2024-11-12T12:22:00.397",
            "tiredness": null,
            "disability": null,
            "temperatureDiff": 0,
            "leftBodyTemperature": {
              "max": 34.043,
              "min": 28.328,
              "mean": 32.43
            },
            "rightBodyTemperature": null
          },
          {
            "id": "2065e59a-ff49-4079-a6be-9ec617e9e064",
            "muscleType": "Middle",
            "date": "2024-11-12T12:22:00.397",
            "tiredness": null,
            "disability": null,
            "temperatureDiff": 0,
            "leftBodyTemperature": {
              "max": 34.756,
              "min": 28.113,
              "mean": 33.094
            },
            "rightBodyTemperature": null
          },
          {
            "id": "2cc4765a-eeb1-433c-93d2-22de26738039",
            "muscleType": "HandCarpal",
            "date": "2024-11-12T12:22:00.397",
            "tiredness": null,
            "disability": "ShouldProtect",
            "temperatureDiff": 0,
            "leftBodyTemperature": {
              "max": 0,
              "min": 0,
              "mean": 0
            },
            "rightBodyTemperature": null
          },
          {
            "id": "34606251-4845-4a52-8d11-b084095c42a7",
            "muscleType": "Index",
            "date": "2024-11-12T12:22:00.397",
            "tiredness": null,
            "disability": null,
            "temperatureDiff": 0,
            "leftBodyTemperature": {
              "max": 34.532,
              "min": 28.799,
              "mean": 33.221
            },
            "rightBodyTemperature": null
          },
          {
            "id": "94a8e0cc-10ec-4fc0-a5b4-ea1fa7e5423d",
            "muscleType": "Tumb",
            "date": "2024-11-12T12:22:00.397",
            "tiredness": null,
            "disability": null,
            "temperatureDiff": 0,
            "leftBodyTemperature": {
              "max": 35.343,
              "min": 28.778,
              "mean": 33.922
            },
            "rightBodyTemperature": null
          },
          {
            "id": "c8128ee2-c1b6-4b79-8a35-f771abebe1c5",
            "muscleType": "Palmaris",
            "date": "2024-11-12T12:22:00.397",
            "tiredness": null,
            "disability": null,
            "temperatureDiff": 0,
            "leftBodyTemperature": {
              "max": 36.189,
              "min": 33.367,
              "mean": 35.03
            },
            "rightBodyTemperature": null
          },
          {
            "id": "d37c4bcf-82a2-420d-8d16-7ba2dd3c96e4",
            "muscleType": "Hypothenar",
            "date": "2024-11-12T12:22:00.397",
            "tiredness": null,
            "disability": null,
            "temperatureDiff": 0,
            "leftBodyTemperature": {
              "max": 35.202,
              "min": 29.439,
              "mean": 33.463
            },
            "rightBodyTemperature": null
          },
          {
            "id": "faafbcee-d104-493a-9603-250a7df9323c",
            "muscleType": "Ring",
            "date": "2024-11-12T12:22:00.397",
            "tiredness": null,
            "disability": null,
            "temperatureDiff": 0,
            "leftBodyTemperature": {
              "max": 34.573,
              "min": 28.842,
              "mean": 32.939
            },
            "rightBodyTemperature": null
          },
          {
            "id": "ff4d4bb1-c63b-4f2c-8cf4-4dc0d3569ddd",
            "muscleType": "Thenar",
            "date": "2024-11-12T12:22:00.397",
            "tiredness": null,
            "disability": null,
            "temperatureDiff": 0,
            "leftBodyTemperature": {
              "max": 35.988,
              "min": 30.032,
              "mean": 34.449
            },
            "rightBodyTemperature": null
          }
        ],
        "athlete": {
          "id": "e8981fb0-45c5-46e1-8617-5d22ca83b77d",
          "accountId": null,
          "positions": [
            "goalkeeper"
          ],
          "profile": " https://aivisiontech-hub.s3.eu-central-1.amazonaws.com/profile/e8981fb0-45c5-46e1-8617-5d22ca83b77d",
          "timestamp": "2024-09-29T18:23:08.950779Z",
          "name": "ben",
          "surname": "10",
          "nationality": "Brazil",
          "jerseyNumber": 99,
          "birthDate": "1999-11-03T22:00:00",
          "bodySize": {
            "height": 99,
            "weight": 99
          },
          "teamId": "ddd36e30-986e-4b24-87b5-89be12740e88",
          "team": {
            "id": "ddd36e30-986e-4b24-87b5-89be12740e88",
            "creatorId": "26ffcde7-bc8b-4294-afd7-66a8a250d37e",
            "parentTeamId": null,
            "teamName": "Aivisiontech Team",
            "profile": "https://aivisiontech-hub.s3.eu-central-1.amazonaws.com/profile/ddd36e30-986e-4b24-87b5-89be12740e88",
            "timestamp": "2024-10-09T12:30:09.49569Z",
            "teamMembership": "Demo",
            "sportType": "Football",
            "type": "Main",
            "memberCount": 0,
            "athleteCount": 1,
            "createdOnUtc": "2024-08-16T13:10:31.557025Z"
          },
          "gender": "Man",
          "dominantSide": "Both",
          "status": [],
          "pmcs": [
            {
              "score": 3.81,
              "muscleType": "Achilles",
              "date": "2024-12-20T10:08:46.9760655Z"
            },
            {
              "score": 0,
              "muscleType": "BicepsFemoris",
              "date": "2024-12-20T10:08:46.9760665Z"
            },
            {
              "score": 1.62,
              "muscleType": "TopAdductor",
              "date": "2024-12-20T10:08:46.9760666Z"
            },
            {
              "score": 0,
              "muscleType": "HamstringMedial",
              "date": "2024-12-20T10:08:46.9760668Z"
            },
            {
              "score": 4.1,
              "muscleType": "VastusLateralis",
              "date": "2024-12-20T10:08:46.9760669Z"
            },
            {
              "score": 0.1,
              "muscleType": "CalfLateralis",
              "date": "2024-12-20T10:08:46.976067Z"
            },
            {
              "score": 2.95,
              "muscleType": "CalfMedialis",
              "date": "2024-12-20T10:08:46.9760671Z"
            },
            {
              "score": 1.05,
              "muscleType": "Calceneal",
              "date": "2024-12-20T10:08:46.9760672Z"
            },
            {
              "score": 0.1,
              "muscleType": "Popliteal",
              "date": "2024-12-20T10:08:46.9760673Z"
            },
            {
              "score": 12.27,
              "muscleType": "Hand",
              "date": "2024-12-20T10:08:46.9760674Z"
            },
            {
              "score": 0.29,
              "muscleType": "Deltoid",
              "date": "2024-12-20T10:08:46.9760676Z"
            },
            {
              "score": 11.03,
              "muscleType": "Collarbone",
              "date": "2024-12-20T10:08:46.9760677Z"
            },
            {
              "score": 1.05,
              "muscleType": "Extansor",
              "date": "2024-12-20T10:08:46.9760678Z"
            },
            {
              "score": 3.05,
              "muscleType": "Carpel",
              "date": "2024-12-20T10:08:46.9760679Z"
            },
            {
              "score": 0,
              "muscleType": "Abdominal",
              "date": "2024-12-20T10:08:46.976068Z"
            },
            {
              "score": 0.29,
              "muscleType": "Cervical",
              "date": "2024-12-20T10:08:46.9760682Z"
            },
            {
              "score": 11.41,
              "muscleType": "Flexor",
              "date": "2024-12-20T10:08:46.9760683Z"
            },
            {
              "score": 0,
              "muscleType": "Pectoral",
              "date": "2024-12-20T10:08:46.9760684Z"
            },
            {
              "score": 0.76,
              "muscleType": "Olecranon",
              "date": "2024-12-20T10:08:46.9760685Z"
            },
            {
              "score": 0,
              "muscleType": "Biceps",
              "date": "2024-12-20T10:08:46.9760686Z"
            },
            {
              "score": 0.1,
              "muscleType": "Hipokondriak",
              "date": "2024-12-20T10:08:46.9760687Z"
            },
            {
              "score": 0.1,
              "muscleType": "Trapeze",
              "date": "2024-12-20T10:08:46.9760689Z"
            },
            {
              "score": 0.1,
              "muscleType": "Lumbar",
              "date": "2024-12-20T10:08:46.976069Z"
            },
            {
              "score": 0.1,
              "muscleType": "RotatorCuff",
              "date": "2024-12-20T10:08:46.9760691Z"
            },
            {
              "score": 0,
              "muscleType": "Triceps",
              "date": "2024-12-20T10:08:46.9760692Z"
            },
            {
              "score": 0,
              "muscleType": "Gluteal",
              "date": "2024-12-20T10:08:46.9760693Z"
            },
            {
              "score": 0.1,
              "muscleType": "FootAnkle",
              "date": "2024-12-20T10:08:46.9760694Z"
            },
            {
              "score": 0,
              "muscleType": "Patellar",
              "date": "2024-12-20T10:08:46.9760696Z"
            },
            {
              "score": 0,
              "muscleType": "QuadricepsRectus",
              "date": "2024-12-20T10:08:46.9760697Z"
            },
            {
              "score": 0.86,
              "muscleType": "Foot",
              "date": "2024-12-20T10:08:46.976087Z"
            },
            {
              "score": 0.29,
              "muscleType": "Gastrocnemius",
              "date": "2024-12-20T10:08:46.9760874Z"
            },
            {
              "score": 0.38,
              "muscleType": "TibialisAnterior",
              "date": "2024-12-20T10:08:46.9760884Z"
            },
            {
              "score": 0,
              "muscleType": "VastusMedialis",
              "date": "2024-12-20T10:08:46.9760885Z"
            },
            {
              "score": 0.1,
              "muscleType": "QuadricepsVastus",
              "date": "2024-12-20T10:08:46.9760887Z"
            }
          ],
          "pmss": null,
          "pmts": [
            {
              "score": 0.1,
              "muscleType": "Achilles",
              "date": "2024-12-20T10:08:46.9760902Z"
            },
            {
              "score": 0.38,
              "muscleType": "BicepsFemoris",
              "date": "2024-12-20T10:08:46.9760905Z"
            },
            {
              "score": 0.1,
              "muscleType": "TopAdductor",
              "date": "2024-12-20T10:08:46.9760906Z"
            },
            {
              "score": 0,
              "muscleType": "HamstringMedial",
              "date": "2024-12-20T10:08:46.9760907Z"
            },
            {
              "score": 9.62,
              "muscleType": "VastusLateralis",
              "date": "2024-12-20T10:08:46.9760908Z"
            },
            {
              "score": 0.1,
              "muscleType": "CalfLateralis",
              "date": "2024-12-20T10:08:46.9760909Z"
            },
            {
              "score": 9.71,
              "muscleType": "CalfMedialis",
              "date": "2024-12-20T10:08:46.976091Z"
            },
            {
              "score": 0,
              "muscleType": "Calceneal",
              "date": "2024-12-20T10:08:46.9760911Z"
            },
            {
              "score": 0,
              "muscleType": "Popliteal",
              "date": "2024-12-20T10:08:46.9760913Z"
            },
            {
              "score": 21.21,
              "muscleType": "Hand",
              "date": "2024-12-20T10:08:46.9760914Z"
            },
            {
              "score": 21.3,
              "muscleType": "Deltoid",
              "date": "2024-12-20T10:08:46.9760915Z"
            },
            {
              "score": 0.57,
              "muscleType": "Collarbone",
              "date": "2024-12-20T10:08:46.9760916Z"
            },
            {
              "score": 22.92,
              "muscleType": "Extansor",
              "date": "2024-12-20T10:08:46.9760917Z"
            },
            {
              "score": 1.9,
              "muscleType": "Carpel",
              "date": "2024-12-20T10:08:46.9760918Z"
            },
            {
              "score": 0.38,
              "muscleType": "Abdominal",
              "date": "2024-12-20T10:08:46.976092Z"
            },
            {
              "score": 1.81,
              "muscleType": "Cervical",
              "date": "2024-12-20T10:08:46.9760921Z"
            },
            {
              "score": 33.19,
              "muscleType": "Flexor",
              "date": "2024-12-20T10:08:46.9760922Z"
            },
            {
              "score": 0,
              "muscleType": "Pectoral",
              "date": "2024-12-20T10:08:46.9760923Z"
            },
            {
              "score": 22.45,
              "muscleType": "Olecranon",
              "date": "2024-12-20T10:08:46.9760924Z"
            },
            {
              "score": 11.03,
              "muscleType": "Biceps",
              "date": "2024-12-20T10:08:46.9760926Z"
            },
            {
              "score": 0.57,
              "muscleType": "Hipokondriak",
              "date": "2024-12-20T10:08:46.9760927Z"
            },
            {
              "score": 0.1,
              "muscleType": "Trapeze",
              "date": "2024-12-20T10:08:46.9760928Z"
            },
            {
              "score": 0.67,
              "muscleType": "Lumbar",
              "date": "2024-12-20T10:08:46.9760929Z"
            },
            {
              "score": 0.95,
              "muscleType": "RotatorCuff",
              "date": "2024-12-20T10:08:46.9760931Z"
            },
            {
              "score": 0.86,
              "muscleType": "Triceps",
              "date": "2024-12-20T10:08:46.9760932Z"
            },
            {
              "score": 0.48,
              "muscleType": "Gluteal",
              "date": "2024-12-20T10:08:46.9760933Z"
            },
            {
              "score": 0.38,
              "muscleType": "FootAnkle",
              "date": "2024-12-20T10:08:46.9760934Z"
            },
            {
              "score": 0.48,
              "muscleType": "Patellar",
              "date": "2024-12-20T10:08:46.9760935Z"
            },
            {
              "score": 0.38,
              "muscleType": "QuadricepsRectus",
              "date": "2024-12-20T10:08:46.9760936Z"
            },
            {
              "score": 0.19,
              "muscleType": "Foot",
              "date": "2024-12-20T10:08:46.9760937Z"
            },
            {
              "score": 0.76,
              "muscleType": "Gastrocnemius",
              "date": "2024-12-20T10:08:46.9760939Z"
            },
            {
              "score": 0,
              "muscleType": "TibialisAnterior",
              "date": "2024-12-20T10:08:46.9760941Z"
            },
            {
              "score": 0.29,
              "muscleType": "VastusMedialis",
              "date": "2024-12-20T10:08:46.9760943Z"
            },
            {
              "score": 0.29,
              "muscleType": "QuadricepsVastus",
              "date": "2024-12-20T10:08:46.9760944Z"
            }
          ],
          "pmcsAverage": 2,
          "pmssAverage": 0,
          "pmtsAverage": 5
        },
        "tags": [],
        "note": null,
        "injuryImageUrl": "https://hubfiles.aivisiontech.net/2024-11-12_12-23-42__carpal_injury_image.png",
        "tirednessImageUrl": null,
        "postureImageUrl": null,
        "originalImageUrl": "https://aivisiontech-hub.s3.eu-central-1.amazonaws.com/storage/ddd36e30-986e-4b24-87b5-89be12740e88/96fce487-51af-4233-afa0-fb1097f27875",
        "specificAnalyzeResults": [
          "Analyzes 3",
          "Analyzes 4",
          "Analyzes 5"
        ],
        "postureAnalyze": [],
        "createdOnUtc": "2024-11-12T12:23:42.687619Z"
      },
      "error": null,
      "isSuccess": true
    }
  }
const prompt = promptGenerator(data, 1)

console.log(prompt);