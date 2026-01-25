import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import flashcardRoutes from './routes/flashcardRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/quizzes', quizRoutes);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB and start server
const startServer = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-learning';

        // Add connection options for better stability
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ Connected to MongoDB');

        const server = app.listen(Number(PORT), '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📚 API endpoints available at /api`);
        });

        // Graceful shutdown
        const shutdown = async () => {
            console.log('🛑 Shutting down server...');
            server.close(() => {
                console.log('Server closed');
                mongoose.connection.close(false).then(() => {
                    console.log('MongoDB connection closed');
                    process.exit(0);
                });
            });
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);

    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        // Don't exit immediately on transient errors in production, let Railway restart it if it crashes repeatedy, 
        // but for connection setup handled by process manager, exit is fine.
        // However, we can add a small delay before exiting to prevent tight loops
        console.log('Retrying in 5 seconds...');
        setTimeout(startServer, 5000);
    }
};

startServer();

export default app;
