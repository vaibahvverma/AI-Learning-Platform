import mongoose, { Document, Schema } from 'mongoose';

export interface IFlashcard extends Document {
    _id: mongoose.Types.ObjectId;
    documentId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    question: string;
    answer: string;
    isFavorite: boolean;
    createdAt: Date;
}

const flashcardSchema = new Schema<IFlashcard>({
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
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    isFavorite: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for user favorites
flashcardSchema.index({ userId: 1, isFavorite: 1 });

export const Flashcard = mongoose.model<IFlashcard>('Flashcard', flashcardSchema);
