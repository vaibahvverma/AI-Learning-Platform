'use client';

import { Check, X } from 'lucide-react';

interface QuizQuestionProps {
    questionNumber: number;
    question: string;
    options: string[];
    selectedAnswer?: number;
    correctAnswer?: number;
    onSelect?: (index: number) => void;
    showResult?: boolean;
    explanation?: string;
}

export default function QuizQuestion({
    questionNumber,
    question,
    options,
    selectedAnswer,
    correctAnswer,
    onSelect,
    showResult = false,
    explanation,
}: QuizQuestionProps) {
    return (
        <div className="bg-dark-800/50 rounded-2xl p-6 border border-dark-700">
            <div className="flex items-start gap-4 mb-6">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm font-bold">
                    {questionNumber}
                </span>
                <h3 className="text-lg font-medium text-white">{question}</h3>
            </div>

            <div className="space-y-3">
                {options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = correctAnswer === index;
                    const isWrong = showResult && isSelected && !isCorrect;

                    let optionClasses = 'border-dark-600 hover:border-primary-500/50';
                    if (isSelected && !showResult) {
                        optionClasses = 'border-primary-500 bg-primary-500/20';
                    } else if (showResult) {
                        if (isCorrect) {
                            optionClasses = 'border-green-500 bg-green-500/20';
                        } else if (isWrong) {
                            optionClasses = 'border-red-500 bg-red-500/20';
                        }
                    }

                    return (
                        <button
                            key={index}
                            onClick={() => !showResult && onSelect?.(index)}
                            disabled={showResult}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border transition-all ${optionClasses} ${showResult ? 'cursor-default' : 'cursor-pointer'
                                }`}
                        >
                            <span
                                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isSelected && !showResult
                                        ? 'bg-primary-500 text-white'
                                        : showResult && isCorrect
                                            ? 'bg-green-500 text-white'
                                            : showResult && isWrong
                                                ? 'bg-red-500 text-white'
                                                : 'bg-dark-700 text-dark-300'
                                    }`}
                            >
                                {showResult && isCorrect ? (
                                    <Check className="w-4 h-4" />
                                ) : showResult && isWrong ? (
                                    <X className="w-4 h-4" />
                                ) : (
                                    String.fromCharCode(65 + index)
                                )}
                            </span>
                            <span className={`text-left ${showResult && isCorrect ? 'text-green-400' : 'text-white'}`}>
                                {option}
                            </span>
                        </button>
                    );
                })}
            </div>

            {showResult && explanation && (
                <div className="mt-4 p-4 rounded-xl bg-dark-700/50 border border-dark-600">
                    <p className="text-sm text-dark-300">
                        <span className="font-medium text-primary-400">Explanation: </span>
                        {explanation}
                    </p>
                </div>
            )}
        </div>
    );
}
