
import React, { useState } from 'react';

interface UrlInputFormProps {
    onSubmit: (url: string) => void;
    isLoading: boolean;
}

export const UrlInputForm: React.FC<UrlInputFormProps> = ({ onSubmit, isLoading }) => {
    const [url, setUrl] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(url);
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl p-2 shadow-lg focus-within:ring-2 focus-within:ring-red-500 transition-shadow">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste YouTube video link here..."
                    className="w-full bg-transparent p-3 text-gray-200 placeholder-gray-500 focus:outline-none"
                    aria-label="YouTube video URL"
                />
                <button
                    type="submit"
                    disabled={isLoading || !url}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </>
                    ) : (
                        'Get Video'
                    )}
                </button>
            </div>
        </form>
    );
};
