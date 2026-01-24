import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    fileName: string;
    originalName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    pageCount?: number;
    summary?: string;
    extractedText?: string;
    uploadedAt: Date;
}

const documentSchema = new Schema<IDocument>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    fileName: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    mimeType: {
        type: String,
        required: true,
        default: 'application/pdf'
    },
    pageCount: {
        type: Number
    },
    summary: {
        type: String
    },
    extractedText: {
        type: String,
        select: false
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
documentSchema.index({ userId: 1, uploadedAt: -1 });

export const DocumentModel = mongoose.model<IDocument>('Document', documentSchema);
