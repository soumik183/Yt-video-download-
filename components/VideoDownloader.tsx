import React, { useState, useEffect } from 'react';
import type { VideoFormat } from '../types';
import { DownloadIcon, ShareIcon } from './Icons';

interface VideoDownloaderProps {
    videoTitle: string;
    videoUrl: string;
}

export const VideoDownloader: React.FC<VideoDownloaderProps> = ({ videoTitle, videoUrl }) => {
    const [formats, setFormats] = useState<VideoFormat[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!videoUrl) return;

        const fetchFormats = async () => {
            setIsLoading(true);
            setError(null);
            setFormats([]);

            const videoIdMatch = videoUrl.match(/(?:v=)([^&?]+)/);
            if (!videoIdMatch || !videoIdMatch[1]) {
                setError("Could not extract video ID from URL.");
                setIsLoading(false);
                return;
            }
            const videoId = videoIdMatch[1];

            try {
                const response = await fetch(`/api/video-formats?id=${videoId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch video formats.');
                }
                
                const sortedData = data.sort((a: VideoFormat, b: VideoFormat) => {
                    if (a.format < b.format) return 1;
                    if (a.format > b.format) return -1;
                    return parseInt(b.quality) - parseInt(a.quality);
                });
                setFormats(sortedData);

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
                setError(`Error: ${errorMessage}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFormats();
    }, [videoUrl]);

    const sanitizeFilename = (name: string) => name.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
    
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
                {isLoading && (
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                        <p className="mt-2">Fetching available formats...</p>
                    </div>
                )}
                {error && <p className="text-center text-red-400 my-4">{error}</p>}
                
                {!isLoading && !error && formats.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {formats.map((format) => (
                            <a 
                                key={`${format.quality}-${format.format}`}
                                href={format.url}
                                download={`${sanitizeFilename(videoTitle)}_${format.quality}.${format.container}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-700 hover:bg-red-600 rounded-lg transition-all transform hover:-translate-y-1"
                                aria-label={`Download ${videoTitle} in ${format.quality} ${format.format}`}
                            >
                                <DownloadIcon />
                                <span className="font-bold text-lg">{format.quality}</span>
                                <span className="text-sm text-gray-300">{format.format}</span>
                            </a>
                        ))}
                    </div>
                )}
                 <div className="text-center p-3 bg-yellow-900/50 text-yellow-300 border border-yellow-700 rounded-lg text-sm mb-6">
                    <strong>Note:</strong> Please respect copyright. Downloads are for personal use only and should not be redistributed without permission.
                </div>
                <button onClick={handleShare} className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                    <ShareIcon />
                    Share Video Link
                </button>
            </div>
        </section>
    );
};