import { ArrowDown, ArrowRight, Download, Sparkles } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    ['01', 'Choose', 'Pick an animation or expression.', Download],
    ['02', 'Download', 'Save the content to your device.', ArrowDown],
    ['03', 'Transfer', 'Move it to your MiYo badge.', ArrowRight],
    ['04', 'Enjoy', 'Give your MiYo a new mood.', Sparkles],
  ];
  return <section className="how-it-works"><div className="page-wrap"><div className="section-heading"><div><p className="section-kicker">From library to badge</p><h2>Make it<br /><i>yours.</i></h2></div><p>Bring new character content from the library to your MiYo digital badge.</p></div><ol className="steps-list">{steps.map(([number, title, detail, Icon]) => <li key={title}><div className="step-topline"><span>{number}</span><Icon size={17} /></div><strong>{title}</strong><p>{detail}</p></li>)}</ol></div></section>;
}
