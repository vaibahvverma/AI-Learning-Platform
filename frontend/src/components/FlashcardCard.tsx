'use client';

import { useState } from 'react';
import { Star, RotateCcw } from 'lucide-react';

interface FlashcardProps {
    question: string;
    answer: string;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
    showFavorite?: boolean;
}

export default function FlashcardCard({
    question,
    answer,
    isFavorite = false,
    onToggleFavorite,
    showFavorite = true,
}: FlashcardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="flashcard-container w-full max-w-2xl mx-auto">
            <div
                className={`flashcard cursor-pointer ${isFlipped ? 'flipped' : ''}`}
                onClick={() => setIsFlipped(!isFlipped)}
            >
                {/* Front - Question */}
                <div className="flashcard-front text-white shadow-2xl">
                    <div className="absolute top-4 left-4 text-sm font-medium opacity-80">QUESTION</div>
                    {showFavorite && onToggleFavorite && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite();
                            }}
                            className="absolute top-4 right-4 p-2 hover:scale-110 transition-transform"
                        >
                            <Star
                                className={`w-6 h-6 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-white/60'}`}
                            />
                        </button>
                    )}
                    <p className="text-xl font-medium text-center leading-relaxed">{question}</p>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-sm opacity-60">
                        <RotateCcw className="w-4 h-4" />
                        <span>Click to flip</span>
                    </div>
                </div>

                {/* Back - Answer */}
                <div className="flashcard-back text-white shadow-2xl">
                    <div className="absolute top-4 left-4 text-sm font-medium opacity-80">ANSWER</div>
                    <p className="text-lg text-center leading-relaxed">{answer}</p>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-sm opacity-60">
                        <RotateCcw className="w-4 h-4" />
                        <span>Click to flip back</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
