'use client';

import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
    const isUser = role === 'user';

    return (
        <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isUser
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600'
                        : 'bg-gradient-to-r from-accent-500 to-accent-600'
                    }`}
            >
                {isUser ? (
                    <User className="w-5 h-5 text-white" />
                ) : (
                    <Bot className="w-5 h-5 text-white" />
                )}
            </div>

            {/* Message */}
            <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${isUser
                        ? 'bg-primary-500/20 text-white rounded-tr-none'
                        : 'bg-dark-700 text-dark-100 rounded-tl-none'
                    }`}
            >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
            </div>
        </div>
    );
}
