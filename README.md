# Social App

Welcome to the **Social App**, a **full-stack application** built with **React** for the frontend and **NestJS** for the backend, with **MinIO** for file storage.

This app enables:

- User registration and authentication
- Profile management
- Article publishing and management
- Tag interaction
- Social features like following users and favoriting articles
- File uploads with metadata (title, uploadedBy) stored in **MinIO**

---

## 🚀 Features

- User registration and login
- Article CRUD (Create, Read, Update, Delete)
- Tag retrieval
- Follow/unfollow users and retrieve profiles
- Favorite/unfavorite articles
- Feed of articles from followed users
- File upload with metadata to **MinIO**

---

## 🔐 Authorization

Protected endpoints require a **valid JWT token** in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

---

## ⚙️ Environment Variables

Create a `.env` file in the backend root directory:

```env
# App variables
PORT=3000
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=3600s

# PostgreSQL (local development)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=blog

# MinIO (local S3 storage)
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=files
```

> **Note:** Adjust database and MinIO variables to match your local setup.

---

## 📖 Backend Documentation

Swagger UI is available at:

```
http://localhost:3000/api
```

Use it to explore backend endpoints, try requests, and inspect response schemas interactively.

---

## 🏁 Getting Started

### Backend

1. **Clone the repository**

```bash
git clone <repository-url>
cd <repository-folder>/backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

- Create a `.env` file as shown above
- Ensure PostgreSQL is running locally
- Ensure MinIO is running for file uploads:

```bash
docker-compose up -d minio
```

4. **Start the server**

```bash
npm run start:dev
```

---

### Frontend

1. **Navigate to frontend folder**

```bash
cd ../frontend
```

2. **Install dependencies**

```bash
npm install
```

3. **Start the frontend**

```bash
npm start
```

The React app will open in your browser (default `http://localhost:3000`) and communicate with the backend API.

---

## ⚡ Notes on File Uploads

- Supports **title** and **uploadedBy** metadata
- Max file size: **5 MB**
- Allowed types: images (`jpg`, `jpeg`, `png`, `gif`)
- Files are stored in **MinIO**; metadata can be retrieved via API
