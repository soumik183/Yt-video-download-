import ytdl from 'ytdl-core';
import type { VideoFormat } from '../types';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const headers = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  if (!id || !ytdl.validateID(id)) {
    return new Response(JSON.stringify({ error: 'Valid Video ID is required' }), { status: 400, headers });
  }

  try {
    const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${id}`);
    
    const formats = info.formats;
    const processedFormats = new Map<string, VideoFormat>();

    // Process formats with both video and audio (typically up to 720p)
    ytdl.filterFormats(formats, 'videoandaudio')
        .filter(f => f.container === 'mp4' && f.qualityLabel)
        .forEach(f => {
            processedFormats.set(f.qualityLabel, {
                quality: f.qualityLabel,
                format: 'MP4',
                label: f.qualityLabel,
                container: 'mp4',
                hasAudio: true,
            });
        });

    // Process video-only formats (for 1080p and higher)
    ytdl.filterFormats(formats, 'videoonly')
        .filter(f => f.container === 'mp4' && f.qualityLabel)
        .forEach(f => {
            // Only add this format if we don't already have one with the same quality that includes audio
            if (!processedFormats.has(f.qualityLabel)) {
                processedFormats.set(f.qualityLabel, {
                    quality: f.qualityLabel,
                    format: 'MP4',
                    label: f.qualityLabel,
                    container: 'mp4',
                    hasAudio: false,
                });
            }
        });

    // Get the best available audio format for MP3 conversion
    const audioFormats = ytdl.filterFormats(formats, 'audioonly')
        .sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0));

    if (audioFormats.length > 0) {
        const bestAudio = audioFormats[0];
        processedFormats.set('audio', {
            quality: `${Math.round(bestAudio.audioBitrate || 0)}kbps`,
            format: 'MP3',
            label: 'Audio',
            container: 'mp3',
            hasAudio: true, // This is an audio-only format
        });
    }

    const uniqueFormats = Array.from(processedFormats.values());
    
    // Sort formats: MP4s first (by quality, descending), then the single MP3 option
    const sortedFormats = uniqueFormats.sort((a, b) => {
        if (a.format === 'MP4' && b.format === 'MP3') return -1;
        if (a.format === 'MP3' && b.format === 'MP4') return 1;
        if (a.format === 'MP4' && b.format === 'MP4') {
            const qualityA = parseInt(a.quality, 10);
            const qualityB = parseInt(b.quality, 10);
            return qualityB - qualityA;
        }
        return 0;
    });
    
    return new Response(JSON.stringify(sortedFormats), { status: 200, headers });

  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    return new Response(JSON.stringify({ error: `Server error: Could not process video. It may be private or region-restricted.` }), { status: 500, headers });
  }
}