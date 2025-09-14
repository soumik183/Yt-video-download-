
import React from 'react';
import { ThumbnailQualities, ThumbnailQuality } from '../types';
import { DownloadIcon } from './Icons';

interface ThumbnailDownloaderProps {
    videoId: string;
    videoTitle: string;
}

const DownloadButton: React.FC<{ url: string; filename: string; }> = ({ url, filename }) => {
    const handleDownload = async () => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok.');
            const blob = await response.blob();
            const objectUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(objectUrl);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback to opening in a new tab
            window.open(url, '_blank');
        }
    };
    
    return (
       <button onClick={handleDownload} className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
           <DownloadIcon />
           Download
       </button>
    )
}

export const ThumbnailDownloader: React.FC<ThumbnailDownloaderProps> = ({ videoId, videoTitle }) => {

    const getThumbnailUrl = (quality: ThumbnailQuality) => `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;

    const sanitizeFilename = (name: string) => name.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();

    return (
        <section>
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">Download Thumbnails</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {ThumbnailQualities.map(({ key, label, resolution }) => {
                    const url = getThumbnailUrl(key);
                    const filename = `${sanitizeFilename(videoTitle)}_thumbnail_${key}.jpg`;
                    return (
                        <div key={key} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col p-4 border border-gray-700">
                            <div className="aspect-video bg-gray-700 rounded-md overflow-hidden mb-4">
                               <img src={url} alt={`${label} thumbnail for ${videoTitle}`} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                            <div className="flex-grow flex flex-col justify-end">
                                <div className="text-center mb-4">
                                    <h4 className="font-bold text-lg text-white">{label}</h4>
                                    <p className="text-sm text-gray-400">{resolution}</p>
                                </div>
                                <DownloadButton url={url} filename={filename} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};
