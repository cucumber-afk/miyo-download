import { ArrowRight } from 'lucide-react';

export default function DownloadCenterSection({ content = {}, design = {} }) {
  const { sectionTitle = '', sectionTitleHighlight = '', sectionKicker = '', sectionSubtitle = '', buttonText = 'Browse downloads', buttonLink = '/downloads' } = content;
  const buttonClass = design.buttonStyle === 'outline' ? 'button button--outline' : 'button button--dark';
  return <section className="download-center-section"><div className="page-wrap">
    <div className="section-heading">
      <div>{sectionKicker && <p className="section-kicker">{sectionKicker}</p>}<h2>{sectionTitle}<br />{sectionTitleHighlight && <i>{sectionTitleHighlight}</i>}</h2></div>
      {sectionSubtitle && <p>{sectionSubtitle}</p>}
    </div>
    <div className="download-center-actions"><a className={buttonClass} href={buttonLink || '/downloads'}>{buttonText || 'Browse downloads'} <ArrowRight size={15} /></a></div>
  </div></section>;
}