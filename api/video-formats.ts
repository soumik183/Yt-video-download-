import ytdl from 'ytdl-core';

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

  if (!id || !ytdl.validateID(id)) {
    return new Response(JSON.stringify({ error: 'Valid Video ID is required' }), { status: 400, headers });
  }

  try {
    const info = await ytdl.getInfo(`https://www.youtube.com/watch?v=${id}`);
    
    const formats = info.formats;

    const videoFormats = ytdl.filterFormats(formats, 'videoandaudio')
        .filter(f => f.container === 'mp4')
        .sort((a, b) => (b.height || 0) - (a.height || 0));
    
    const audioFormats = ytdl.filterFormats(formats, 'audioonly')
        .sort((a,b) => (b.audioBitrate || 0) - (a.audioBitrate || 0));

    const availableFormats = [
        ...videoFormats.map(f => ({
            quality: f.qualityLabel,
            format: 'MP4',
            label: `${f.qualityLabel} - Video`,
            container: f.container,
            url: f.url,
        })),
    ];

    if (audioFormats.length > 0) {
        availableFormats.push({
            quality: `${Math.round((audioFormats[0].audioBitrate || 0))}kbps`,
            format: 'MP3',
            label: 'Audio',
            container: 'mp3',
            url: audioFormats[0].url,
        })
    }

    const uniqueFormats = availableFormats.filter((format, index, self) =>
        index === self.findIndex((f) => f.quality === format.quality && f.format === format.format)
    );
    
    return new Response(JSON.stringify(uniqueFormats), { status: 200, headers });

  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
    return new Response(JSON.stringify({ error: `Server error: Could not process video. It may be private or region-restricted.` }), { status: 500, headers });
  }
}
