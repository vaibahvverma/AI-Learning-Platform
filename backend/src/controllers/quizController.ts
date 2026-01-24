import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Quiz } from '../models/Quiz.js';

// Submit quiz answers
export const submitQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }

        const { quizId } = req.params;
        const { answers } = req.body;

        if (!answers || !Array.isArray(answers)) {
            res.status(400).json({ success: false, message: 'Answers are required' });
            return;
        }

        const quiz = await Quiz.findOne({
            _id: quizId,
            userId: req.user._id
        });

        if (!quiz) {
            res.status(404).json({ success: false, message: 'Quiz not found' });
            return;
        }

        if (quiz.isCompleted) {
            res.status(400).json({ success: false, message: 'Quiz already completed' });
            return;
        }

        // Calculate score
        let correctCount = 0;
        const results = quiz.questions.map((q, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === q.correctAnswer;
            if (isCorrect) correctCount++;

            // Save user answer
            q.userAnswer = userAnswer;

            return {
                question: q.question,
                options: q.options,
                userAnswer,
                correctAnswer: q.correctAnswer,
                isCorrect,
                explanation: q.explanation
            };
        });

        quiz.score = correctCount;
        quiz.isCompleted = true;
        quiz.completedAt = new Date();
        await quiz.save();

        res.status(200).json({
            success: true,
            data: {
                score: correctCount,
                totalQuestions: quiz.totalQuestions,
                percentage: Math.round((correctCount / quiz.totalQuestions) * 100),
                results
            }
        });
    } catch (error) {
        console.error('Submit quiz error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit quiz'
        });
    }
};

// Get quiz result
export const getQuizResult = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }

        const { quizId } = req.params;

        const quiz = await Quiz.findOne({
            _id: quizId,
            userId: req.user._id,
            isCompleted: true
        });

        if (!quiz) {
            res.status(404).json({ success: false, message: 'Quiz not found' });
            return;
        }

        const results = quiz.questions.map(q => ({
            question: q.question,
            options: q.options,
            userAnswer: q.userAnswer,
            correctAnswer: q.correctAnswer,
            isCorrect: q.userAnswer === q.correctAnswer,
            explanation: q.explanation
        }));

        res.status(200).json({
            success: true,
            data: {
                quiz: {
                    id: quiz._id,
                    title: quiz.title,
                    score: quiz.score,
                    totalQuestions: quiz.totalQuestions,
                    percentage: Math.round((quiz.score! / quiz.totalQuestions) * 100),
                    completedAt: quiz.completedAt,
                    results
                }
            }
        });
    } catch (error) {
        console.error('Get quiz result error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get quiz result'
        });
    }
};

// Get quiz history for user
export const getQuizHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }

        const quizzes = await Quiz.find({
            userId: req.user._id,
            isCompleted: true
        })
            .populate('documentId', 'originalName')
            .sort({ completedAt: -1 })
            .limit(20);

        res.status(200).json({
            success: true,
            data: {
                quizzes: quizzes.map(q => ({
                    id: q._id,
                    title: q.title,
                    documentName: (q.documentId as unknown as { originalName: string })?.originalName,
                    score: q.score,
                    totalQuestions: q.totalQuestions,
                    percentage: Math.round((q.score! / q.totalQuestions) * 100),
                    completedAt: q.completedAt
                }))
            }
        });
    } catch (error) {
        console.error('Get quiz history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get quiz history'
        });
    }
};

// Get pending quiz (not completed)
export const getPendingQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authenticated' });
            return;
        }

        const { quizId } = req.params;

        const quiz = await Quiz.findOne({
            _id: quizId,
            userId: req.user._id,
            isCompleted: false
        });

        if (!quiz) {
            res.status(404).json({ success: false, message: 'Quiz not found' });
            return;
        }

        res.status(200).json({
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
        console.error('Get pending quiz error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get quiz'
        });
    }
};
