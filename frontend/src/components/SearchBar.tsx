'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchCache } from '@/lib/useSearchCache';
import { SearchResult, SearchResults } from '@/types';
import { Search, FileText, ClipboardList, BookOpen, Loader2, X } from 'lucide-react';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

const categoryConfig = {
    documents: { label: 'Documents', icon: FileText, color: 'text-primary-400', bg: 'bg-primary-500/20', path: '/documents' },
    quizzes: { label: 'Quizzes', icon: ClipboardList, color: 'text-green-400', bg: 'bg-green-500/20', path: '/quiz' },
    flashcards: { label: 'Flashcards', icon: BookOpen, color: 'text-accent-400', bg: 'bg-accent-500/20', path: '/documents' },
};

type Category = keyof typeof categoryConfig;

export default function SearchBar() {
    const router = useRouter();
    const { search } = useSearchCache();

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResults | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Flatten results for keyboard navigation
    const flatResults: (SearchResult & { category: Category })[] = results
        ? ([
            ...results.documents.map(r => ({ ...r, category: 'documents' as Category })),
            ...results.quizzes.map(r => ({ ...r, category: 'quizzes' as Category })),
            ...results.flashcards.map(r => ({ ...r, category: 'flashcards' as Category })),
        ])
        : [];

    const totalResults = flatResults.length;

    // Debounced search
    useEffect(() => {
        if (query.trim().length < MIN_QUERY_LENGTH) {
            setResults(null);
            setIsOpen(false);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setIsOpen(true);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            try {
                const data = await search(query);
                setResults(data);
                setActiveIndex(-1);
            } catch {
                setResults(null);
            } finally {
                setIsLoading(false);
            }
        }, DEBOUNCE_MS);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, search]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navigateToResult = useCallback((result: SearchResult & { category: Category }) => {
        setIsOpen(false);
        setQuery('');
        setResults(null);

        switch (result.category) {
            case 'documents':
                router.push(`/documents/${result.id}`);
                break;
            case 'quizzes':
                router.push(`/quiz/${result.id}/result`);
                break;
            case 'flashcards':
                router.push(`/documents/${result.id}`);
                break;
        }
    }, [router]);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || totalResults === 0) {
            if (e.key === 'Escape') {
                setIsOpen(false);
                inputRef.current?.blur();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex(prev => (prev + 1) % totalResults);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex(prev => (prev <= 0 ? totalResults - 1 : prev - 1));
                break;
            case 'Enter':
                e.preventDefault();
                if (activeIndex >= 0 && activeIndex < totalResults) {
                    navigateToResult(flatResults[activeIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                inputRef.current?.blur();
                break;
        }
    };

    const clearSearch = () => {
        setQuery('');
        setResults(null);
        setIsOpen(false);
        inputRef.current?.focus();
    };

    // Render results grouped by category
    const renderResults = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center py-8 gap-3">
                    <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
                    <span className="text-sm text-slate-400">Searching...</span>
                </div>
            );
        }

        if (!results || totalResults === 0) {
            return (
                <div className="text-center py-8">
                    <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No results found for &quot;{query}&quot;</p>
                </div>
            );
        }

        let globalIndex = 0;

        return (
            <div className="py-2">
                {(Object.keys(categoryConfig) as Category[]).map(cat => {
                    const items = results[cat];
                    if (!items || items.length === 0) return null;

                    const config = categoryConfig[cat];
                    const Icon = config.icon;

                    return (
                        <div key={cat}>
                            <div className="px-4 py-2 flex items-center gap-2">
                                <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    {config.label}
                                </span>
                                <span className="text-xs text-slate-600">({items.length})</span>
                            </div>
                            {items.map(item => {
                                const currentIndex = globalIndex++;
                                const isActive = currentIndex === activeIndex;
                                return (
                                    <button
                                        key={`${cat}-${item.id}`}
                                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all duration-150 ${isActive
                                                ? 'bg-white/10 border-l-2 border-primary-500'
                                                : 'hover:bg-white/5 border-l-2 border-transparent'
                                            }`}
                                        onClick={() => navigateToResult({ ...item, category: cat })}
                                        onMouseEnter={() => setActiveIndex(currentIndex)}
                                    >
                                        <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                                            <Icon className={`w-4 h-4 ${config.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{item.title}</p>
                                            <p className="text-xs text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div ref={containerRef} className="relative w-full max-w-md">
            {/* Search Input */}
            <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => {
                        if (query.length >= MIN_QUERY_LENGTH && results) setIsOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Search documents, quizzes, flashcards..."
                    className="w-full pl-10 pr-9 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/40 focus:bg-white/[0.07] transition-all duration-300"
                    autoComplete="off"
                />
                {query && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-500 hover:text-white transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 glass-dark rounded-xl border border-white/10 shadow-2xl overflow-hidden z-[100] search-dropdown max-h-[400px] overflow-y-auto">
                    {renderResults()}
                </div>
            )}
        </div>
    );
}
