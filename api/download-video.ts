import play from 'play-dl';
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id, itag, container, title } = req.query;
  
  const safeTitle = (title as string || 'video').replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
  const filename = `${safeTitle}.${container as string || 'mp4'}`;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Valid Video ID is required' });
    return;
  }

  if (!itag || typeof itag !== 'string') {
    res.status(400).json({ error: 'Itag is required' });
    return;
  }

  try {
    const info = await play.video_info(`https://www.youtube.com/watch?v=${id}`);
    const format = info.format.find(f => f.itag === parseInt(itag));

    if (!format) {
      res.status(404).json({ error: `Could not find a downloadable format for itag: ${itag}` });
      return;
    }

    const stream = await play.stream_from_info({
        ...info,
        format: [format]
    });

    res.setHeader('Content-Type', stream.type === 'video' ? 'video/mp4' : 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    if (stream.content_length) {
      res.setHeader('Content-Length', stream.content_length);
    }

    stream.stream.pipe(res);

  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    res.status(500).json({ error: `Server error while processing download: ${errorMessage}` });
  }
}
