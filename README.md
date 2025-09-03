# StudyBuddy AI

A full-stack web application for study management, built with React (Vite) frontend and Node.js (Express) backend.

## Features

- User authentication
- Note creation and management
- Flashcard generation using AI
- Responsive UI

## Tech Stack

- **Frontend:** React, Vite
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **AI Integration:** OpenAI API

## Getting Started (Local Development)

### Prerequisites

- Node.js & npm
- MongoDB (local or Atlas)

### Clone the Repository

```bash
git clone https://github.com/yourusername/studybuddy-ai.git
cd studybuddy-ai
```

### Backend Setup

```bash
cd server
npm install
# Create a .env file with the following variables:
# PORT=5050
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# OPENAI_API_KEY=your_openai_api_key
npm start
```

### Frontend Setup

```bash
cd client
npm install
# Create a .env file with:
# VITE_API_URL=http://localhost:5050/api
npm run dev
```

## Deployment

### Backend (Render)

1. Push your code to GitHub.
2. Create a new Web Service on [Render](https://render.com/).
3. Set the root directory to `/server`.
4. Add environment variables (`PORT`, `MONGO_URI`, `JWT_SECRET`, `OPENAI_API_KEY`).
5. Render will build and deploy your backend.  
   **Note the deployed URL** (e.g., `https://studybuddy-backend.onrender.com`).

### Frontend (Vercel)

1. Import your repo to [Vercel](https://vercel.com/).
2. Set the root directory to `/client`.
3. Add the environment variable `VITE_API_URL` in Vercel settings, set to your backend’s deployed URL (e.g., `https://studybuddy-backend.onrender.com/api`).
4. Vercel will build and deploy your frontend.  
   **Note the deployed URL** (e.g., `https://studybuddy-frontend.vercel.app`).

## Environment Variables

### Backend (`server/.env`)

```
PORT=5050
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```

### Frontend (`client/.env`)

```
VITE_API_URL=https://studybuddy-backend.onrender.com/api
```

*(On Vercel, set this in the dashboard instead of committing to the repo.)*

## Usage

- Visit your frontend URL.
- Register or log in.
- Create notes and generate flashcards.
