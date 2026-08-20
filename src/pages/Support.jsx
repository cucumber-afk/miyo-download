import { ArrowRight, ChevronDown, Heart, Play } from 'lucide-react';
import { useState } from 'react';

export default function Support({ standalone = false }) {
  const [open, setOpen] = useState(0);
  const faqs = [
    ['Getting Started', 'A simple place to begin exploring the MiYo content library.'],
    ['How to Transfer Content', 'Download official content, then use your MiYo transfer workflow to move it to the badge.'],
    ['FAQ', 'Find answers about content, updates, and the growing library here.'],
  ];
  return <main className={standalone ? 'page-wrap page-section support-page' : 'support-section page-wrap'}><div className="section-heading"><div><p className="section-kicker">Support</p><h2>Keep your MiYo<br /><i>in motion.</i></h2></div><p>Setup guidance and answers for your digital companion.</p></div><div className="support-grid"><a className="support-card support-card--dark" href="mailto:hello@miyostudio.com"><span className="support-icon"><Play size={15} fill="currentColor" /></span><div><h3>Start here</h3><p>Explore the basics of your MiYo content library.</p></div><ArrowRight size={20} /></a><div className="faq-panel"><p className="card-mood">Support topics</p>{faqs.map(([question, answer], index) => <div className="faq-item" key={question}><button onClick={() => setOpen(open === index ? -1 : index)}><span>{question}</span><ChevronDown className={open === index ? 'chevron chevron--open' : 'chevron'} size={18} /></button>{open === index && <p>{answer}</p>}</div>)}</div><a className="contact-row" href="mailto:hello@miyostudio.com"><div><p className="card-mood">Need more help?</p><h3>Contact MiYo Studio</h3></div><Heart size={22} /></a></div></main>;
}
