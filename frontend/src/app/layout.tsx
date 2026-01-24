import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

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
            <body className={`${inter.className} bg-dark-950 text-white min-h-screen`}>
                <Navbar />
                <main className="pt-16">
                    {children}
                </main>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#1e293b',
                            color: '#f8fafc',
                            border: '1px solid #334155',
                        },
                        success: {
                            iconTheme: {
                                primary: '#0ea5e9',
                                secondary: '#f8fafc',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#f8fafc',
                            },
                        },
                    }}
                />
            </body>
        </html>
    );
}
