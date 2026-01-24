import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Flashcard } from '../models/Flashcard.js';

// Get flashcards for document
export const getFlashcards = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }

        const { documentId } = req.params;

        const flashcards = await Flashcard.find({
            documentId,
            userId: req.user._id
        }).sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            data: {
                flashcards: flashcards.map(f => ({
                    id: f._id,
                    question: f.question,
                    answer: f.answer,
                    isFavorite: f.isFavorite,
                    createdAt: f.createdAt
                }))
            }
        });
    } catch (error) {
        console.error('Get flashcards error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get flashcards'
        });
    }
};

// Toggle favorite
export const toggleFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }

        const { flashcardId } = req.params;

        const flashcard = await Flashcard.findOne({
            _id: flashcardId,
            userId: req.user._id
        });

        if (!flashcard) {
            res.status(404).json({ success: false, message: 'Flashcard not found' });
            return;
        }

        flashcard.isFavorite = !flashcard.isFavorite;
        await flashcard.save();

        res.status(200).json({
            success: true,
            data: {
                flashcard: {
                    id: flashcard._id,
                    isFavorite: flashcard.isFavorite
                }
            }
        });
    } catch (error) {
        console.error('Toggle favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle favorite'
        });
    }
};

// Get all favorites
export const getFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }

        const flashcards = await Flashcard.find({
            userId: req.user._id,
            isFavorite: true
        })
            .populate('documentId', 'originalName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                flashcards: flashcards.map(f => ({
                    id: f._id,
                    question: f.question,
                    answer: f.answer,
                    documentName: (f.documentId as unknown as { originalName: string })?.originalName,
                    createdAt: f.createdAt
                }))
            }
        });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get favorites'
        });
    }
};

// Delete flashcards for document
export const deleteFlashcards = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }

        const { documentId } = req.params;

        await Flashcard.deleteMany({
            documentId,
            userId: req.user._id
        });

        res.status(200).json({
            success: true,
            message: 'Flashcards deleted successfully'
        });
    } catch (error) {
        console.error('Delete flashcards error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete flashcards'
        });
    }
};
