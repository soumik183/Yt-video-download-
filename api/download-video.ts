import play from 'play-dl';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const itag = searchParams.get('itag');
  const container = searchParams.get('container') || 'mp4';
  const title = searchParams.get('title') || 'video';
  
  const safeTitle = title.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
  const filename = `${safeTitle}.${container}`;

  if (!id) {
    return new Response(JSON.stringify({ error: 'Valid Video ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  if (!itag) {
    return new Response(JSON.stringify({ error: 'Itag is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const stream = await play.stream(`https://www.youtube.com/watch?v=${id}`, {
        itag: parseInt(itag)
    });

    const headers = new Headers({
        'Content-Type': stream.type === 'video' ? 'video/mp4' : 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
    });

    if (stream.content_length) {
        headers.set('Content-Length', stream.content_length);
    }

    return new Response(stream.stream, { status: 200, headers });

  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    return new Response(JSON.stringify({ error: `Server error while processing download: ${errorMessage}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
