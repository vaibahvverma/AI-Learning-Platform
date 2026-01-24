# AI-Powered Learning Assistant

A full-stack AI-powered learning platform built with the MERN stack (MongoDB, Express, React/Next.js, Node.js) and TypeScript. Transform your study materials into interactive learning experiences with AI-powered summaries, flashcards, quizzes, and more.

![LearnAI](https://img.shields.io/badge/LearnAI-AI%20Powered-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

## ✨ Features

- 🔐 **User Authentication** - Secure login & signup with JWT
- 📄 **PDF Upload & Management** - Upload, store, and manage study documents with file size tracking
- 📖 **Embedded PDF Viewer** - Read documents directly within the app
- 💬 **AI-Powered Chat** - Ask questions about your documents with context-aware AI responses
- 📝 **AI Document Summary** - Generate concise summaries with one click
- 💡 **AI Concept Explainer** - Get detailed explanations of specific topics
- 🎴 **Auto-Generated Flashcards** - Create flashcard sets automatically with flip animation
- 📋 **AI Quiz Generator** - Generate custom MCQ quizzes with configurable question counts
- 📊 **Quiz Results & Analytics** - View detailed score breakdowns with explanations
- 📈 **Progress Tracking Dashboard** - Monitor documents, flashcards, and quizzes
- ⭐ **Favorites System** - Mark important flashcards for quick review
- 📱 **Responsive UI** - Modern, mobile-friendly design with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript**
- **Tailwind CSS** with custom animations
- **Zustand** for state management
- **react-pdf** for PDF viewing
- **Axios** for API calls

### Backend
- **Express.js** with TypeScript
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Multer** for file uploads
- **Google Gemini AI** for all AI features

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API Key

### Installation

1. **Clone the repository**
```bash
cd Ai-Learning-Platform
```

2. **Set up the Backend**
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your values:
# - MONGODB_URI
# - JWT_SECRET
# - GEMINI_API_KEY
```

3. **Set up the Frontend**
```bash
cd ../frontend
npm install

# Create .env.local file
cp .env.example .env.local
```

4. **Start Development Servers**

Backend (Terminal 1):
```bash
cd backend
npm run dev
```

Frontend (Terminal 2):
```bash
cd frontend
npm run dev
```

5. **Open the app**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
Ai-Learning-Platform/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth & error handling
│   │   ├── services/        # Business logic & AI
│   │   └── index.ts         # Server entry
│   └── uploads/             # PDF storage
│
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # React components
│   │   ├── lib/             # Utils, API, store
│   │   └── types/           # TypeScript types
│   └── public/              # Static assets
│
└── README.md
```

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-learning
JWT_SECRET=your-super-secret-jwt-key
GEMINI_API_KEY=your-gemini-api-key
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Documents
- `POST /api/documents/upload` - Upload PDF
- `GET /api/documents` - Get all documents
- `GET /api/documents/:id` - Get document
- `GET /api/documents/:id/file` - Get PDF file
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/stats` - Get user stats

### AI Features
- `POST /api/ai/chat/:documentId` - Chat with document
- `GET /api/ai/chat/:documentId/history` - Get chat history
- `POST /api/ai/summary/:documentId` - Generate summary
- `POST /api/ai/explain/:documentId` - Explain concept
- `POST /api/ai/flashcards/:documentId` - Generate flashcards
- `POST /api/ai/quiz/:documentId` - Generate quiz

### Flashcards
- `GET /api/flashcards/document/:documentId` - Get flashcards
- `PATCH /api/flashcards/:flashcardId/favorite` - Toggle favorite
- `GET /api/flashcards/favorites` - Get all favorites

### Quizzes
- `GET /api/quizzes/:quizId` - Get quiz
- `POST /api/quizzes/:quizId/submit` - Submit quiz
- `GET /api/quizzes/:quizId/result` - Get quiz result
- `GET /api/quizzes/history` - Get quiz history

## 🎨 Screenshots

The application features a modern dark theme with:
- Glassmorphism effects
- Gradient accents
- Smooth animations
- 3D flashcard flip effects
- Responsive design for all devices

## 🙏 Acknowledgments

- [Google Gemini AI](https://deepmind.google/technologies/gemini/) for AI capabilities
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
