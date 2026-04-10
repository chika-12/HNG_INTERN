## 📂 Project Structure

```
project-root/
│
├── src/
│   ├── controllers/
│   │   └── classifyController.js
│   │       # Handles request/response logic
│
│   ├── services/
│   │   └── genderizeService.js
│   │       # Handles external API communication
│
│   ├── routes/
│   │   └── classifyRoutes.js
│   │       # Defines API endpoints
│
│   └── app.js
│       # Express app configuration and middleware
│
├── server.js
│   # Application entry point
│
├── package.json
│   # Project metadata and dependencies
│
└── README.md
    # Project documentation
```

---

## 🧩 Architecture Explanation

* **Routes Layer**

  * Defines API endpoints
  * Directs requests to controllers

* **Controller Layer**

  * Handles request validation
  * Processes responses
  * Applies business logic

* **Service Layer**

  * Communicates with external APIs
  * Keeps controller clean and maintainable

---

## 🎯 Why This Structure?

This structure improves:

* Code readability
* Scalability
* Maintainability
* Separation of concerns

It follows standard backend engineering practices used in production systems.
