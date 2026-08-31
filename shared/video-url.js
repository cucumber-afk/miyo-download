const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function parseYouTubeVideoId(value) {
  if (typeof value !== 'string' || !value.trim()) return null;

  let url;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }

  if (url.protocol !== 'https:') return null;
  if (url.username || url.password || url.port) return null;

  const hostname = url.hostname.toLowerCase();
  if (hostname === 'www.youtube.com' || hostname === 'youtube.com') {
    if (url.pathname !== '/watch') return null;
    const videoId = url.searchParams.get('v');
    return YOUTUBE_VIDEO_ID_PATTERN.test(videoId || '') ? videoId : null;
  }

  if (hostname === 'youtu.be') {
    const videoId = url.pathname.slice(1);
    return YOUTUBE_VIDEO_ID_PATTERN.test(videoId) ? videoId : null;
  }

  return null;
}

export function getYouTubeEmbedUrl(value) {
  const videoId = parseYouTubeVideoId(value);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}
