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
    const { isAuthenticated, isLoading: authLoading, setLoading, user } = useAuthStore();
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

    // Get time of day for greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12 animate-fade-in">
                    <h1 className="text-4xl sm:text-5xl font-bold font-outfit mb-2">
                        <span className="text-white">{greeting}, </span>
                        <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
                    </h1>
                    <p className="text-slate-400 text-lg flex items-center gap-2">
                        Ready to accelerate your learning today? <span className="text-2xl">🚀</span>
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-8 mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
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
                <div className="glass-card rounded-3xl p-8 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <h2 className="text-2xl font-bold font-outfit text-white mb-6 flex items-center gap-3">
                        <div className="w-1 h-8 bg-primary-500 rounded-full" />
                        Quick Actions
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link
                            href="/documents"
                            className="group relative flex flex-col p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-primary-500/10 hover:border-primary-500/30 transition-all duration-300"
                        >
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="w-5 h-5 text-primary-400 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-primary-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <Plus className="w-7 h-7 text-primary-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">Upload Document</h3>
                            <p className="text-sm text-slate-400 group-hover:text-slate-300">Process new PDFs & Materials</p>
                        </Link>

                        <Link
                            href="/favorites"
                            className="group relative flex flex-col p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-accent-500/10 hover:border-accent-500/30 transition-all duration-300"
                        >
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="w-5 h-5 text-accent-400 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-accent-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <BookOpen className="w-7 h-7 text-accent-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">Study Favorites</h3>
                            <p className="text-sm text-slate-400 group-hover:text-slate-300">Review starred flashcards</p>
                        </Link>

                        <Link
                            href="/quiz-history"
                            className="group relative flex flex-col p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-green-500/10 hover:border-green-500/30 transition-all duration-300"
                        >
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="w-5 h-5 text-green-400 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <ClipboardList className="w-7 h-7 text-green-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">Quiz History</h3>
                            <p className="text-sm text-slate-400 group-hover:text-slate-300">Track your performance</p>
                        </Link>

                        <Link
                            href="/documents"
                            className="group relative flex flex-col p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                        >
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="w-5 h-5 text-white -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <FileText className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">My Library</h3>
                            <p className="text-sm text-slate-400 group-hover:text-slate-300">Manage all your files</p>
                        </Link>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="grid lg:grid-cols-2 gap-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    {/* Recent Documents */}
                    <div className="glass-card rounded-3xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold font-outfit text-white flex items-center gap-3">
                                <FileText className="w-5 h-5 text-primary-400" />
                                Recent Documents
                            </h2>
                            <Link href="/documents" className="text-sm font-medium text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">
                                View all <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        {recentActivity?.documents && recentActivity.documents.length > 0 ? (
                            <div className="space-y-4">
                                {recentActivity.documents.map((doc) => (
                                    <Link
                                        key={doc.id}
                                        href={`/documents/${doc.id}`}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                                            <FileText className="w-6 h-6 text-primary-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-white truncate group-hover:text-primary-400 transition-colors">{doc.name}</p>
                                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                                <Clock className="w-3 h-3" />
                                                {formatTimeAgo(doc.date)}
                                            </p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-white -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-8 h-8 text-slate-500" />
                                </div>
                                <p className="text-slate-400">No documents yet</p>
                                <Link href="/documents" className="text-primary-400 text-sm font-medium hover:underline mt-2 inline-block">
                                    Upload your first PDF
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Recent Quizzes */}
                    <div className="glass-card rounded-3xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold font-outfit text-white flex items-center gap-3">
                                <ClipboardList className="w-5 h-5 text-green-400" />
                                Recent Quizzes
                            </h2>
                            <Link href="/quiz-history" className="text-sm font-medium text-green-400 hover:text-green-300 flex items-center gap-1 transition-colors">
                                View all <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        {recentActivity?.quizzes && recentActivity.quizzes.length > 0 ? (
                            <div className="space-y-4">
                                {recentActivity.quizzes.map((quiz) => (
                                    <Link
                                        key={quiz.id}
                                        href={`/quiz/${quiz.id}/result`}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                                            <ClipboardList className="w-6 h-6 text-green-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-white truncate group-hover:text-green-400 transition-colors">{quiz.name}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500 rounded-full"
                                                        style={{ width: `${(quiz.score / quiz.total) * 100}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs font-medium text-green-400">
                                                    {Math.round((quiz.score / quiz.total) * 100)}%
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-white -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ClipboardList className="w-8 h-8 text-slate-500" />
                                </div>
                                <p className="text-slate-400">No quizzes taken yet</p>
                                <p className="text-sm text-slate-500 mt-1">Start learning to generate quizzes</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
