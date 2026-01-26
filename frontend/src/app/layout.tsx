import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
    title: 'LearnAI - AI-Powered Learning Assistant',
    description: 'Transform your study materials into interactive learning experiences with AI-powered summaries, flashcards, quizzes, and more.',
    keywords: ['AI', 'Learning', 'Education', 'Flashcards', 'Quiz', 'PDF', 'Study'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.variable} ${outfit.variable} font-sans bg-space-900 text-white min-h-screen relative overflow-x-hidden`}>
                {/* Global Background Elements */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-deep-space" />
                    <div className="absolute inset-0 bg-grid opacity-20" />
                    <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary-900/10 to-transparent opacity-50" />
                </div>

                <div className="relative z-10 flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-grow pt-20 px-4 sm:px-6 lg:px-8">
                        {children}
                    </main>

                    {/* Footer or bottom spacing could go here */}
                    <div className="h-20" />
                </div>

                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        className: '!bg-glass-dark !border-white/10 !text-white !backdrop-blur-md',
                        style: {
                            background: 'rgba(15, 23, 42, 0.8)',
                            color: '#fff',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                        },
                        success: {
                            iconTheme: {
                                primary: '#0ea5e9',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
            </body>
        </html>
    );
}
