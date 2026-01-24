'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Sparkles,
    FileText,
    MessageSquare,
    BookOpen,
    ClipboardList,
    Brain,
    Zap,
    Shield,
    ArrowRight,
} from 'lucide-react';

const features = [
    {
        icon: FileText,
        title: 'PDF Upload & Viewer',
        description: 'Upload and read your study documents directly in the app',
        color: 'from-blue-500 to-blue-600',
    },
    {
        icon: MessageSquare,
        title: 'AI Chat',
        description: 'Ask questions about your documents and get instant answers',
        color: 'from-purple-500 to-purple-600',
    },
    {
        icon: Sparkles,
        title: 'Smart Summaries',
        description: 'Generate concise summaries of entire documents with one click',
        color: 'from-pink-500 to-pink-600',
    },
    {
        icon: BookOpen,
        title: 'Auto Flashcards',
        description: 'Create flashcard sets automatically from document content',
        color: 'from-orange-500 to-orange-600',
    },
    {
        icon: ClipboardList,
        title: 'Quiz Generator',
        description: 'Generate custom quizzes with configurable question counts',
        color: 'from-green-500 to-green-600',
    },
    {
        icon: Brain,
        title: 'Concept Explainer',
        description: 'Get detailed explanations of specific topics from your docs',
        color: 'from-cyan-500 to-cyan-600',
    },
];

export default function LandingPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, isLoading, router]);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 md:py-32 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary-950/50 via-transparent to-transparent" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8 animate-fade-in">
                            <Sparkles className="w-4 h-4 text-primary-400" />
                            <span className="text-sm text-primary-300">Powered by Google Gemini AI</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
                            <span className="gradient-text">Transform Your</span>
                            <br />
                            <span className="text-white">Learning Experience</span>
                        </h1>

                        <p className="text-lg sm:text-xl text-dark-300 max-w-2xl mx-auto mb-10 animate-slide-up">
                            Upload your study materials and let AI create summaries, flashcards, quizzes, and more.
                            Study smarter, not harder.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
                            <Link href="/signup" className="btn-primary flex items-center gap-2 text-lg px-8">
                                Get Started Free
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link href="/login" className="btn-secondary px-8">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-dark-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            Everything You Need to Excel
                        </h2>
                        <p className="text-dark-300 max-w-2xl mx-auto">
                            Our AI-powered tools help you understand, memorize, and test your knowledge efficiently
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="group bg-dark-800/50 rounded-2xl p-6 border border-dark-700 hover:border-primary-500/50 transition-all duration-300 card-hover"
                                >
                                    <div
                                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                                    >
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                                    <p className="text-dark-400">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
                                <Zap className="w-8 h-8 text-primary-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
                            <p className="text-dark-400">
                                Generate study materials in seconds, not hours
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-2xl bg-accent-500/20 flex items-center justify-center mx-auto mb-4">
                                <Brain className="w-8 h-8 text-accent-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">AI-Powered</h3>
                            <p className="text-dark-400">
                                Cutting-edge AI understands your content deeply
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-8 h-8 text-green-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Secure & Private</h3>
                            <p className="text-dark-400">
                                Your documents are encrypted and protected
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-accent-600/20" />
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                        Ready to Transform Your Learning?
                    </h2>
                    <p className="text-lg text-dark-300 mb-8">
                        Join thousands of students who are already studying smarter with LearnAI
                    </p>
                    <Link href="/signup" className="btn-primary text-lg px-10 inline-flex items-center gap-2">
                        Start Learning Today
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-dark-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-dark-400 text-sm">
                            © 2024 LearnAI. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <a href="#" className="text-dark-400 hover:text-white text-sm transition-colors">
                                Privacy Policy
                            </a>
                            <a href="#" className="text-dark-400 hover:text-white text-sm transition-colors">
                                Terms of Service
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
