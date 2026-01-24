'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { flashcardApi, documentApi } from '@/lib/api';
import { Flashcard, Document } from '@/types';
import FlashcardCard from '@/components/FlashcardCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FlashcardsPage() {
    const router = useRouter();
    const params = useParams();
    const documentId = params.documentId as string;
    const { isAuthenticated, isLoading: authLoading, setLoading } = useAuthStore();
    const [document, setDocument] = useState<Document | null>(null);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoadingState] = useState(true);
    const [regenerating, setRegenerating] = useState(false);

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
            fetchFlashcards();
        }
    }, [isAuthenticated, authLoading, router, documentId]);

    const fetchDocument = async () => {
        try {
            const response = await documentApi.getOne(documentId);
            setDocument(response.data.data.document);
        } catch (error) {
            toast.error('Failed to load document');
            router.push('/documents');
        }
    };

    const fetchFlashcards = async () => {
        try {
            const response = await flashcardApi.getByDocument(documentId);
            setFlashcards(response.data.data.flashcards);
        } catch (error) {
            toast.error('Failed to load flashcards');
        } finally {
            setLoadingState(false);
        }
    };

    const handleToggleFavorite = async (flashcardId: string) => {
        try {
            await flashcardApi.toggleFavorite(flashcardId);
            setFlashcards(prev =>
                prev.map(f =>
                    f.id === flashcardId ? { ...f, isFavorite: !f.isFavorite } : f
                )
            );
        } catch (error) {
            toast.error('Failed to update favorite');
        }
    };

    const handleRegenerate = async () => {
        setRegenerating(true);
        try {
            await flashcardApi.deleteByDocument(documentId);
            // Trigger regeneration via AI endpoint
            const { aiApi } = await import('@/lib/api');
            const response = await aiApi.generateFlashcards(documentId, 10);
            setFlashcards(response.data.data.flashcards);
            setCurrentIndex(0);
            toast.success('Flashcards regenerated!');
        } catch (error) {
            toast.error('Failed to regenerate flashcards');
        } finally {
            setRegenerating(false);
        }
    };

    const goToPrev = () => setCurrentIndex(prev => Math.max(prev - 1, 0));
    const goToNext = () => setCurrentIndex(prev => Math.min(prev + 1, flashcards.length - 1));

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/documents/${documentId}`}
                        className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Document
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Flashcards</h1>
                            <p className="text-dark-400 mt-1">{document?.fileName}</p>
                        </div>
                        <button
                            onClick={handleRegenerate}
                            disabled={regenerating}
                            className="btn-secondary flex items-center gap-2"
                        >
                            {regenerating ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <RefreshCw className="w-5 h-5" />
                            )}
                            Regenerate
                        </button>
                    </div>
                </div>

                {flashcards.length > 0 ? (
                    <>
                        {/* Progress */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between text-sm text-dark-400 mb-2">
                                <span>Card {currentIndex + 1} of {flashcards.length}</span>
                                <span>{flashcards.filter(f => f.isFavorite).length} favorites</span>
                            </div>
                            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300"
                                    style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Flashcard */}
                        <FlashcardCard
                            question={flashcards[currentIndex].question}
                            answer={flashcards[currentIndex].answer}
                            isFavorite={flashcards[currentIndex].isFavorite}
                            onToggleFavorite={() => handleToggleFavorite(flashcards[currentIndex].id)}
                        />

                        {/* Navigation */}
                        <div className="flex items-center justify-center gap-4 mt-8">
                            <button
                                onClick={goToPrev}
                                disabled={currentIndex === 0}
                                className="p-3 rounded-xl bg-dark-800 border border-dark-700 hover:border-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </button>
                            <div className="flex gap-2">
                                {flashcards.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`w-3 h-3 rounded-full transition-all ${index === currentIndex
                                                ? 'bg-primary-500 scale-125'
                                                : 'bg-dark-600 hover:bg-dark-500'
                                            }`}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={goToNext}
                                disabled={currentIndex === flashcards.length - 1}
                                className="p-3 rounded-xl bg-dark-800 border border-dark-700 hover:border-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight className="w-6 h-6 text-white" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-dark-400 mb-4">No flashcards yet for this document.</p>
                        <button
                            onClick={handleRegenerate}
                            disabled={regenerating}
                            className="btn-primary flex items-center gap-2 mx-auto"
                        >
                            {regenerating ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Generate Flashcards'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
