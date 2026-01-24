'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { documentApi } from '@/lib/api';
import { Document } from '@/types';
import FileUpload from '@/components/FileUpload';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FileText, Trash2, Plus, X, Upload, Loader2 } from 'lucide-react';
import { formatFileSize, formatTimeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function DocumentsPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading, setLoading } = useAuthStore();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoadingState] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        setLoading(false);
    }, [setLoading]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        if (isAuthenticated) {
            fetchDocuments();
        }
    }, [isAuthenticated, authLoading, router]);

    const fetchDocuments = async () => {
        try {
            const response = await documentApi.getAll();
            setDocuments(response.data.data.documents);
        } catch (error) {
            toast.error('Failed to load documents');
        } finally {
            setLoadingState(false);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        try {
            await documentApi.upload(selectedFile);
            toast.success('Document uploaded successfully!');
            setShowUploadModal(false);
            setSelectedFile(null);
            fetchDocuments();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This will also delete all associated flashcards and quizzes.`)) {
            return;
        }

        try {
            await documentApi.delete(id);
            toast.success('Document deleted');
            setDocuments(documents.filter(doc => doc.id !== id));
        } catch (error) {
            toast.error('Failed to delete document');
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">My Documents</h1>
                        <p className="text-dark-400 mt-1">Upload and manage your study materials</p>
                    </div>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Upload Document
                    </button>
                </div>

                {/* Documents Grid */}
                {documents.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                className="bg-dark-800/50 rounded-2xl border border-dark-700 overflow-hidden hover:border-primary-500/50 transition-all card-hover"
                            >
                                <Link href={`/documents/${doc.id}`} className="block p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-7 h-7 text-primary-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-white truncate">{doc.fileName}</h3>
                                            <p className="text-sm text-dark-400 mt-1">
                                                {formatFileSize(doc.fileSize)} • {doc.pageCount || '?'} pages
                                            </p>
                                            <p className="text-xs text-dark-500 mt-2">{formatTimeAgo(doc.uploadedAt)}</p>
                                        </div>
                                    </div>
                                </Link>
                                <div className="px-6 pb-4 flex justify-end">
                                    <button
                                        onClick={() => handleDelete(doc.id, doc.fileName)}
                                        className="p-2 text-dark-400 hover:text-red-400 transition-colors"
                                        title="Delete document"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-10 h-10 text-dark-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No documents yet</h3>
                        <p className="text-dark-400 mb-6">Upload your first PDF to get started</p>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            <Upload className="w-5 h-5" />
                            Upload Your First Document
                        </button>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowUploadModal(false)} />
                    <div className="relative bg-dark-800 rounded-2xl p-6 w-full max-w-lg border border-dark-700 shadow-2xl animate-scale-in">
                        <button
                            onClick={() => {
                                setShowUploadModal(false);
                                setSelectedFile(null);
                            }}
                            className="absolute top-4 right-4 p-2 text-dark-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-bold text-white mb-6">Upload Document</h2>

                        <FileUpload
                            onFileSelect={setSelectedFile}
                            selectedFile={selectedFile}
                            onClear={() => setSelectedFile(null)}
                            isUploading={uploading}
                        />

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowUploadModal(false);
                                    setSelectedFile(null);
                                }}
                                className="flex-1 btn-secondary"
                                disabled={uploading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                                className="flex-1 btn-primary flex items-center justify-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5" />
                                        Upload
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
