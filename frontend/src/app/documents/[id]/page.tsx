'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/lib/store';
import { documentApi, aiApi } from '@/lib/api';
import { Document } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
    ArrowLeft,
    MessageSquare,
    Sparkles,
    BookOpen,
    ClipboardList,
    Lightbulb,
    Loader2,
    FileText,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { formatFileSize } from '@/lib/utils';
import toast from 'react-hot-toast';

// Dynamic import for PDF viewer to avoid SSR issues
const PDFViewer = dynamic(() => import('@/components/PDFViewer'), { ssr: false });

export default function DocumentDetailPage() {
    const router = useRouter();
    const params = useParams();
    const documentId = params.id as string;
    const { isAuthenticated, isLoading: authLoading, setLoading } = useAuthStore();
    const [document, setDocument] = useState<Document | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loading, setLoadingState] = useState(true);
    const [showSummary, setShowSummary] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [generatingSummary, setGeneratingSummary] = useState(false);
    const [showExplainer, setShowExplainer] = useState(false);
    const [concept, setConcept] = useState('');
    const [explanation, setExplanation] = useState<string | null>(null);
    const [explaining, setExplaining] = useState(false);
    const [generatingFlashcards, setGeneratingFlashcards] = useState(false);
    const [generatingQuiz, setGeneratingQuiz] = useState(false);

    useEffect(() => {
        setLoading(false);
    }, [setLoading]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        if (isAuthenticated && documentId) {
            fetchDocument();
            fetchPdfUrl();
        }
    }, [isAuthenticated, authLoading, router, documentId]);

    const fetchDocument = async () => {
        try {
            const response = await documentApi.getOne(documentId);
            setDocument(response.data.data.document);
            if (response.data.data.document.summary) {
                setSummary(response.data.data.document.summary);
            }
        } catch (error) {
            toast.error('Failed to load document');
            router.push('/documents');
        } finally {
            setLoadingState(false);
        }
    };

    const fetchPdfUrl = async () => {
        try {
            const response = await documentApi.getFile(documentId);
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
        } catch (error) {
            console.error('Failed to load PDF');
        }
    };

    const handleGenerateSummary = async () => {
        setGeneratingSummary(true);
        try {
            const response = await aiApi.generateSummary(documentId);
            setSummary(response.data.data.summary);
            setShowSummary(true);
            toast.success('Summary generated!');
        } catch (error) {
            toast.error('Failed to generate summary');
        } finally {
            setGeneratingSummary(false);
        }
    };

    const handleExplainConcept = async () => {
        if (!concept.trim()) return;
        setExplaining(true);
        try {
            const response = await aiApi.explainConcept(documentId, concept);
            setExplanation(response.data.data.explanation);
            toast.success('Explanation generated!');
        } catch (error) {
            toast.error('Failed to explain concept');
        } finally {
            setExplaining(false);
        }
    };

    const handleGenerateFlashcards = async () => {
        setGeneratingFlashcards(true);
        try {
            await aiApi.generateFlashcards(documentId, 10);
            toast.success('Flashcards generated!');
            router.push(`/flashcards/${documentId}`);
        } catch (error) {
            toast.error('Failed to generate flashcards');
            setGeneratingFlashcards(false);
        }
    };

    const handleGenerateQuiz = async () => {
        setGeneratingQuiz(true);
        try {
            const response = await aiApi.generateQuiz(documentId, 5);
            toast.success('Quiz generated!');
            router.push(`/quiz/${response.data.data.quiz.id}`);
        } catch (error) {
            toast.error('Failed to generate quiz');
            setGeneratingQuiz(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!document) {
        return null;
    }

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/documents"
                        className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Documents
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">{document.fileName}</h1>
                            <p className="text-dark-400 mt-1">
                                {formatFileSize(document.fileSize)} • {document.pageCount || '?'} pages
                            </p>
                        </div>
                    </div>
                </div>

                {/* AI Actions */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    <Link
                        href={`/chat/${documentId}`}
                        className="flex items-center gap-2 p-4 rounded-xl bg-dark-800/50 border border-dark-700 hover:border-primary-500/50 transition-all"
                    >
                        <MessageSquare className="w-5 h-5 text-primary-400" />
                        <span className="text-sm font-medium text-white">Chat</span>
                    </Link>
                    <button
                        onClick={handleGenerateSummary}
                        disabled={generatingSummary}
                        className="flex items-center gap-2 p-4 rounded-xl bg-dark-800/50 border border-dark-700 hover:border-accent-500/50 transition-all disabled:opacity-50"
                    >
                        {generatingSummary ? (
                            <Loader2 className="w-5 h-5 text-accent-400 animate-spin" />
                        ) : (
                            <Sparkles className="w-5 h-5 text-accent-400" />
                        )}
                        <span className="text-sm font-medium text-white">Summary</span>
                    </button>
                    <button
                        onClick={() => setShowExplainer(true)}
                        className="flex items-center gap-2 p-4 rounded-xl bg-dark-800/50 border border-dark-700 hover:border-yellow-500/50 transition-all"
                    >
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                        <span className="text-sm font-medium text-white">Explain</span>
                    </button>
                    <button
                        onClick={handleGenerateFlashcards}
                        disabled={generatingFlashcards}
                        className="flex items-center gap-2 p-4 rounded-xl bg-dark-800/50 border border-dark-700 hover:border-orange-500/50 transition-all disabled:opacity-50"
                    >
                        {generatingFlashcards ? (
                            <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
                        ) : (
                            <BookOpen className="w-5 h-5 text-orange-400" />
                        )}
                        <span className="text-sm font-medium text-white">Flashcards</span>
                    </button>
                    <button
                        onClick={handleGenerateQuiz}
                        disabled={generatingQuiz}
                        className="flex items-center gap-2 p-4 rounded-xl bg-dark-800/50 border border-dark-700 hover:border-green-500/50 transition-all disabled:opacity-50"
                    >
                        {generatingQuiz ? (
                            <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
                        ) : (
                            <ClipboardList className="w-5 h-5 text-green-400" />
                        )}
                        <span className="text-sm font-medium text-white">Quiz</span>
                    </button>
                </div>

                {/* Summary Panel */}
                {showSummary && summary && (
                    <div className="mb-6 bg-dark-800/50 rounded-2xl p-6 border border-dark-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-accent-400" />
                                Document Summary
                            </h2>
                            <button
                                onClick={() => setShowSummary(false)}
                                className="text-dark-400 hover:text-white"
                            >
                                ×
                            </button>
                        </div>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-dark-200 whitespace-pre-wrap leading-relaxed">{summary}</p>
                        </div>
                    </div>
                )}

                {/* PDF Viewer */}
                <div className="bg-dark-800/50 rounded-2xl border border-dark-700 overflow-hidden">
                    <div className="h-[calc(100vh-300px)] min-h-[500px]">
                        {pdfUrl ? (
                            <PDFViewer url={pdfUrl} />
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <LoadingSpinner />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Explainer Modal */}
            {showExplainer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowExplainer(false)} />
                    <div className="relative bg-dark-800 rounded-2xl p-6 w-full max-w-2xl border border-dark-700 shadow-2xl animate-scale-in max-h-[80vh] overflow-y-auto">
                        <button
                            onClick={() => {
                                setShowExplainer(false);
                                setExplanation(null);
                                setConcept('');
                            }}
                            className="absolute top-4 right-4 p-2 text-dark-400 hover:text-white"
                        >
                            ×
                        </button>

                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Lightbulb className="w-6 h-6 text-yellow-400" />
                            Concept Explainer
                        </h2>

                        <div className="mb-4">
                            <label className="block text-sm text-dark-300 mb-2">
                                What concept would you like explained?
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={concept}
                                    onChange={(e) => setConcept(e.target.value)}
                                    placeholder="e.g., Machine Learning, Photosynthesis..."
                                    className="input-field flex-1"
                                    onKeyDown={(e) => e.key === 'Enter' && handleExplainConcept()}
                                />
                                <button
                                    onClick={handleExplainConcept}
                                    disabled={explaining || !concept.trim()}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    {explaining ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        'Explain'
                                    )}
                                </button>
                            </div>
                        </div>

                        {explanation && (
                            <div className="bg-dark-700/50 rounded-xl p-4 border border-dark-600">
                                <p className="text-dark-200 whitespace-pre-wrap leading-relaxed">{explanation}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
