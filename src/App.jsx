import { useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ChevronDown,
  Download,
  Heart,
  Menu,
  MonitorDown,
  Play,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react';
import './index.css';

const officialAssets = {
  main: '/assets/home/hero-main.png',
  secondary: '/assets/home/hero-secondary.png',
  grid: '/assets/home/hero-grid.png',
  fallback: '/assets/miyo-main.png',
};

const characterPacks = [
  { name: 'Classic MiYo', detail: 'The everyday collection', count: '12 animations', image: officialAssets.main, tone: 'yellow' },
  { name: 'Happy Day', detail: 'Bright expressions & loops', count: '8 GIFs', image: officialAssets.secondary, tone: 'coral' },
  { name: 'Soft Mode', detail: 'Quiet moments for your badge', count: '6 animations', image: officialAssets.grid, tone: 'blue' },
  { name: 'Love Notes', detail: 'Heartfelt reactions', count: '10 GIFs', image: officialAssets.main, tone: 'pink' },
  { name: 'Birthday', detail: 'Celebrate on screen', count: '5 animations', image: officialAssets.secondary, tone: 'orange' },
  { name: 'Seasonal Club', detail: 'Limited-time expressions', count: 'New monthly', image: officialAssets.grid, tone: 'green' },
];

const downloadCategories = [
  { title: 'GIF Animations', description: 'Looping expressions made for your MiYo digital badge.', action: 'Browse GIFs', icon: Play, tone: 'yellow' },
  { title: 'Wallpapers', description: 'Official MiYo backgrounds for desktop and mobile.', action: 'View wallpapers', icon: MonitorDown, tone: 'blue' },
  { title: 'Firmware & Updates', description: 'Keep your badge ready for the newest character packs.', action: 'Check updates', icon: Smartphone, tone: 'dark' },
  { title: 'Seasonal Packs', description: 'Special releases for holidays, birthdays, and more.', action: 'Explore packs', icon: Sparkles, tone: 'coral' },
];

const files = [
  { title: 'Classic MiYo: Hello Loop', type: 'GIF animation', size: 'GIF · 8.4 MB', image: officialAssets.main, tone: 'yellow' },
  { title: 'Happy Day Expressions', type: 'GIF animation', size: 'ZIP · 14 GIFs · 12.1 MB', image: officialAssets.secondary, tone: 'coral' },
  { title: 'MiYo Character Wallpaper Set', type: 'Wallpapers', size: 'PNG · Mobile + desktop · 18 MB', image: officialAssets.grid, tone: 'blue' },
  { title: 'MiYo OS 2.4.0', type: 'Firmware & updates', size: 'Firmware · 2.1 MB', image: officialAssets.main, tone: 'dark' },
];

function OfficialImage({ src, className = '', alt }) {
  const [failed, setFailed] = useState(false);
  return <img className={className} src={failed ? officialAssets.fallback : src} alt={alt} onError={() => setFailed(true)} />;
}

function Nav({ active, setActive }) {
  const [open, setOpen] = useState(false);
  const links = ['Home', 'Characters', 'Downloads', 'Support'];

  const navigate = (item) => {
    setActive(item);
    setOpen(false);
  };

  return (
    <header className="site-header">
      <a className="brand" href="#home" onClick={() => navigate('Home')}>
        <span className="brand-mark">m</span>
        <span>MiYo <em>Studio</em></span>
      </a>
      <nav className={open ? 'nav-links nav-links--open' : 'nav-links'}>
        {links.map((link) => (
          <a key={link} className={active === link ? 'nav-link nav-link--active' : 'nav-link'} href={`#${link.toLowerCase()}`} onClick={() => navigate(link)}>{link}</a>
        ))}
      </nav>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X size={20} /> : <Menu size={20} />}</button>
      <a className="header-download" href="#downloads" onClick={() => navigate('Downloads')}>Download center <ArrowRight size={15} /></a>
    </header>
  );
}

function Hero({ setActive }) {
  return (
    <section className="hero page-wrap" id="home">
      <div className="hero-copy">
        <p className="eyebrow"><span className="eyebrow-dot" />Official MiYo character downloads</p>
        <h1>Your MiYo<br /><span>character library.</span></h1>
        <p className="hero-text">Download expressions, animations, wallpapers, and updates for your MiYo digital badge. Choose a mood and take your companion everywhere.</p>
        <div className="hero-actions">
          <a className="button button--dark" href="#downloads" onClick={() => setActive('Downloads')}>Download animations <ArrowDown size={16} /></a>
          <a className="text-link" href="#characters" onClick={() => setActive('Characters')}>Explore characters <ArrowRight size={17} /></a>
        </div>
        <div className="hero-stats">
          <span><strong>45+</strong> official animations</span>
          <span><strong>4</strong> download categories</span>
        </div>
      </div>
      <div className="hero-gallery" aria-label="MiYo official character artwork">
        <div className="hero-main-art"><span className="gallery-label">Featured character pack</span><OfficialImage src={officialAssets.main} alt="Official MiYo character artwork" /></div>
        <div className="hero-side-art hero-side-art--top"><OfficialImage src={officialAssets.secondary} alt="MiYo character expression" /></div>
        <div className="hero-side-art hero-side-art--bottom"><OfficialImage src={officialAssets.grid} alt="MiYo character collection" /></div>
        <span className="gallery-caption">Made for your<br />digital badge</span>
      </div>
    </section>
  );
}

function FeaturedCharacters({ limit, title = 'Featured character packs', subtitle = 'Choose a collection, then download the expressions that fit your day.' }) {
  const shown = limit ? characterPacks.slice(0, limit) : characterPacks;
  return (
    <section className="page-wrap content-section" id="characters">
      <div className="section-heading">
        <div><p className="section-kicker">Character library</p><h2>{title}</h2></div>
        <p>{subtitle}</p>
      </div>
      <div className="character-grid">
        {shown.map((pack, index) => (
          <article className={`character-card character-card--${pack.tone}`} key={pack.name}>
            <div className="card-art"><span className="card-index">{String(index + 1).padStart(2, '0')}</span><OfficialImage src={pack.image} alt={`${pack.name} official MiYo character art`} /></div>
            <div className="card-content"><div><p className="card-mood">{pack.detail}</p><h3>{pack.name}</h3></div><p>{pack.count}</p><button className="icon-button" aria-label={`Open ${pack.name}`}><ArrowRight size={17} /></button></div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DownloadCenter({ compact = false }) {
  return (
    <section className={compact ? 'download-center download-center--compact' : 'download-center page-wrap'} id={compact ? undefined : 'downloads'}>
      {!compact && <div className="section-heading"><div><p className="section-kicker">Download center</p><h2>Pick a pack.<br /><i>Make it yours.</i></h2></div><p>Official digital content, organized for your MiYo badge.</p></div>}
      <div className="category-grid">
        {downloadCategories.map(({ title, description, action, icon: Icon, tone }) => (
          <article className={`category-card category-card--${tone}`} key={title}><span className="category-icon"><Icon size={19} /></span><div><h3>{title}</h3><p>{description}</p></div><a href="#downloads" className="category-action">{action} <ArrowRight size={15} /></a></article>
        ))}
      </div>
    </section>
  );
}

function Downloads() {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'GIF animation', 'Wallpapers', 'Firmware & updates'];
  const shown = filter === 'All' ? files : files.filter((file) => file.type === filter);
  return (
    <main className="page-wrap page-section downloads-page" id="downloads">
      <div className="section-heading"><div><p className="section-kicker">Download center</p><h2>Official files for<br /><i>your badge.</i></h2></div><p>Download the latest character content, device updates, and companion art.</p></div>
      <DownloadCenter compact />
      <div className="library-heading"><div><p className="section-kicker">Latest releases</p><h3>Ready to download</h3></div><div className="filter-row" aria-label="Download filters">{filters.map((item) => <button key={item} className={filter === item ? 'filter-button filter-button--active' : 'filter-button'} onClick={() => setFilter(item)}>{item}</button>)}</div></div>
      <div className="download-list">{shown.map((file) => <article className="download-row" key={file.title}><div className={`download-preview download-preview--${file.tone}`}><OfficialImage src={file.image} alt={`${file.title} artwork`} /></div><div className="download-info"><p className="card-mood">{file.type}</p><h3>{file.title}</h3></div><span className="download-meta">{file.size}</span><button className="download-button" aria-label={`Download ${file.title}`}><Download size={17} /></button></article>)}</div>
    </main>
  );
}

function HowItWorks() {
  const steps = ['Choose a character', 'Download the file', 'Transfer to your badge', 'Enjoy your MiYo companion'];
  return <section className="how-it-works"><div className="page-wrap"><div className="section-heading"><div><p className="section-kicker">Getting started</p><h2>From library<br />to <i>badge.</i></h2></div><p>Your first MiYo download takes only a few minutes.</p></div><ol className="steps-list">{steps.map((step, index) => <li key={step}><span>0{index + 1}</span><strong>{step}</strong><ArrowRight size={17} /></li>)}</ol></div></section>;
}

function Support() {
  const [open, setOpen] = useState(0);
  const faqs = [
    ['How do I transfer a MiYo download?', 'Download your chosen file, connect your digital badge, and use the MiYo transfer tool to add it.'],
    ['What files work with my badge?', 'GIF animations, supported wallpaper files, and official MiYo firmware packages are ready for compatible digital badges.'],
    ['Where can I find new packs?', 'New official releases appear in the Download Center and Seasonal Packs throughout the year.'],
  ];
  return <main className="page-wrap page-section support-section" id="support"><div className="section-heading"><div><p className="section-kicker">Support</p><h2>Need a little<br /><i>help?</i></h2></div><p>Quick answers and simple setup help for your MiYo badge.</p></div><div className="support-grid"><a className="support-card support-card--dark" href="#downloads"><span className="support-icon"><Play size={15} fill="currentColor" /></span><div><h3>Badge setup guide</h3><p>Everything you need to transfer your first MiYo animation.</p></div><ArrowRight size={20} /></a><div className="faq-panel"><p className="card-mood">Quick FAQ</p>{faqs.map(([question, answer], index) => <div className="faq-item" key={question}><button onClick={() => setOpen(open === index ? -1 : index)}><span>{question}</span><ChevronDown className={open === index ? 'chevron chevron--open' : 'chevron'} size={18} /></button>{open === index && <p>{answer}</p>}</div>)}</div><a className="contact-row" href="mailto:hello@miyostudio.com"><div><p className="card-mood">Need more help?</p><h3>Contact MiYo Studio</h3></div><Heart size={22} /></a></div></main>;
}

function App() {
  const [active, setActive] = useState('Home');
  return <><Nav active={active} setActive={setActive} /><Hero setActive={setActive} /><FeaturedCharacters limit={4} /><DownloadCenter /><HowItWorks /><Downloads /><Support /><footer className="site-footer page-wrap"><a className="brand" href="#home"><span className="brand-mark">m</span><span>MiYo <em>Studio</em></span></a><p>Official digital badge downloads</p><span>© 2026 MiYo Studio</span></footer></>;
}

export default App;
