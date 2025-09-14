import play from 'play-dl';
import type { VideoInfo } from '../types';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  const headers = { 'Content-Type': 'application/json' };

  if (!id) {
    return new Response(JSON.stringify({ error: 'Video ID is required' }), { status: 400, headers });
  }

  try {
    const info = await play.video_basic_info(id);

    const videoInfo: VideoInfo = {
      title: info.video_details.title || 'N/A',
      author_name: info.video_details.channel?.name || 'N/A',
      thumbnail_url: info.video_details.thumbnails[0].url,
    };
    
    return new Response(JSON.stringify(videoInfo), { status: 200, headers });

  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    return new Response(JSON.stringify({ error: `Server error: ${errorMessage}` }), { status: 500, headers });
  }
}
