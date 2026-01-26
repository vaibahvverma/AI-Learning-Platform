'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import {
    Home,
    FileText,
    MessageSquare,
    BookOpen,
    ClipboardList,
    Star,
    LogOut,
    Menu,
    X,
    GraduationCap,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/documents', label: 'Documents', icon: FileText },
    { href: '/favorites', label: 'Favorites', icon: Star },
    { href: '/quiz-history', label: 'Quiz History', icon: ClipboardList },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, isAuthenticated } = useAuthStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (!isAuthenticated) {
        return (
            <nav className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto glass rounded-2xl">
                    <div className="flex items-center justify-between h-16 px-6">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center group-hover:bg-primary-500/20 transition-colors">
                                <GraduationCap className="w-6 h-6 text-primary-400" />
                            </div>
                            <span className="text-xl font-bold font-outfit tracking-tight text-white group-hover:text-primary-400 transition-colors">LearnAI</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="btn-ghost text-sm font-medium">
                                Login
                            </Link>
                            <Link href="/signup" className="btn-primary text-sm py-2 px-5">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto glass rounded-2xl transition-all duration-300">
                <div className="flex items-center justify-between h-16 px-4 sm:px-6">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/5">
                            <GraduationCap className="w-5 h-5 text-primary-300" />
                        </div>
                        <span className="text-xl font-bold font-outfit tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 group-hover:to-primary-400 transition-all hidden sm:block">
                            LearnAI
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${isActive
                                        ? 'text-white bg-white/10 shadow-lg shadow-black/5'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-primary-400' : ''}`} />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-white/10">
                            <div className="text-right hidden lg:block">
                                <div className="text-sm font-medium text-white">{user?.name}</div>
                                <div className="text-xs text-slate-400">Student</div>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary-600 to-accent-600 p-[2px] shadow-lg shadow-primary-500/20">
                                <div className="w-full h-full rounded-full bg-dark-900 flex items-center justify-center text-white text-sm font-bold">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-slate-300 hover:text-white"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-24 left-4 right-4 glass-dark rounded-2xl border border-white/10 animate-slide-down shadow-2xl overflow-hidden">
                    <div className="p-2 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? 'bg-primary-500/20 text-white border border-primary-500/30'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary-400' : ''}`} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </nav>
    );
}
