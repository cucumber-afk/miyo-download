import { Sparkles } from 'lucide-react';
import { upcomingContent } from '../data/content';

export default function NewContentSection() {
  return <section className="new-content-section page-wrap"><div className="new-content-copy"><p className="section-kicker">Always growing</p><h2>There's always<br /><i>something new.</i></h2><p>The MiYo library keeps growing with new expressions, seasonal drops and special collections.</p></div><div className="new-content-list">{upcomingContent.map((item, index) => <div key={item}><span>0{index + 1}</span><strong>{item}</strong>{index === 3 ? <Sparkles size={16} /> : null}</div>)}</div></section>;
}
