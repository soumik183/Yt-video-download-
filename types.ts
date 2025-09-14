export interface VideoInfo {
    title: string;
    author_name: string;
    thumbnail_url: string;
}

export enum ThumbnailQuality {
    MaxRes = 'maxresdefault',
    Standard = 'sddefault',
    High = 'hqdefault',
    Medium = 'mqdefault',
    Default = 'default',
}

export const ThumbnailQualities: { key: ThumbnailQuality, label: string, resolution: string }[] = [
    { key: ThumbnailQuality.MaxRes, label: '4K/Ultra HD', resolution: '1920x1080' },
    { key: ThumbnailQuality.Standard, label: 'Standard Definition', resolution: '640x480' },
    { key: ThumbnailQuality.High, label: 'High Quality', resolution: '480x360' },
    { key: ThumbnailQuality.Medium, label: 'Medium Quality', resolution: '320x180' },
];

export interface VideoFormat {
    quality: string;
    format: 'MP4' | 'MP3';
    label: string;
    container: string;
}