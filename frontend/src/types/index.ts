export interface User {
    id: string;
    name: string;
    email: string;
    createdAt?: string;
}

export interface Document {
    id: string;
    fileName: string;
    fileSize: number;
    pageCount?: number;
    summary?: string;
    uploadedAt: string;
}

export interface Flashcard {
    id: string;
    question: string;
    answer: string;
    isFavorite: boolean;
    documentName?: string;
    createdAt?: string;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer?: number;
    userAnswer?: number;
    explanation?: string;
    isCorrect?: boolean;
}

export interface Quiz {
    id: string;
    title: string;
    documentName?: string;
    questions: QuizQuestion[];
    totalQuestions: number;
    score?: number;
    percentage?: number;
    isCompleted?: boolean;
    completedAt?: string;
}

export interface QuizResult {
    score: number;
    totalQuestions: number;
    percentage: number;
    results: {
        question: string;
        options: string[];
        userAnswer: number;
        correctAnswer: number;
        isCorrect: boolean;
        explanation: string;
    }[];
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
}

export interface UserStats {
    totalDocuments: number;
    totalFlashcards: number;
    completedQuizzes: number;
}

export interface RecentActivity {
    documents: {
        id: string;
        name: string;
        date: string;
        type: 'document';
    }[];
    quizzes: {
        id: string;
        name: string;
        score: number;
        total: number;
        date: string;
        type: 'quiz';
    }[];
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
}

export interface SearchResult {
    id: string;
    title: string;
    subtitle: string;
    type: 'document' | 'quiz' | 'flashcard';
    date: string;
}

export interface SearchResults {
    documents: SearchResult[];
    quizzes: SearchResult[];
    flashcards: SearchResult[];
}
