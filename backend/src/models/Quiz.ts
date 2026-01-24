import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    userAnswer?: number;
}

export interface IQuiz extends Document {
    _id: mongoose.Types.ObjectId;
    documentId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    title: string;
    questions: IQuizQuestion[];
    score?: number;
    totalQuestions: number;
    isCompleted: boolean;
    completedAt?: Date;
    createdAt: Date;
}

const quizQuestionSchema = new Schema<IQuizQuestion>({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
    explanation: { type: String, required: true },
    userAnswer: { type: Number }
});

const quizSchema = new Schema<IQuiz>({
    documentId: {
        type: Schema.Types.ObjectId,
        ref: 'Document',
        required: true,
        index: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    questions: [quizQuestionSchema],
    score: {
        type: Number
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for quiz history
quizSchema.index({ userId: 1, createdAt: -1 });

export const Quiz = mongoose.model<IQuiz>('Quiz', quizSchema);
