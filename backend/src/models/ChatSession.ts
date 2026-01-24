import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface IChatSession extends Document {
    _id: mongoose.Types.ObjectId;
    documentId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    messages: IChatMessage[];
    createdAt: Date;
    updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const chatSessionSchema = new Schema<IChatSession>({
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
    messages: [chatMessageSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for finding user's chat sessions per document
chatSessionSchema.index({ userId: 1, documentId: 1 });

export const ChatSession = mongoose.model<IChatSession>('ChatSession', chatSessionSchema);
