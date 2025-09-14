
import React from 'react';
import type { VideoFormat } from '../types';
import { DownloadIcon, ShareIcon } from './Icons';

interface VideoDownloaderProps {
    videoTitle: string;
    videoUrl: string;
}

const formats: VideoFormat[] = [
    { quality: '1080p', format: 'MP4', label: 'Full HD' },
    { quality: '720p', format: 'MP4', label: 'HD' },
    { quality: '360p', format: 'MP4', label: 'Standard' },
    { quality: '128kbps', format: 'MP3', label: 'Audio' },
];

export const VideoDownloader: React.FC<VideoDownloaderProps> = ({ videoTitle, videoUrl }) => {
    
    const handleDownloadClick = (format: VideoFormat) => {
        alert(`Downloading ${videoTitle} as ${format.quality} ${format.format} is a demonstration feature.\n\nDirectly downloading YouTube videos from a website like this can be against their Terms of Service. This tool is intended for educational purposes to showcase UI/UX design.`);
    };
    
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Check out this video: ${videoTitle}`,
                    text: `Watch "${videoTitle}" on YouTube!`,
                    url: videoUrl,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            // Fallback for browsers that don't support Web Share API
            try {
                await navigator.clipboard.writeText(videoUrl);
                alert('Video link copied to clipboard!');
            } catch (err) {
                alert('Could not copy link. Please copy it manually.');
            }
        }
    };

    return (
        <section>
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">Download Video & Audio</h3>
            <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {formats.map((format) => (
                        <button 
                            key={`${format.quality}-${format.format}`}
                            onClick={() => handleDownloadClick(format)}
                            className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-700 hover:bg-red-600 rounded-lg transition-all transform hover:-translate-y-1"
                        >
                            <DownloadIcon />
                            <span className="font-bold text-lg">{format.quality}</span>
                            <span className="text-sm text-gray-300">{format.format}</span>
                        </button>
                    ))}
                </div>
                 <div className="text-center p-3 bg-yellow-900/50 text-yellow-300 border border-yellow-700 rounded-lg text-sm mb-6">
                    <strong>Note:</strong> Video download is for demonstration only. Please respect YouTube's Terms of Service and copyright policies.
                </div>
                <button onClick={handleShare} className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                    <ShareIcon />
                    Share Video Link
                </button>
            </div>
        </section>
    );
};
