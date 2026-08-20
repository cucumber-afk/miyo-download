import { ArrowRight } from 'lucide-react';
import HeroCharacterShowcase from './HeroCharacterShowcase';

export default function HeroSection({ onNavigate }) {
  return <section className="v2-hero page-wrap">
    <div className="hero-copy">
      <p className="eyebrow"><span className="eyebrow-dot" />MiYo Digital Expression Characters</p>
      <div className="hero-intro">
        <h1>Bring MiYo<br /><span>to life.</span></h1>
        <p>Your MiYo is more than one expression. Download new expressions, animations, and content to help your digital companion keep growing.</p>
      </div>
      <div className="hero-actions">
        <button className="button button--dark" onClick={() => onNavigate('/downloads')}>Browse animations <ArrowRight size={15} /></button>
      </div>
      <div className="hero-stats">
        <span><strong>Regular updates</strong>Content that keeps expanding</span>
        <span><strong>Many expressions</strong>For every mood</span>
        <span><strong>Animated previews</strong>Bring your character to life</span>
      </div>
    </div>
    <HeroCharacterShowcase />
  </section>;
}
