# Profiles API

A RESTful API that serves African profile data with support for structured filtering, natural language search, sorting, and pagination.

Built with **Node.js**, **Express**, and **MongoDB (Mongoose)** as part of the HNG Internship Stage 2 backend challenge.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Seeding](#database-seeding)
- [API Reference](#api-reference)
  - [Get All Profiles](#1-get-all-profiles)
  - [Natural Language Search](#2-natural-language-search)
- [Filters](#filters)
- [Sorting](#sorting)
- [Pagination](#pagination)
- [Error Handling](#error-handling)
- [Performance](#performance)

---

## Features

- Fetch profiles with structured query filters
- Natural language search (rule-based, no AI/LLM)
- Sorting by any field (ascending/descending)
- Pagination with metadata
- Centralized error handling
- UUID v7 primary keys
- Database seeding from JSON

---

## Tech Stack

| Layer         | Technology    |
| ------------- | ------------- |
| Runtime       | Node.js       |
| Framework     | Express.js    |
| Database      | MongoDB Atlas |
| ODM           | Mongoose      |
| ID Generation | UUID v7       |
| Config        | dotenvx       |

---

## Project Structure

```
hng_stage2/
├── controllers/
│   └── profileController.js     # Route handlers
├── models/
│   └── usermodel.js             # Mongoose schema
├── routes/
│   └── profileRoutes.js         # API routes
├── queryFeatures/
│   ├── features.js              # Filter + sort + pagination builder
│   ├── searchParser.js          # Natural language query parser
│   └── validateQuery.js         # Query parameter validation
├── middleware/
│   └── globalErrorHandler.js    # Centralized error handler
├── utils/
│   ├── AppError.js              # Custom error class
│   └── catchAsync.js            # Async error wrapper
├── json_data/
│   ├── seed_profiles.json       # Seed data
│   └── script.js                # Seeding script
├── app.js
├── server.js
└── config.env
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/hng_stage2.git
cd hng_stage2

# Install dependencies
npm install
```

### Run the server

```bash
# Development
npm run dev

# Production
npm start
```

---

## Environment Variables

Create a `config.env` file in the project root:

```env
NODE_ENV=development
PORT=3000
DATABASE=mongodb+srv://username:<PASSWORD>@cluster0.xxxxx.mongodb.net/profiles
PASSWORD=your_mongodb_password
```

---

## Database Seeding

To seed the database with the bundled profile data:

```bash
node json_data/script.js
```

This will:

1. Connect to MongoDB
2. Clear any existing records
3. Generate a UUID v7 for each profile
4. Insert all profiles from `seed_profiles.json`

---

## API Reference

### Base URL

```
http://localhost:3000/api/profiles
```

---

### 1. Get All Profiles

```
GET /api/profiles
```

Returns all profiles with optional filtering, sorting, and pagination.

**Example requests:**

```
GET /api/profiles
GET /api/profiles?gender=female
GET /api/profiles?age_group=adult&country_id=NG
GET /api/profiles?min_age=18&max_age=35
GET /api/profiles?gender=male&min_gender_probability=0.8
GET /api/profiles?sort=-age&page=2&limit=10
```

**Example response:**

```json
{
  "status": "success",
  "total": 143,
  "page": 1,
  "limit": 10,
  "totalPages": 15,
  "hasNextPage": true,
  "hasPrevPage": false,
  "data": [
    {
      "id": "019687a2-...",
      "name": "mercy agyei",
      "gender": "female",
      "gender_probability": 0.79,
      "age": 9,
      "age_group": "child",
      "country_id": "NG",
      "country_name": "Nigeria",
      "country_probability": 0.11,
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2. Natural Language Search

```
GET /api/profiles/search?q=<plain English query>
```

Interprets plain English and converts it into structured filters. Rule-based only — no AI or LLMs involved.

**Example requests:**

```
GET /api/profiles/search?q=young males from nigeria
GET /api/profiles/search?q=females above 30
GET /api/profiles/search?q=people from angola
GET /api/profiles/search?q=adult males from kenya
GET /api/profiles/search?q=male and female teenagers above 17
GET /api/profiles/search?q=elderly women from ghana&page=1&limit=5
```

**Supported query mappings:**

| Natural Language                     | Extracted Filter                                 |
| ------------------------------------ | ------------------------------------------------ |
| `young males`                        | `gender=male, min_age=16, max_age=24`            |
| `females above 30`                   | `gender=female, min_age=30`                      |
| `people from angola`                 | `country_id=AO`                                  |
| `adult males from kenya`             | `gender=male, age_group=adult, country_id=KE`    |
| `male and female teenagers above 17` | `age_group=teenager, min_age=17`                 |
| `elderly women from ghana`           | `gender=female, age_group=senior, country_id=GH` |
| `between 20 and 40`                  | `min_age=20, max_age=40`                         |
| `men under 25`                       | `gender=male, max_age=25`                        |

**Example response:**

```json
{
  "status": "success",
  "query": "young males from nigeria",
  "interpreted": {
    "gender": "male",
    "min_age": 16,
    "max_age": 24,
    "country_id": "NG"
  },
  "total": 12,
  "page": 1,
  "limit": 10,
  "totalPages": 2,
  "hasNextPage": true,
  "hasPrevPage": false,
  "data": [...]
}
```

> Note: `interpreted` shows exactly what filters were extracted from your query — useful for debugging unexpected results.

---

## Filters

Available on `GET /api/profiles`:

| Parameter                 | Type        | Description                            | Example                        |
| ------------------------- | ----------- | -------------------------------------- | ------------------------------ |
| `gender`                  | string      | `male` or `female`                     | `?gender=male`                 |
| `age_group`               | string      | `child`, `teenager`, `adult`, `senior` | `?age_group=adult`             |
| `country_id`              | string      | 2-letter ISO code                      | `?country_id=NG`               |
| `min_age`                 | number      | Minimum age (inclusive)                | `?min_age=18`                  |
| `max_age`                 | number      | Maximum age (inclusive)                | `?max_age=60`                  |
| `min_gender_probability`  | float (0–1) | Minimum gender confidence score        | `?min_gender_probability=0.75` |
| `min_country_probability` | float (0–1) | Minimum country confidence score       | `?min_country_probability=0.5` |

All filters are combinable.

---

## Sorting

Use the `sort` parameter. Prefix with `-` for descending order.

```
GET /api/profiles?sort=age           # ascending
GET /api/profiles?sort=-age          # descending
GET /api/profiles?sort=country_id,-age  # multiple fields
```

Default sort: `-created_at` (newest first).

---

## Pagination

| Parameter | Default | Max | Description      |
| --------- | ------- | --- | ---------------- |
| `page`    | 1       | —   | Page number      |
| `limit`   | 10      | 50  | Records per page |

All paginated responses include:

```json
{
  "total": 200,
  "page": 2,
  "limit": 10,
  "totalPages": 20,
  "hasNextPage": true,
  "hasPrevPage": true
}
```

---

## Error Handling

All errors follow a consistent structure:

```json
{
  "status": "error",
  "message": "<description>"
}
```

| Status Code | Meaning                             |
| ----------- | ----------------------------------- |
| `400`       | Missing or empty required parameter |
| `422`       | Invalid parameter type              |
| `404`       | Profile not found                   |
| `500`       | Internal server error               |

**Examples:**

```json
// Unknown query parameter
{ "status": "error", "message": "Invalid query parameters" }

// Uninterpretable search query
{ "status": "error", "message": "Unable to interpret query" }

// Missing q parameter
{ "status": "error", "message": "Query parameter \"q\" is required" }
```

---

## Performance

This API is optimized to handle the full dataset efficiently:

- **`.lean()`** on all Mongoose queries — returns plain JS objects instead of full Mongoose documents, reducing memory overhead
- **`Promise.all`** for parallel execution of `find()` and `countDocuments()` — both run simultaneously instead of sequentially
- **Database indexes** on `gender`, `country_id`, `age_group`, and a compound index on all three — eliminates full collection scans on common filters
- **Pagination cap** at 50 records per request — prevents large payload responses

---

## License

MIT
