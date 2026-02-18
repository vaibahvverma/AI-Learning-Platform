import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    register: (data: { name: string; email: string; password: string }) =>
        api.post('/auth/register', data),
    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),
    getProfile: () => api.get('/auth/profile'),
};

// Document API
export const documentApi = {
    upload: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/documents/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    getAll: () => api.get('/documents'),
    getOne: (id: string) => api.get(`/documents/${id}`),
    getFile: (id: string) =>
        api.get(`/documents/${id}/file`, { responseType: 'blob' }),
    delete: (id: string) => api.delete(`/documents/${id}`),
    getStats: () => api.get('/documents/stats'),
};

// AI API
export const aiApi = {
    chat: (documentId: string, message: string) =>
        api.post(`/ai/chat/${documentId}`, { message }),
    getChatHistory: (documentId: string) =>
        api.get(`/ai/chat/${documentId}/history`),
    generateSummary: (documentId: string) =>
        api.post(`/ai/summary/${documentId}`),
    explainConcept: (documentId: string, concept: string) =>
        api.post(`/ai/explain/${documentId}`, { concept }),
    generateFlashcards: (documentId: string, count?: number) =>
        api.post(`/ai/flashcards/${documentId}?count=${count || 10}`),
    generateQuiz: (documentId: string, count?: number) =>
        api.post(`/ai/quiz/${documentId}?count=${count || 5}`),
};

// Flashcard API
export const flashcardApi = {
    getByDocument: (documentId: string) =>
        api.get(`/flashcards/document/${documentId}`),
    toggleFavorite: (flashcardId: string) =>
        api.patch(`/flashcards/${flashcardId}/favorite`),
    getFavorites: () => api.get('/flashcards/favorites'),
    deleteByDocument: (documentId: string) =>
        api.delete(`/flashcards/document/${documentId}`),
};

// Quiz API
export const quizApi = {
    get: (quizId: string) => api.get(`/quizzes/${quizId}`),
    submit: (quizId: string, answers: number[]) =>
        api.post(`/quizzes/${quizId}/submit`, { answers }),
    getResult: (quizId: string) => api.get(`/quizzes/${quizId}/result`),
    getHistory: () => api.get('/quizzes/history'),
};

// Search API
export const searchApi = {
    search: (query: string) => api.get(`/search?q=${encodeURIComponent(query)}`),
};

export default api;
