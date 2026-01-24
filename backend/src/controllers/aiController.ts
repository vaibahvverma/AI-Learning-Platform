import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { DocumentModel } from '../models/Document.js';
import { ChatSession } from '../models/ChatSession.js';
import { Flashcard } from '../models/Flashcard.js';
import { Quiz } from '../models/Quiz.js';
import { extractTextFromPDF } from '../services/pdfService.js';
import * as geminiService from '../services/geminiService.js';

// Helper to get document text
const getDocumentText = async (documentId: string, userId: string): Promise<{ doc: typeof DocumentModel.prototype; text: string } | null> => {
    const document = await DocumentModel.findOne({ _id: documentId, userId }).select('+extractedText');
    if (!document) return null;

    let text = document.extractedText;
    if (!text) {
        const pdfContent = await extractTextFromPDF(document.filePath);
        text = pdfContent.text;
        // Update document with extracted text
        document.extractedText = text;
        await document.save();
    }

    return { doc: document, text };
};

// Chat with document
export const chatWithDocument = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }

        const { documentId } = req.params;
        const { message } = req.body;

        if (!message) {
            res.status(400).json({ success: false, message: 'Message is required' });
            return;
        }

        const result = await getDocumentText(documentId, req.user._id.toString());
        if (!result) {
            res.status(404).json({ success: false, message: 'Document not found' });
            return;
        }

        // Get or create chat session
        let chatSession = await ChatSession.findOne({
            documentId,
            userId: req.user._id
        });

        if (!chatSession) {
            chatSession = await ChatSession.create({
                documentId,
                userId: req.user._id,
                messages: []
            });
        }

        // Get AI response
        const aiResponse = await geminiService.chatWithDocument(
            result.text,
            message,
            chatSession.messages.map(m => ({ role: m.role, content: m.content }))
        );

        // Save messages
        chatSession.messages.push(
            { role: 'user', content: message, timestamp: new Date() },
            { role: 'assistant', content: aiResponse, timestamp: new Date() }
        );
        chatSession.updatedAt = new Date();
        await chatSession.save();

        res.status(200).json({
            success: true,
            data: {
                message: aiResponse,
                sessionId: chatSession._id
            }
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process chat message'
        });
    }
};

// Get chat history
export const getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }

        const { documentId } = req.params;

        const chatSession = await ChatSession.findOne({
            documentId,
            userId: req.user._id
        });

        res.status(200).json({
            success: true,
            data: {
                messages: chatSession?.messages || []
            }
        });
    } catch (error) {
        console.error('Get chat history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get chat history'
        });
    }
};

// Generate document summary
export const generateSummary = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }

        const { documentId } = req.params;

        const result = await getDocumentText(documentId, req.user._id.toString());
        if (!result) {
            res.status(404).json({ success: false, message: 'Document not found' });
            return;
        }

        // Check if summary already exists
        if (result.doc.summary) {
            res.status(200).json({
                success: true,
                data: { summary: result.doc.summary, cached: true }
            });
            return;
        }

        // Generate new summary
        const summary = await geminiService.generateSummary(result.text);

        // Save summary
        result.doc.summary = summary;
        await result.doc.save();

        res.status(200).json({
            success: true,
            data: { summary, cached: false }
        });
    } catch (error) {
        console.error('Generate summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate summary'
        });
    }
};

// Explain concept
export const explainConcept = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }

        const { documentId } = req.params;
        const { concept } = req.body;

        if (!concept) {
            res.status(400).json({ success: false, message: 'Concept is required' });
            return;
        }

        const result = await getDocumentText(documentId, req.user._id.toString());
        if (!result) {
            res.status(404).json({ success: false, message: 'Document not found' });
            return;
        }

        const explanation = await geminiService.explainConcept(result.text, concept);

        res.status(200).json({
            success: true,
            data: { explanation }
        });
    } catch (error) {
        console.error('Explain concept error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to explain concept'
        });
    }
};

// Generate flashcards
export const generateFlashcards = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }

        const { documentId } = req.params;
        const count = parseInt(req.query.count as string) || 10;

        const result = await getDocumentText(documentId, req.user._id.toString());
        if (!result) {
            res.status(404).json({ success: false, message: 'Document not found' });
            return;
        }

        // Check if flashcards already exist
        const existingFlashcards = await Flashcard.find({
            documentId,
            userId: req.user._id
        });

        if (existingFlashcards.length > 0) {
            res.status(200).json({
                success: true,
                data: {
                    flashcards: existingFlashcards.map(f => ({
                        id: f._id,
                        question: f.question,
                        answer: f.answer,
                        isFavorite: f.isFavorite
                    })),
                    cached: true
                }
            });
            return;
        }

        // Generate new flashcards
        const flashcardsData = await geminiService.generateFlashcards(result.text, count);

        // Save flashcards
        const flashcards = await Flashcard.insertMany(
            flashcardsData.map(f => ({
                documentId,
                userId: req.user!._id,
                question: f.question,
                answer: f.answer
            }))
        );

        res.status(201).json({
            success: true,
            data: {
                flashcards: flashcards.map(f => ({
                    id: f._id,
                    question: f.question,
                    answer: f.answer,
                    isFavorite: f.isFavorite
                })),
                cached: false
            }
        });
    } catch (error) {
        console.error('Generate flashcards error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate flashcards'
        });
    }
};

// Generate quiz
export const generateQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }

        const { documentId } = req.params;
        const questionCount = parseInt(req.query.count as string) || 5;

        const result = await getDocumentText(documentId, req.user._id.toString());
        if (!result) {
            res.status(404).json({ success: false, message: 'Document not found' });
            return;
        }

        // Generate quiz questions
        const questionsData = await geminiService.generateQuiz(result.text, questionCount);

        // Create quiz
        const quiz = await Quiz.create({
            documentId,
            userId: req.user._id,
            title: `Quiz: ${result.doc.originalName}`,
            questions: questionsData,
            totalQuestions: questionsData.length
        });

        res.status(201).json({
            success: true,
            data: {
                quiz: {
                    id: quiz._id,
                    title: quiz.title,
                    questions: quiz.questions.map(q => ({
                        question: q.question,
                        options: q.options
                    })),
                    totalQuestions: quiz.totalQuestions
                }
            }
        });
    } catch (error) {
        console.error('Generate quiz error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate quiz'
        });
    }
};
