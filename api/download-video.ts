import ytdl from 'ytdl-core';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const quality = searchParams.get('quality');
  const container = searchParams.get('container') || 'mp4';
  const title = searchParams.get('title') || 'video';
  
  const safeTitle = title.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
  const filename = `${safeTitle}_${quality}.${container}`;

  if (!id || !ytdl.validateID(id)) {
    return new Response(JSON.stringify({ error: 'Valid Video ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  if (!quality) {
    return new Response(JSON.stringify({ error: 'Quality is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const info = await ytdl.getInfo(id);
    
    let downloadFormat;
    if (container === 'mp3') {
      downloadFormat = ytdl.chooseFormat(info.formats, { filter: 'audioonly', quality: 'highestaudio' });
    } else {
      // Find a format that has both video and audio first
      downloadFormat = info.formats.find(f => f.qualityLabel === quality && f.container === 'mp4' && f.hasVideo && f.hasAudio);
      // If not found (e.g., for high resolutions), find a video-only format
      if (!downloadFormat) {
          downloadFormat = info.formats.find(f => f.qualityLabel === quality && f.container === 'mp4' && f.hasVideo);
      }
    }

    if (!downloadFormat || !downloadFormat.url) {
      return new Response(JSON.stringify({ error: `Could not find a downloadable format for quality: ${quality}` }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const videoResponse = await fetch(downloadFormat.url);

    if (!videoResponse.ok || !videoResponse.body) {
      return new Response('Failed to fetch video stream from source.', { status: 502 });
    }

    const headers = new Headers({
        'Content-Type': downloadFormat.mimeType || (container === 'mp3' ? 'audio/mpeg' : 'video/mp4'),
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache', // Ensure fresh response
    });

    const contentLength = videoResponse.headers.get('Content-Length');
    if (contentLength) {
        headers.set('Content-Length', contentLength);
    }

    return new Response(videoResponse.body, { status: 200, headers });

  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    return new Response(JSON.stringify({ error: `Server error while processing download: ${errorMessage}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
