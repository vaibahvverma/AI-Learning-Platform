'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { aiApi, documentApi } from '@/lib/api';
import { ChatMessage as ChatMessageType, Document } from '@/types';
import ChatMessage from '@/components/ChatMessage';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowLeft, Send, Loader2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChatPage() {
    const router = useRouter();
    const params = useParams();
    const documentId = params.documentId as string;
    const { isAuthenticated, isLoading: authLoading, setLoading } = useAuthStore();
    const [document, setDocument] = useState<Document | null>(null);
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoadingState] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLoading(false);
    }, [setLoading]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        if (isAuthenticated && documentId) {
            fetchDocument();
            fetchChatHistory();
        }
    }, [isAuthenticated, authLoading, router, documentId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchDocument = async () => {
        try {
            const response = await documentApi.getOne(documentId);
            setDocument(response.data.data.document);
        } catch (error) {
            toast.error('Failed to load document');
            router.push('/documents');
        }
    };

    const fetchChatHistory = async () => {
        try {
            const response = await aiApi.getChatHistory(documentId);
            setMessages(response.data.data.messages || []);
        } catch (error) {
            console.error('Failed to load chat history');
        } finally {
            setLoadingState(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || sending) return;

        const userMessage = input.trim();
        setInput('');
        setSending(true);

        // Add user message immediately
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

        try {
            const response = await aiApi.chat(documentId, userMessage);
            setMessages(prev => [...prev, { role: 'assistant', content: response.data.data.message }]);
        } catch (error) {
            toast.error('Failed to get response');
            // Remove the user message on error
            setMessages(prev => prev.slice(0, -1));
            setInput(userMessage);
        } finally {
            setSending(false);
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
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <div className="bg-dark-800/80 backdrop-blur-lg border-b border-dark-700 px-4 py-4 sticky top-16 z-10">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <Link
                        href={`/documents/${documentId}`}
                        className="p-2 text-dark-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-primary-400" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="font-semibold text-white truncate">{document?.fileName || 'Chat'}</h1>
                            <p className="text-sm text-dark-400">Ask questions about this document</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {messages.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-primary-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">Start a Conversation</h3>
                            <p className="text-dark-400 max-w-md mx-auto">
                                Ask questions about the document and get AI-powered answers based on the content.
                            </p>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <ChatMessage key={index} role={msg.role} content={msg.content} />
                        ))
                    )}
                    {sending && (
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-accent-500 to-accent-600 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                            </div>
                            <div className="bg-dark-700 rounded-2xl rounded-tl-none px-4 py-3">
                                <p className="text-sm text-dark-300">Thinking...</p>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="bg-dark-800/80 backdrop-blur-lg border-t border-dark-700 px-4 py-4">
                <form onSubmit={handleSend} className="max-w-4xl mx-auto">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question about your document..."
                            className="input-field flex-1"
                            disabled={sending}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || sending}
                            className="btn-primary px-4"
                        >
                            {sending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
