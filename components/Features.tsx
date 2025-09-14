import React from 'react';
import { CheckIcon } from './Icons';

const featuresList = [
    { title: 'High-Quality Thumbnails', description: 'Save thumbnails in HD, Full HD, and 4K.' },
    { title: 'Video & Audio Downloader', description: 'Download videos (up to 4K) and audio (MP3).' },
    { title: 'Fast & Easy', description: 'Just paste the link, preview, and download.' },
    { title: 'Mobile Optimized', description: 'Works perfectly on Android & iOS devices.' },
    { title: 'Free to Use', description: '100% free with no hidden charges.' },
    { title: 'Safe & Secure', description: 'No login or personal data required.' },
];

export const Features: React.FC = () => (
    <section>
        <h3 className="text-2xl md:text-3xl font-bold mb-6 text-red-400">🎯 App Features</h3>
        <div className="space-y-4">
            {featuresList.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gray-800 rounded-lg">
                    <div className="flex-shrink-0 text-red-500 mt-1">
                        <CheckIcon />
                    </div>
                    <div>
                        <h4 className="font-semibold text-white">{feature.title}</h4>
                        <p className="text-gray-400">{feature.description}</p>
                    </div>
                </div>
            ))}
        </div>
    </section>
);