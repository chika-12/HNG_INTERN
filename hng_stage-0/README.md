# 🚀 HNG Backend Stage 0 — Name Classification API

## 📌 Overview

This project is part of the HNG Internship (Backend Stage 0 Task).

It implements a RESTful API that:

* Accepts a name as input
* Integrates with the external Genderize API
* Processes and transforms the response
* Returns a structured and validated result

---

## ⚙️ Features

* ✅ Query parameter validation
* ✅ External API integration (Genderize)
* ✅ Data transformation and enrichment
* ✅ Confidence scoring logic
* ✅ Proper error handling
* ✅ CORS enabled
* ✅ Scalable project structure

---

## 🌐 Live API

Base URL:

```
https://your-app-url.com
```

---

## 📡 Endpoint

### GET /api/classify?name={name}

#### ✅ Success Response (200)

```json
{
  "status": "success",
  "data": {
    "name": "john",
    "gender": "male",
    "probability": 0.99,
    "sample_size": 1234,
    "is_confident": true,
    "processed_at": "2026-04-01T12:00:00Z"
  }
}
```

---

## ❌ Error Responses

### 400 — Missing Name

```json
{
  "status": "error",
  "message": "Name parameter is required"
}
```

### 422 — Invalid Input

```json
{
  "status": "error",
  "message": "Name must be a string"
}
```

### 422 — No Prediction

```json
{
  "status": "error",
  "message": "No prediction available for the provided name"
}
```

### 502 — External API Failure

```json
{
  "status": "error",
  "message": "Failed to fetch data from external API"
}
```

---

## 🧠 Business Logic

The API computes a confidence score based on:

* probability ≥ 0.7
* sample_size ≥ 100

Both conditions must be satisfied:

```
is_confident = true only if both conditions pass
```

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* Axios

---

## 📦 Installation

Clone the repository:

```
git clone https://github.com/your-username/hng-stage0.git
cd hng-stage0
```

Install dependencies:

```
npm install
```

---

## ▶️ Running the Server

```
npm start
```

Server runs on:

```
http://localhost:3000
```

---

## 🧪 Testing

Test endpoint:

```
GET http://localhost:3000/api/classify?name=john
```

You can use:

* Postman
* Browser
* Curl

---

## 🔐 CORS

CORS is enabled to allow all origins:

```
Access-Control-Allow-Origin: *
```

---

## ⚡ Performance Considerations

* Async API calls
* Lightweight processing
* Timeout handling for external API
* Non-blocking architecture

---

## 🚨 Edge Case Handling

* Missing name parameter
* Invalid data type
* No prediction from Genderize API
* External API failures

---

## 📁 Project Structure

See detailed structure below 👇

---

## 👨‍💻 Author

* Full Name: Chika Mark
* Email: [markworship001@email.com](mailto:your@email.com)
* Stack: Node.js (Express)

---

## 📜 License

This project is for educational purposes (HNG Internship Task).
