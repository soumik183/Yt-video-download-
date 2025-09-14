
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { UrlInputForm } from './components/UrlInputForm';
import { ThumbnailDownloader } from './components/ThumbnailDownloader';
import { VideoDownloader } from './components/VideoDownloader';
import { Features } from './components/Features';
import { WhoCanUse } from './components/WhoCanUse';
import { Footer } from './components/Footer';
import { extractVideoId } from './utils/youtube';
import type { VideoInfo } from './types';

const App: React.FC = () => {
    const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
    const [videoId, setVideoId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleUrlSubmit = useCallback(async (url: string) => {
        const id = extractVideoId(url);

        if (!id) {
            setError('Invalid YouTube URL. Please check the link and try again.');
            setVideoInfo(null);
            setVideoId(null);
            return;
        }

        setError(null);
        setVideoId(id);
        setIsLoading(true);
        setVideoInfo(null);

        try {
            const response = await fetch(`/api/video-info?id=${id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch video details.');
            }
           
            setVideoInfo({
                title: data.title,
                author_name: data.author_name,
                thumbnail_url: data.thumbnail_url,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Error: ${errorMessage}`);
            setVideoInfo(null);
            setVideoId(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
            <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
                <Header />
                <UrlInputForm onSubmit={handleUrlSubmit} isLoading={isLoading} />
                
                {error && <p className="text-center text-red-400 mt-4 animate-fade-in">{error}</p>}
                
                {isLoading && (
                    <div className="text-center mt-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                        <p>Fetching video details...</p>
                    </div>
                )}

                {videoId && videoInfo && (
                    <div className="mt-12 animate-fade-in-up space-y-12">
                        <div className="p-6 bg-gray-800 rounded-xl shadow-lg">
                           <h2 className="text-xl md:text-2xl font-bold text-red-400 mb-2">{videoInfo.title}</h2>
                           <p className="text-gray-400">by {videoInfo.author_name}</p>
                        </div>
                        <ThumbnailDownloader videoId={videoId} videoTitle={videoInfo.title} />
                        <VideoDownloader videoTitle={videoInfo.title} videoUrl={`https://www.youtube.com/watch?v=${videoId}`} />
                    </div>
                )}
                
                <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <Features />
                    <WhoCanUse />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default App;
