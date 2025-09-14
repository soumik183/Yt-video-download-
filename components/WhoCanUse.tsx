
import React from 'react';
import { UserIcon } from './Icons';

const userGroups = [
    { title: 'YouTube Creators', description: 'For creating eye-catching content and assets.' },
    { title: 'Marketers & Designers', description: 'To grab attention with high-quality visuals for campaigns.' },
    { title: 'Fans & Viewers', description: 'Save your favorite video covers & clips for personal use.' },
];

export const WhoCanUse: React.FC = () => (
    <section>
        <h3 className="text-2xl md:text-3xl font-bold mb-6 text-red-400">🎬 Who Can Use?</h3>
        <div className="space-y-4">
            {userGroups.map((group, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gray-800 rounded-lg">
                    <div className="flex-shrink-0 text-red-500 mt-1">
                        <UserIcon />
                    </div>
                    <div>
                        <h4 className="font-semibold text-white">{group.title}</h4>
                        <p className="text-gray-400">{group.description}</p>
                    </div>
                </div>
            ))}
        </div>
    </section>
);
