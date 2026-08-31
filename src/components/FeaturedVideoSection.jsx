import { Play } from 'lucide-react';
import { getYouTubeEmbedUrl } from '../../shared/video-url.js';

export default function FeaturedVideoSection({ section }) {
  const { content = {}, design = {}, media = {} } = section;
  const videoSrc = media.videoKey ? `/api/media?key=${encodeURIComponent(media.videoKey)}` : media.videoUrl || '';
  const embedSrc = media.videoKey ? null : getYouTubeEmbedUrl(media.videoUrl);
  const poster = media.posterImageKey ? `/api/media?key=${encodeURIComponent(media.posterImageKey)}` : undefined;
  const renderVideo = () => {
    if (embedSrc) return <iframe src={embedSrc} title={content.title || 'MiYo featured video'} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" />;
    if (videoSrc) return <video controls playsInline preload="metadata" poster={poster} src={videoSrc}>Your browser does not support video playback.</video>;
    return <div className="support-video-fallback"><Play size={22} fill="currentColor" /><span>MiYo support video</span></div>;
  };
  return <section className="page-wrap support-video-section" data-layout-style={design.layoutStyle || 'split'} data-media-width={design.mediaWidth || 'normal'} data-spacing={design.spacing || 'normal'} style={design.backgroundColor ? { '--cms-background-color': design.backgroundColor } : undefined}><div className="support-video-copy"><p className="section-kicker">{content.sectionKicker || 'Featured video'}</p><h2>{content.title}{content.titleHighlight && <><br /><i>{content.titleHighlight}</i></>}</h2><p>{content.description}</p><a className="button button--dark" href={content.buttonLink || '#'}>{content.buttonText || 'Learn more'}</a></div><div className="support-video-frame">{renderVideo()}</div></section>;
}
