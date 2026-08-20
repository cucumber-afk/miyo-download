import { assets } from '../data/content';
import { OfficialImage } from './OfficialImage';

export default function LifestyleSection() {
  return <section className="lifestyle-section page-wrap"><div className="lifestyle-image"><OfficialImage src={assets.lifestyle} alt="MiYo digital badge in everyday life" /></div><div className="lifestyle-copy"><p className="section-kicker">Made for everyday life</p><h2>Your MiYo,<br /><i>always with you.</i></h2><p>A tiny digital companion for every moment.</p><div className="life-list"><span>On Your Bag</span><span>On Your Desk</span><span>At Home</span><span>On the Go</span></div></div></section>;
}
