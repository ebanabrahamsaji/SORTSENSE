
# API Response Examples

## 1. Chatbot Query
**POST** `/api/chatbot/query`
**Body:** `{ "message": "How do I throw away a battery?" }`

**Response:**
```json
{
  "text": "E-waste contains harmful metals. Do not dump in regular bins. Drop off at authorized e-waste collection centers.",
  "category": "E-Waste",
  "reply": "E-waste contains harmful metals. Do not dump in regular bins. Drop off at authorized e-waste collection centers."
}
```

## 2. Scan History
**GET** `/api/user/scan-history?userId=123`

**Response:**
```json
{
  "stats": {
    "total_scans": 45,
    "total_eco_credits": 120,
    "total_carbon_saved": "9.0 kg"
  },
  "history": [
    {
      "id": 101,
      "waste_category": "Plastic",
      "confidence": "98%",
      "disposal_method": "Clean, dry, and give to Haritha Karma Sena.",
      "timestamp": "2023-10-27T10:30:00.000Z"
    },
    {
        "id": 100,
        "waste_category": "Organic",
        "confidence": "92%",
        "disposal_method": "Compost in bio-bin or community aerobic bin.",
        "timestamp": "2023-10-26T14:15:00.000Z"
    }
  ]
}
```
