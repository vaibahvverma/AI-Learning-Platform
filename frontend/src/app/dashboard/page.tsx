'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { documentApi } from '@/lib/api';
import { UserStats, RecentActivity } from '@/types';
import ProgressCard from '@/components/ProgressCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FileText, BookOpen, ClipboardList, Plus, ArrowRight, Clock } from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function DashboardPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading, setLoading } = useAuthStore();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
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
            fetchStats();
        }
    }, [isAuthenticated, authLoading, router]);

    const fetchStats = async () => {
        try {
            const response = await documentApi.getStats();
            setStats(response.data.data.stats);
            setRecentActivity(response.data.data.recentActivity);
        } catch (error) {
            toast.error('Failed to load dashboard data');
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

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-dark-400 mt-1">Track your learning progress</p>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <ProgressCard
                        title="Total Documents"
                        value={stats?.totalDocuments || 0}
                        icon={<FileText className="w-6 h-6 text-white" />}
                        color="primary"
                    />
                    <ProgressCard
                        title="Flashcards Created"
                        value={stats?.totalFlashcards || 0}
                        icon={<BookOpen className="w-6 h-6 text-white" />}
                        color="accent"
                    />
                    <ProgressCard
                        title="Quizzes Completed"
                        value={stats?.completedQuizzes || 0}
                        icon={<ClipboardList className="w-6 h-6 text-white" />}
                        color="green"
                    />
                </div>

                {/* Quick Actions */}
                <div className="bg-dark-800/50 rounded-2xl p-6 border border-dark-700 mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link
                            href="/documents"
                            className="flex items-center gap-4 p-4 rounded-xl bg-dark-700/50 hover:bg-dark-700 border border-dark-600 hover:border-primary-500/50 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Plus className="w-6 h-6 text-primary-400" />
                            </div>
                            <div>
                                <p className="font-medium text-white">Upload Document</p>
                                <p className="text-sm text-dark-400">Add a new PDF</p>
                            </div>
                        </Link>
                        <Link
                            href="/favorites"
                            className="flex items-center gap-4 p-4 rounded-xl bg-dark-700/50 hover:bg-dark-700 border border-dark-600 hover:border-accent-500/50 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BookOpen className="w-6 h-6 text-accent-400" />
                            </div>
                            <div>
                                <p className="font-medium text-white">View Favorites</p>
                                <p className="text-sm text-dark-400">Review starred cards</p>
                            </div>
                        </Link>
                        <Link
                            href="/quiz-history"
                            className="flex items-center gap-4 p-4 rounded-xl bg-dark-700/50 hover:bg-dark-700 border border-dark-600 hover:border-green-500/50 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ClipboardList className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <p className="font-medium text-white">Quiz History</p>
                                <p className="text-sm text-dark-400">View past results</p>
                            </div>
                        </Link>
                        <Link
                            href="/documents"
                            className="flex items-center gap-4 p-4 rounded-xl bg-dark-700/50 hover:bg-dark-700 border border-dark-600 hover:border-orange-500/50 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6 text-orange-400" />
                            </div>
                            <div>
                                <p className="font-medium text-white">My Documents</p>
                                <p className="text-sm text-dark-400">Browse all files</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Recent Documents */}
                    <div className="bg-dark-800/50 rounded-2xl p-6 border border-dark-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white">Recent Documents</h2>
                            <Link href="/documents" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1">
                                View all <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        {recentActivity?.documents && recentActivity.documents.length > 0 ? (
                            <div className="space-y-3">
                                {recentActivity.documents.map((doc) => (
                                    <Link
                                        key={doc.id}
                                        href={`/documents/${doc.id}`}
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-700/50 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-primary-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-white truncate">{doc.name}</p>
                                            <p className="text-sm text-dark-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatTimeAgo(doc.date)}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-dark-400 text-center py-8">No documents yet. Upload your first PDF!</p>
                        )}
                    </div>

                    {/* Recent Quizzes */}
                    <div className="bg-dark-800/50 rounded-2xl p-6 border border-dark-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white">Recent Quizzes</h2>
                            <Link href="/quiz-history" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1">
                                View all <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        {recentActivity?.quizzes && recentActivity.quizzes.length > 0 ? (
                            <div className="space-y-3">
                                {recentActivity.quizzes.map((quiz) => (
                                    <Link
                                        key={quiz.id}
                                        href={`/quiz/${quiz.id}/result`}
                                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-700/50 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                            <ClipboardList className="w-5 h-5 text-green-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-white truncate">{quiz.name}</p>
                                            <p className="text-sm text-dark-400">
                                                Score: {quiz.score}/{quiz.total} ({Math.round((quiz.score / quiz.total) * 100)}%)
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-dark-400 text-center py-8">No quizzes taken yet. Start learning!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
