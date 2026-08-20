import { MonitorDown, Play, Smartphone, Sparkles } from 'lucide-react';
import { assets, contentTypes } from '../data/content';
import { OfficialImage } from './OfficialImage';

export default function DownloadCenterSection() {
  return <section className="download-section"><div className="page-wrap"><div className="section-heading"><div><p className="section-kicker">Your MiYo download center</p><h2>Content made<br /><i>to move.</i></h2></div><p>Discover new animations, expressions, wallpapers and updates for your MiYo digital badge.</p></div><div className="download-feature"><OfficialImage src={assets.downloadCenter} alt="MiYo digital badge download center" /><div><p className="section-kicker">The library is always growing</p><h3>New content, ready when you are.</h3><p>Open the full center to explore official content and future releases.</p></div></div><div className="content-type-grid">{contentTypes.map(({ title, description, tone }, index) => { const Icon = [Play, Sparkles, MonitorDown, Smartphone][index]; return <div key={title} className={`content-type content-type--${tone}`}><span><Icon size={17} /></span><div><h3>{title}</h3><p>{description}</p></div></div>; })}</div></div></section>;
}
