import { useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Download,
  Heart,
  Menu,
  Play,
  Sparkles,
  X,
} from 'lucide-react';
import './index.css';

const MIYO_MAIN = '/assets/miyo-main.png';

const characters = [
  {
    name: 'Happy',
    mood: 'Bright & bubbly',
    color: '#f5ce45',
    accent: '#fff3b7',
    copy: 'A sunny little presence for wins, plans, and everyday sparks.',
  },
  {
    name: 'Sleep',
    mood: 'Soft & sleepy',
    color: '#bfc9dc',
    accent: '#edf1fb',
    copy: 'A quiet companion for softer screens and slower evenings.',
  },
  {
    name: 'Love',
    mood: 'Warm & tender',
    color: '#efb4ad',
    accent: '#ffe4df',
    copy: 'A gentle reminder that the best moments are always shared.',
  },
  {
    name: 'Birthday',
    mood: 'Party mode',
    color: '#efad69',
    accent: '#ffe1ba',
    copy: 'A celebration-ready MiYo for making an entrance.',
  },
  {
    name: 'Holiday',
    mood: 'Festive & fun',
    color: '#a8c6ae',
    accent: '#e1efe0',
    copy: 'A little seasonal joy to keep close all year long.',
  },
];

const downloads = [
  { type: 'GIF Animations', title: 'Happy — Welcome Loop', meta: 'GIF · 12.4 MB', color: '#f5ce45' },
  { type: 'Wallpapers', title: 'Sleep — Midnight Glow', meta: 'PNG · 4K · 8.1 MB', color: '#bfc9dc' },
  { type: 'GIF Animations', title: 'Love — Heartbeat', meta: 'GIF · 9.8 MB', color: '#efb4ad' },
  { type: 'Firmware Updates', title: 'MiYo OS 2.4.0', meta: 'Firmware · 2.1 MB', color: '#a8c6ae' },
];

function MiyoImage({ className = '', alt = 'MiYo character' }) {
  return <img className={`miyo-image ${className}`} src={MIYO_MAIN} alt={alt} />;
}

function Nav({ active, setActive }) {
  const [open, setOpen] = useState(false);
  const links = ['Home', 'Characters', 'Downloads', 'Support'];

  return (
    <header className="site-header">
      <a className="brand" href="#home" onClick={() => setActive('Home')}>
        <span className="brand-mark">m</span>
        <span>MiYo <em>Studio</em></span>
      </a>
      <nav className={open ? 'nav-links nav-links--open' : 'nav-links'}>
        {links.map((link) => (
          <a
            key={link}
            className={active === link ? 'nav-link nav-link--active' : 'nav-link'}
            href={`#${link.toLowerCase()}`}
            onClick={() => {
              setActive(link);
              setOpen(false);
            }}
          >
            {link}
          </a>
        ))}
      </nav>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle menu">
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      <a className="header-download" href="#downloads" onClick={() => setActive('Downloads')}>
        Get MiYo <ArrowUpRight size={15} />
      </a>
    </header>
  );
}

function Home({ setActive }) {
  return (
    <main id="home">
      <section className="hero page-wrap">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" />Digital character badges</p>
          <h1>Make room<br />for <span>joy.</span></h1>
          <p className="hero-text">Meet MiYo, a tiny digital companion designed to bring character, color, and a little more feeling to every screen.</p>
          <div className="hero-actions">
            <a className="button button--dark" href="#downloads" onClick={() => setActive('Downloads')}>
              Download animations <ArrowDown size={16} />
            </a>
            <a className="text-link" href="#characters" onClick={() => setActive('Characters')}>
              Explore characters <ChevronRight size={17} />
            </a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-halo hero-halo--one" />
          <div className="hero-halo hero-halo--two" />
          <span className="visual-label visual-label--top">Original character / 01</span>
          <MiyoImage className="hero-miyo" alt="MiYo official character" />
          <span className="visual-label visual-label--bottom">A tiny friend for<br />the everyday.</span>
          <Sparkles className="visual-sparkle" size={20} strokeWidth={1.4} />
        </div>
      </section>

      <section className="intro-strip page-wrap">
        <p>Designed to feel<br /><strong>like a friend.</strong></p>
        <div className="strip-line" />
        <span className="strip-note">Scroll to discover <ArrowDown size={14} /></span>
      </section>

      <section className="feature-band page-wrap">
        <div>
          <p className="section-kicker">01 — The MiYo world</p>
          <h2>Small character.<br />Big <i>feeling.</i></h2>
        </div>
        <p className="feature-description">MiYo was created to make technology feel a little more human. Collect expressive moments, set your mood, and carry a little joy along with you.</p>
      </section>
    </main>
  );
}

function Characters() {
  return (
    <main id="characters" className="page-wrap page-section">
      <div className="section-heading">
        <div>
          <p className="section-kicker">02 — Meet the collection</p>
          <h2>Find your <i>MiYo.</i></h2>
        </div>
        <p>Five ways to show how<br />today feels.</p>
      </div>
      <div className="character-grid">
        {characters.map((character, index) => (
          <article
            className={`character-card ${index === 0 ? 'character-card--featured' : ''}`}
            key={character.name}
            style={{ '--tile-color': character.color, '--tile-accent': character.accent }}
          >
            <div className="card-art">
              <span className="card-index">0{index + 1}</span>
              <span className="art-orbit" />
              <MiyoImage className="card-miyo" alt={`${character.name} MiYo official character`} />
              <span className="art-shine">✦</span>
            </div>
            <div className="card-content">
              <div>
                <p className="card-mood">{character.mood}</p>
                <h3>{character.name}</h3>
              </div>
              <p>{character.copy}</p>
              <button className="icon-button" aria-label={`Explore ${character.name}`}><ArrowUpRight size={17} /></button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

function Downloads() {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'GIF Animations', 'Wallpapers', 'Firmware Updates'];
  const shown = filter === 'All' ? downloads : downloads.filter((item) => item.type === filter);

  return (
    <main id="downloads" className="page-wrap page-section downloads-section">
      <div className="section-heading">
        <div>
          <p className="section-kicker">03 — The download room</p>
          <h2>Bring MiYo<br /><i>to life.</i></h2>
        </div>
        <p>Official animation packs,<br />wallpapers, and updates.</p>
      </div>
      <div className="filter-row" aria-label="Download filters">
        {filters.map((item) => (
          <button key={item} className={filter === item ? 'filter-button filter-button--active' : 'filter-button'} onClick={() => setFilter(item)}>
            {item}
          </button>
        ))}
      </div>
      <div className="download-list">
        {shown.map((item) => (
          <article className="download-row" key={item.title}>
            <div className="download-preview" style={{ '--preview-color': item.color }}>
              <MiyoImage className="download-miyo" alt="MiYo animation preview" />
            </div>
            <div className="download-info">
              <p className="card-mood">{item.type}</p>
              <h3>{item.title}</h3>
            </div>
            <span className="download-meta">{item.meta}</span>
            <button className="download-button" aria-label={`Download ${item.title}`}><Download size={17} /></button>
          </article>
        ))}
      </div>
    </main>
  );
}

function Support() {
  const [open, setOpen] = useState(0);
  const faqs = [
    ['How do I install a MiYo animation?', 'Download the file, then follow the setup guide for your device. Your MiYo will be ready in a few minutes.'],
    ['Which devices are supported?', 'MiYo is designed for our digital character badge display and works with macOS, Windows, and mobile setup tools.'],
    ['Can I suggest a new character?', 'Absolutely. Send us a note with your idea and we may bring it to life in a future collection.'],
  ];

  return (
    <main id="support" className="page-wrap page-section support-section">
      <div className="section-heading">
        <div>
          <p className="section-kicker">04 — We are here</p>
          <h2>Made simple.<br /><i>Made together.</i></h2>
        </div>
        <p>Everything you need to<br />make MiYo yours.</p>
      </div>
      <div className="support-grid">
        <a className="support-card support-card--dark" href="#downloads">
          <div>
            <span className="support-icon"><Play size={15} fill="currentColor" /></span>
            <h3>Setup guide</h3>
            <p>Get your MiYo moving in three simple steps.</p>
          </div>
          <ArrowUpRight size={20} />
        </a>
        <div className="faq-panel">
          <p className="card-mood">Frequently asked</p>
          {faqs.map(([question, answer], index) => (
            <div className="faq-item" key={question}>
              <button onClick={() => setOpen(open === index ? -1 : index)}>
                <span>{question}</span>
                <ChevronDown className={open === index ? 'chevron chevron--open' : 'chevron'} size={18} />
              </button>
              {open === index && <p>{answer}</p>}
            </div>
          ))}
        </div>
        <a className="contact-row" href="mailto:hello@miyostudio.com">
          <div>
            <p className="card-mood">Still curious?</p>
            <h3>Say hello <span>→</span></h3>
          </div>
          <Heart size={22} />
        </a>
      </div>
    </main>
  );
}

function App() {
  const [active, setActive] = useState('Home');

  return (
    <>
      <Nav active={active} setActive={setActive} />
      <Home setActive={setActive} />
      <Characters />
      <Downloads />
      <Support />
      <footer className="site-footer page-wrap">
        <a className="brand" href="#home"><span className="brand-mark">m</span><span>MiYo <em>Studio</em></span></a>
        <p>Digital characters for real moments.</p>
        <span>© 2026 MiYo Studio</span>
      </footer>
    </>
  );
}

export default App;
