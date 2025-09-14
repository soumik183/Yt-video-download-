import play from 'play-dl';
import type { VideoFormat } from '../types';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const headers = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  if (!id) {
    return new Response(JSON.stringify({ error: 'Valid Video ID is required' }), { status: 400, headers });
  }

  try {
    const info = await play.video_info(`https://www.youtube.com/watch?v=${id}`);
    
    const formats = info.format;
    const processedFormats = new Map<string, VideoFormat>();

    // Process video formats
    formats.filter(f => f.type === 'video' && f.quality && f.mime_type?.includes('mp4'))
      .forEach(f => {
        const qualityLabel = f.quality || 'N/A';
        const key = `${qualityLabel}-mp4`;
        if (!processedFormats.has(key)) {
          processedFormats.set(key, {
            quality: qualityLabel,
            format: 'MP4',
            label: `${qualityLabel}`,
            container: 'mp4',
            hasAudio: f.audio_channels > 0,
            itag: f.itag,
          });
        }
      });

    formats.filter(f => f.type === 'video' && f.quality && f.mime_type?.includes('webm'))
    .forEach(f => {
      const qualityLabel = f.quality || 'N/A';
      const key = `${qualityLabel}-webm`;
      if (!processedFormats.has(key)) {
        processedFormats.set(key, {
          quality: qualityLabel,
          format: 'WEBM',
          label: `${qualityLabel}`,
          container: 'webm',
          hasAudio: f.audio_channels > 0,
          itag: f.itag,
        });
      }
    });

    // Process audio formats
    const audioFormats = formats.filter(f => f.type === 'audio').sort((a, b) => (b.audio_bitrate || 0) - (a.audio_bitrate || 0));

    if (audioFormats.length > 0) {
        const bestMp3 = audioFormats.find(f => f.mime_type?.includes('mp4'));
        if(bestMp3){
            processedFormats.set('audio-mp3', {
                quality: `${Math.round(bestMp3.audio_bitrate || 0)}kbps`,
                format: 'MP3',
                label: 'Audio',
                container: 'mp3',
                hasAudio: true,
                itag: bestMp3.itag,
            });
        }

        const bestOpus = audioFormats.find(f => f.mime_type?.includes('webm'));
        if(bestOpus){
            processedFormats.set('audio-opus', {
                quality: `${Math.round(bestOpus.audio_bitrate || 0)}kbps`,
                format: 'OPUS',
                label: 'Audio',
                container: 'opus',
                hasAudio: true,
                itag: bestOpus.itag,
            });
        }
    }

    const uniqueFormats = Array.from(processedFormats.values());
    
    const sortedFormats = uniqueFormats.sort((a, b) => {
        if (a.format === 'MP4' && b.format !== 'MP4') return -1;
        if (a.format !== 'MP4' && b.format === 'MP4') return 1;
        if (a.format === 'WEBM' && b.format !== 'WEBM') return -1;
        if (a.format !== 'WEBM' && b.format === 'WEBM') return 1;
        if (a.format === 'MP4' && b.format === 'MP4' || a.format === 'WEBM' && b.format === 'WEBM') {
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