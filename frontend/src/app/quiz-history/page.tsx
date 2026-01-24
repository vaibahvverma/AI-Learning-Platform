'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { quizApi } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ClipboardList, Trophy, Calendar, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface QuizHistoryItem {
    id: string;
    title: string;
    documentName?: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    completedAt: string;
}

export default function QuizHistoryPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading, setLoading } = useAuthStore();
    const [quizzes, setQuizzes] = useState<QuizHistoryItem[]>([]);
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
            fetchHistory();
        }
    }, [isAuthenticated, authLoading, router]);

    const fetchHistory = async () => {
        try {
            const response = await quizApi.getHistory();
            setQuizzes(response.data.data.quizzes);
        } catch (error) {
            toast.error('Failed to load quiz history');
        } finally {
            setLoadingState(false);
        }
    };

    const getScoreColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-400';
        if (percentage >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getScoreBg = (percentage: number) => {
        if (percentage >= 80) return 'bg-green-500/20';
        if (percentage >= 60) return 'bg-yellow-500/20';
        return 'bg-red-500/20';
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
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-yellow-400" />
                        Quiz History
                    </h1>
                    <p className="text-dark-400 mt-1">
                        {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} completed
                    </p>
                </div>

                {quizzes.length > 0 ? (
                    <div className="space-y-4">
                        {quizzes.map((quiz) => (
                            <Link
                                key={quiz.id}
                                href={`/quiz/${quiz.id}/result`}
                                className="block bg-dark-800/50 rounded-2xl p-5 border border-dark-700 hover:border-primary-500/50 transition-all card-hover"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className={`w-14 h-14 rounded-xl ${getScoreBg(quiz.percentage)} flex items-center justify-center flex-shrink-0`}>
                                            <span className={`text-xl font-bold ${getScoreColor(quiz.percentage)}`}>
                                                {quiz.percentage}%
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-white truncate">{quiz.title}</h3>
                                            {quiz.documentName && (
                                                <p className="text-sm text-primary-400 truncate">{quiz.documentName}</p>
                                            )}
                                            <div className="flex items-center gap-4 mt-1 text-sm text-dark-400">
                                                <span className="flex items-center gap-1">
                                                    <ClipboardList className="w-4 h-4" />
                                                    {quiz.score}/{quiz.totalQuestions} correct
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(quiz.completedAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-dark-500 flex-shrink-0" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-6">
                            <ClipboardList className="w-10 h-10 text-dark-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Quizzes Yet</h3>
                        <p className="text-dark-400 mb-6">
                            Generate and complete quizzes from your documents to track your progress
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
