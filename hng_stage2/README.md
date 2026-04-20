# 📌 Profile Intelligence Service API (Express.js)

**Stage 1 (Backend) — Data Persistence & API Design Assessment**  
📅 Deadline: April 17, 2026 — 11:59 PM  

---

## 🚀 Overview

The **Profile Intelligence Service** is a RESTful API built with **Express.js** that enriches a given name using multiple external APIs, processes the data, and stores it for retrieval and management.

This project demonstrates:

- Multi-API integration  
- Clean RESTful API design  
- Data transformation and validation  
- Database persistence  
- Idempotent request handling  
- Structured error handling  

---

## 🧱 Tech Stack

- Node.js  
- Express.js  
- Database: *(MongoDB / PostgreSQL — update this)*  
- HTTP Client: Axios / Fetch  
- UUID: v7  
- Hosting: *(Vercel / Railway / AWS — update this)*  

---

## 🎯 Objective

This API:

1. Accepts a name  
2. Calls external APIs  
3. Processes and structures the data  
4. Stores the result  
5. Provides endpoints for retrieval, filtering, and deletion  

---

## 🔗 External APIs

- Genderize → https://api.genderize.io?name={name}  
- Agify → https://api.agify.io?name={name}  
- Nationalize → https://api.nationalize.io?name={name}  

---

## ⚙️ Data Processing Rules

### Gender
- `probability` → `gender_probability`  
- `count` → `sample_size`  

### Age
| Age Range | Group |
|----------|------|
| 0–12 | child |
| 13–19 | teenager |
| 20–59 | adult |
| 60+ | senior |

### Country
- Select country with **highest probability**
- Store:
  - `country_id`
  - `country_probability`

### Storage Rules
- ID: UUID v7  
- Timestamp: UTC ISO 8601  
- Enforce idempotency (no duplicate names)  

---

## 📁 Project Structure


src/
│
├── controllers/
├── services/
├── models/
├── routes/
├── middlewares/
├── utils/
│
├── app.js
└── server.js


---

## 📡 API Endpoints

### ➤ Create Profile

**POST** `/api/profiles`

#### Request
```json
{
  "name": "ella"
}

Response (201)
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.99,
    "sample_size": 1234,
    "age": 46,
    "age_group": "adult",
    "country_id": "DRC",
    "country_probability": 0.85,
    "created_at": "2026-04-01T12:00:00Z"
  }
}

Idempotent Response
{
  "status": "success",
  "message": "Profile already exists",
  "data": {}
}

➤ Delete Profile

DELETE /api/profiles/:id

Response:

204 No Content
⚠️ Error Handling

All errors follow this format:

{
  "status": "error",
  "message": "Error description"
}
Status Codes
Code	Meaning
400	Missing or empty name
422	Invalid input
404	Profile not found
500	Server error
502	External API failure
🚨 External API Errors
{
  "status": "502",
  "message": "Genderize returned an invalid response"
}
🧪 Edge Cases

The system does NOT store data when:

Gender is null or count = 0
Age is null
No country data returned
🔐 Idempotency
Input name is normalized
Existing record is checked before insert
Duplicate requests return existing data
🌍 CORS
Access-Control-Allow-Origin: *

Example (Express):

app.use(cors({ origin: "*" }));
▶️ Running Locally
# Install dependencies
npm install

# Start development
npm run dev

# Start production
npm start
🔗 Deployment

Base URL:

https://yourapp.domain.app

Make sure:

API is publicly accessible
All endpoints are live
