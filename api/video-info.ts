import play from 'play-dl';
import type { VideoInfo } from '../types';
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Video ID is required' });
    return;
  }

  try {
    const info = await play.video_basic_info(id);

    const videoInfo: VideoInfo = {
      title: info.video_details.title || 'N/A',
      author_name: info.video_details.channel?.name || 'N/A',
      thumbnail_url: info.video_details.thumbnails[0].url,
    };
    
    res.status(200).json(videoInfo);

  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    res.status(500).json({ error: `Server error: ${errorMessage}` });
  }
}
