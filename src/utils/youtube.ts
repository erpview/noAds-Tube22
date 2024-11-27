export function extractVideoId(url: string): { platform: 'youtube' | 'wistia' | 'vimeo'; id: string } | null {
  try {
    // Handle Vimeo URLs
    if (url.includes('vimeo.com')) {
      const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
      if (vimeoMatch?.[1]) {
        return { platform: 'vimeo', id: vimeoMatch[1] };
      }
      return null;
    }

    // Handle Wistia URLs
    if (url.includes('wistia.com')) {
      const wistiaMatch = url.match(/(?:wistia\.com|wi\.st)\/(?:medias|embed)\/([a-zA-Z0-9]+)/);
      if (wistiaMatch?.[1]) {
        return { platform: 'wistia', id: wistiaMatch[1] };
      }
      return null;
    }

    // Handle direct video ID input for YouTube
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
      return { platform: 'youtube', id: url.trim() };
    }

    const urlObj = new URL(url.trim());
    
    // Handle youtube.com URLs
    if (urlObj.hostname.includes('youtube.com')) {
      if (urlObj.pathname === '/watch') {
        const videoId = urlObj.searchParams.get('v');
        return videoId ? { platform: 'youtube', id: videoId } : null;
      }
      if (urlObj.pathname.startsWith('/shorts/')) {
        return { platform: 'youtube', id: urlObj.pathname.split('/')[2] };
      }
      if (urlObj.pathname.startsWith('/embed/')) {
        return { platform: 'youtube', id: urlObj.pathname.split('/')[2] };
      }
    }
    
    // Handle youtu.be URLs
    if (urlObj.hostname === 'youtu.be') {
      return { platform: 'youtube', id: urlObj.pathname.slice(1) };
    }
    
    return null;
  } catch (error) {
    // If URL parsing fails, try regex patterns
    const patterns = [
      {
        pattern: /(?:youtube\.com\/(?:watch\?.*v=|shorts\/)|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/i,
        platform: 'youtube' as const
      },
      {
        pattern: /(?:wistia\.com|wi\.st)\/(?:medias|embed)\/([a-zA-Z0-9]+)/i,
        platform: 'wistia' as const
      },
      {
        pattern: /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i,
        platform: 'vimeo' as const
      }
    ];

    for (const { pattern, platform } of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) {
        return { platform, id: match[1] };
      }
    }

    return null;
  }
}