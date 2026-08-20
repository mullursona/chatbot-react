# 🤖 AI Chatbot – MERN Stack

A full-stack AI chatbot application built using the MERN stack, featuring user authentication, persistent chat history, multiple conversations, and AI-powered responses using Google Gemini.

## 🚀 Features

- 🔐 User registration and login
- 🔑 JWT-based authentication
- 💬 AI-powered conversations using Google Gemini
- 🗂️ Multiple chat conversations
- 💾 Chat history stored in MongoDB
- 🗑️ Delete messages and chats
- 🆕 Create new conversations
- 🔍 Search chat messages
- 🌙 Dark mode
- 📋 Copy chatbot responses
- ⚡ Real-time chat interface
- 💻 Responsive React interface

## 🛠️ Technologies Used

### Frontend

- React
- Vite
- React Markdown
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

### AI

- Google Gemini API

## 📁 Project Structure

```text
chatbot-react/
├── server/
│   ├── models/
│   │   ├── Message.js
│   │   └── User.js
│   ├── routes/
│   │   └── authRoutes.js
│   ├── server.js
│   └── package.json
│
├── src/
│   ├── pages/
│   │   └── Login.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── .gitignore
├── package.json
└── README.md

## ⚙️ Installation & Setup

### 1. Clone the repository

git clone https://github.com/mullursona/chatbot-react.git
cd chatbot-react

### 2. Install frontend dependencies

npm install

### 3. Install backend dependencies

cd server
npm install

### 4. Configure environment variables

Create a `.env` file inside the `server` folder.

```env
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret

### 5. Start the backend

Inside the `server` folder:

```bash
node server.js

### 6. Start the frontend

Open another terminal in the project folder:

```bash
npm run dev