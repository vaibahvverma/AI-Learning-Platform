'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { quizApi } from '@/lib/api';
import { QuizResult } from '@/types';
import QuizQuestion from '@/components/QuizQuestion';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowLeft, Award } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function QuizResultPage() {
    const router = useRouter();
    const params = useParams();
    const quizId = params.quizId as string;
    const { isAuthenticated, isLoading: authLoading, setLoading } = useAuthStore();
    const [result, setResult] = useState<QuizResult & { title?: string } | null>(null);
    const [loading, setLoadingState] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, [setLoading]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        if (isAuthenticated && quizId) {
            fetchResult();
        }
    }, [isAuthenticated, authLoading, router, quizId]);

    const fetchResult = async () => {
        try {
            const response = await quizApi.getResult(quizId);
            setResult(response.data.data.quiz);
        } catch (error) {
            toast.error('Failed to load quiz result');
            router.push('/quiz-history');
        } finally {
            setLoadingState(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!result) return null;

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/quiz-history"
                    className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Quiz History
                </Link>

                {/* Score Card */}
                <div className="bg-dark-800/50 rounded-2xl p-8 border border-dark-700 text-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4">
                        <Award className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Quiz Results</h1>
                    {result.title && <p className="text-dark-400 mb-6">{result.title}</p>}
                    <div className="flex items-center justify-center gap-8">
                        <div>
                            <p className="text-5xl font-bold gradient-text">{result.score}/{result.totalQuestions}</p>
                            <p className="text-dark-400 mt-1">Correct Answers</p>
                        </div>
                        <div className="w-px h-16 bg-dark-700" />
                        <div>
                            <p className="text-5xl font-bold text-white">{result.percentage}%</p>
                            <p className="text-dark-400 mt-1">Score</p>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <h2 className="text-xl font-semibold text-white mb-4">Question Breakdown</h2>
                <div className="space-y-6">
                    {result.results.map((r, index) => (
                        <QuizQuestion
                            key={index}
                            questionNumber={index + 1}
                            question={r.question}
                            options={r.options}
                            selectedAnswer={r.userAnswer}
                            correctAnswer={r.correctAnswer}
                            showResult={true}
                            explanation={r.explanation}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
