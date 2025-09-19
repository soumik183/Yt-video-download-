import playdl from 'play-dl';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const quality = searchParams.get('quality');
  const container = searchParams.get('container') || 'mp4';
  const title = searchParams.get('title') || 'video';
  
  const safeTitle = title.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
  const filename = `${safeTitle}_${quality}.${container}`;

  if (!id || playdl.yt_validate(id) !== 'video') {
    return new Response(JSON.stringify({ error: 'Valid Video ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  if (!quality) {
    return new Response(JSON.stringify({ error: 'Quality is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const url = `https://www.youtube.com/watch?v=${id}`;
    const stream = await playdl.stream(url, {
        quality: quality === 'audio' ? 2 : 1, // 2 for audio, 1 for video
    });

    const headers = new Headers({
        'Content-Type': stream.type,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
    });

    if (stream.contentLength) {
        headers.set('Content-Length', stream.contentLength.toString());
    }

    return new Response(stream.stream, { status: 200, headers });

  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    return new Response(JSON.stringify({ error: `Server error while processing download: ${errorMessage}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
