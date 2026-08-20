import { assets } from '../data/content';
import { OfficialImage } from './OfficialImage';

export default function ExpressionSection() {
  const tags = ['Happy', 'Sleepy', 'Love', 'Funny', 'Cool', 'Surprised', 'Seasonal', 'More'];
  return <section className="v2-split-section page-wrap expression-section"><div className="v2-copy"><p className="section-kicker">Growing expression library</p><h2>Expressions for<br /><i>every mood.</i></h2><p>Discover an ever-growing collection of animations and expressions made for your MiYo.</p><div className="tag-list">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div><small>New content added regularly.</small></div><div className="v2-image-frame v2-image-frame--expression"><OfficialImage src={assets.expressionLibrary} alt="MiYo surrounded by expression ideas" /></div></section>;
}
