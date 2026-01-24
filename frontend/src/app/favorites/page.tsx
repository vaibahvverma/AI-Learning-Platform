'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { flashcardApi } from '@/lib/api';
import { Flashcard } from '@/types';
import FlashcardCard from '@/components/FlashcardCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FavoritesPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading, setLoading } = useAuthStore();
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoadingState] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, [setLoading]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        if (isAuthenticated) {
            fetchFavorites();
        }
    }, [isAuthenticated, authLoading, router]);

    const fetchFavorites = async () => {
        try {
            const response = await flashcardApi.getFavorites();
            setFlashcards(response.data.data.flashcards);
        } catch (error) {
            toast.error('Failed to load favorites');
        } finally {
            setLoadingState(false);
        }
    };

    const handleRemoveFavorite = async (flashcardId: string) => {
        try {
            await flashcardApi.toggleFavorite(flashcardId);
            setFlashcards(prev => prev.filter(f => f.id !== flashcardId));
            if (currentIndex >= flashcards.length - 1 && currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
            }
            toast.success('Removed from favorites');
        } catch (error) {
            toast.error('Failed to update');
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
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                        Favorite Flashcards
                    </h1>
                    <p className="text-dark-400 mt-1">
                        {flashcards.length} favorite{flashcards.length !== 1 ? 's' : ''} saved
                    </p>
                </div>

                {flashcards.length > 0 ? (
                    <>
                        {/* Progress */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between text-sm text-dark-400 mb-2">
                                <span>Card {currentIndex + 1} of {flashcards.length}</span>
                                {flashcards[currentIndex]?.documentName && (
                                    <span className="text-primary-400">{flashcards[currentIndex].documentName}</span>
                                )}
                            </div>
                            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-300"
                                    style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Flashcard */}
                        <FlashcardCard
                            question={flashcards[currentIndex].question}
                            answer={flashcards[currentIndex].answer}
                            isFavorite={true}
                            onToggleFavorite={() => handleRemoveFavorite(flashcards[currentIndex].id)}
                        />

                        {/* Navigation */}
                        <div className="flex items-center justify-center gap-4 mt-8">
                            <button
                                onClick={goToPrev}
                                disabled={currentIndex === 0}
                                className="p-3 rounded-xl bg-dark-800 border border-dark-700 hover:border-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </button>
                            <div className="flex gap-2 flex-wrap justify-center max-w-md">
                                {flashcards.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`w-3 h-3 rounded-full transition-all ${index === currentIndex
                                                ? 'bg-yellow-500 scale-125'
                                                : 'bg-dark-600 hover:bg-dark-500'
                                            }`}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={goToNext}
                                disabled={currentIndex === flashcards.length - 1}
                                className="p-3 rounded-xl bg-dark-800 border border-dark-700 hover:border-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight className="w-6 h-6 text-white" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-6">
                            <Star className="w-10 h-10 text-dark-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Favorites Yet</h3>
                        <p className="text-dark-400 mb-6">
                            Star flashcards while studying to save them here for quick review
                        </p>
                        <Link href="/documents" className="btn-primary">
                            Browse Documents
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
