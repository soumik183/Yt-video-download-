import play from 'play-dl';
import type { VideoFormat } from '../types';
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Valid Video ID is required' });
    return;
  }

  try {
    await play.setToken({
      useragent: ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36']
    })
    const info = await play.video_info(`https://www.youtube.com/watch?v=${id}`);
    
    const formats = info.format;
    const processedFormats = new Map<string, VideoFormat>();

    // Process video formats
    formats.filter(f => f.type === 'video' && f.quality && f.mimeType?.includes('mp4'))
      .forEach(f => {
        const qualityLabel = f.quality || 'N/A';
        const key = `${qualityLabel}-mp4`;
        if (!processedFormats.has(key)) {
          processedFormats.set(key, {
            quality: qualityLabel,
            format: 'MP4',
            label: `${qualityLabel}`,
            container: 'mp4',
            hasAudio: (f.audioChannels || 0) > 0,
            itag: f.itag,
          });
        }
      });

    formats.filter(f => f.type === 'video' && f.quality && f.mimeType?.includes('webm'))
    .forEach(f => {
      const qualityLabel = f.quality || 'N/A';
      const key = `${qualityLabel}-webm`;
      if (!processedFormats.has(key)) {
        processedFormats.set(key, {
          quality: qualityLabel,
          format: 'WEBM',
          label: `${qualityLabel}`,
          container: 'webm',
          hasAudio: (f.audioChannels || 0) > 0,
          itag: f.itag,
        });
      }
    });

    // Process audio formats
    const audioFormats = formats.filter(f => f.type === 'audio').sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

    if (audioFormats.length > 0) {
        const bestMp3 = audioFormats.find(f => f.mimeType?.includes('mp4'));
        if(bestMp3){
            processedFormats.set('audio-mp3', {
                quality: `${Math.round(bestMp3.bitrate || 0)}kbps`,
                format: 'MP3',
                label: 'Audio',
                container: 'mp3',
                hasAudio: true,
                itag: bestMp3.itag,
            });
        }

        const bestOpus = audioFormats.find(f => f.mimeType?.includes('webm'));
        if(bestOpus){
            processedFormats.set('audio-opus', {
                quality: `${Math.round(bestOpus.bitrate || 0)}kbps`,
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
    
    res.status(200).json(sortedFormats);

  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    res.status(500).json({ error: `Server error: Could not process video. It may be private or region-restricted.` });
  }
}