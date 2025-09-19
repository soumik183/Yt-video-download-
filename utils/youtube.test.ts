import { describe, it, expect } from 'vitest';
import { extractVideoId } from './youtube';

describe('extractVideoId', () => {
  it('should return null for invalid URLs', () => {
    expect(extractVideoId('not a url')).toBe(null);
  });

  it('should extract video ID from standard youtube.com URLs', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    expect(extractVideoId(url)).toBe('dQw4w9WgXcQ');
  });

  it('should extract video ID from youtu.be URLs', () => {
    const url = 'https://youtu.be/dQw4w9WgXcQ';
    expect(extractVideoId(url)).toBe('dQw4w9WgXcQ');
  });

  it('should extract video ID from youtube.com/embed URLs', () => {
    const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    expect(extractVideoId(url)).toBe('dQw4w9WgXcQ');
  });

  it('should extract video ID from youtube.com/shorts URLs', () => {
    const url = 'https://www.youtube.com/shorts/abcdefghijk';
    expect(extractVideoId(url)).toBe('abcdefghijk');
  });
});
