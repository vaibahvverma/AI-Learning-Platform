'use client';

import { ReactNode } from 'react';

interface ProgressCardProps {
    title: string;
    value: number | string;
    icon: ReactNode;
    color?: 'primary' | 'accent' | 'green' | 'orange';
    subtitle?: string;
}

const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    accent: 'from-accent-500 to-accent-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
};

export default function ProgressCard({
    title,
    value,
    icon,
    color = 'primary',
    subtitle,
}: ProgressCardProps) {
    const bgGradients = {
        primary: 'bg-primary-500/20 text-primary-400',
        accent: 'bg-accent-500/20 text-accent-400',
        green: 'bg-green-500/20 text-green-400',
        orange: 'bg-orange-500/20 text-orange-400',
    };

    return (
        <div className="glass-card rounded-3xl p-6 group hover:translate-y-[-5px] transition-all duration-300">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-slate-400 text-sm font-medium mb-1 group-hover:text-slate-300 transition-colors">{title}</p>
                    <p className="text-4xl font-bold text-white tracking-tight font-outfit">{value}</p>
                    {subtitle && <p className="text-slate-500 text-xs mt-2">{subtitle}</p>}
                </div>
                <div
                    className={`w-14 h-14 rounded-2xl ${bgGradients[color]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                    <div className="w-8 h-8">{icon}</div>
                </div>
            </div>

            {/* Decorative glow */}
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none ${color === 'primary' ? 'bg-primary-500' :
                    color === 'accent' ? 'bg-accent-500' :
                        color === 'green' ? 'bg-green-500' : 'bg-orange-500'
                }`} />
        </div>
    );
}
