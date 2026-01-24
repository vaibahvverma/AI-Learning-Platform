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
    return (
        <div className="bg-dark-800/50 rounded-2xl p-6 border border-dark-700 card-hover">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-dark-400 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-white mt-2">{value}</p>
                    {subtitle && <p className="text-dark-500 text-sm mt-1">{subtitle}</p>}
                </div>
                <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}
