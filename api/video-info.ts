import type { VideoInfo } from '../types';

export const config = {
  runtime: 'nodejs',
};

// The oEmbed provider can return more fields, but we only care about these and 'error'
interface NoEmbedResponse extends VideoInfo {
    error?: string;
}

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  const headers = { 'Content-Type': 'application/json' };

  if (!id) {
    return new Response(JSON.stringify({ error: 'Video ID is required' }), { status: 400, headers });
  }

  try {
    const oembedUrl = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) {
      throw new Error(`oEmbed provider responded with status: ${response.status}`);
    }

    const data: NoEmbedResponse = await response.json();

    if (data.error) {
      return new Response(JSON.stringify({ error: data.error }), { status: 404, headers });
    }
    
    return new Response(JSON.stringify(data), { status: 200, headers });

  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    return new Response(JSON.stringify({ error: `Server error: ${errorMessage}` }), { status: 500, headers });
  }
}
