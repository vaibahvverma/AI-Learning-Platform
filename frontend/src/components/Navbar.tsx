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
            <nav className="fixed top-0 left-0 right-0 z-50 glass-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <GraduationCap className="w-8 h-8 text-primary-500" />
                            <span className="text-xl font-bold gradient-text">LearnAI</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="btn-ghost">
                                Login
                            </Link>
                            <Link href="/signup" className="btn-primary text-sm">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <GraduationCap className="w-8 h-8 text-primary-500" />
                        <span className="text-xl font-bold gradient-text hidden sm:block">LearnAI</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-primary-500/20 text-primary-400'
                                            : 'text-dark-300 hover:text-white hover:bg-dark-700'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-dark-300">{user?.name}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-dark-400 hover:text-red-400 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-dark-300 hover:text-white"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 glass-dark border-t border-dark-700 animate-slide-down">
                    <div className="px-4 py-4 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                            ? 'bg-primary-500/20 text-primary-400'
                                            : 'text-dark-300 hover:text-white hover:bg-dark-700'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
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
