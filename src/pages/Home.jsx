import { useMemo } from 'react';
import AnimationLibrarySection from '../components/AnimationLibrarySection';
import CharacterEcosystem from '../components/CharacterEcosystem';
import DownloadCenterSection from '../components/DownloadCenterSection';
import ExpressionSection from '../components/ExpressionSection';
import FeaturedVideoSection from '../components/FeaturedVideoSection';
import HeroSection from '../components/HeroSection';
import HowItWorks from '../components/HowItWorks';
import LifestyleSection from '../components/LifestyleSection';
import NewContentSection from '../components/NewContentSection';
import Support from './Support';
import { usePublicSiteConfig } from '../hooks/useSiteConfig';

export default function Home({ onNavigate }) {
  const { sections } = usePublicSiteConfig('home');

  const enabledSections = useMemo(() => {
    const entries = Object.values(sections || {})
      .filter((section) => section.enabled)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return entries;
  }, [sections]);

  const renderSection = (section) => {
    const visibility = section.layout?.visibilityBreakpoints || {};
    let sectionView;
    switch (section.sectionKey) {
      case 'hero':
        sectionView = <HeroSection onNavigate={onNavigate} content={section.content} design={section.design} media={section.media} />;
        break;
      case 'featuredAnimations':
        sectionView = <AnimationLibrarySection content={section.content} design={section.design} layout={section.layout} />;
        break;
      case 'featuredVideo':
        sectionView = <FeaturedVideoSection section={section} />;
        break;
      case 'characters':
        sectionView = <CharacterEcosystem content={section.content} design={section.design} media={section.media} />;
        break;
      case 'howItWorks':
        sectionView = <HowItWorks content={section.content} design={section.design} layout={section.layout} />;
        break;
      case 'downloadCta':
        sectionView = <DownloadCenterSection content={section.content} design={section.design} media={section.media} />;
        break;
      case 'expression':
        sectionView = <ExpressionSection content={section.content} design={section.design} media={section.media} />;
        break;
      case 'lifestyle':
        sectionView = <LifestyleSection content={section.content} design={section.design} media={section.media} />;
        break;
      case 'newContent':
        sectionView = <NewContentSection content={section.content} design={section.design} media={section.media} />;
        break;
      case 'support':
        sectionView = <Support content={section.content} design={section.design} media={section.media} />;
        break;
      default:
        return null;
    }
    return <div key={section.sectionKey} className="cms-section" data-visibility-desktop={visibility.desktop !== false} data-visibility-tablet={visibility.tablet !== false} data-visibility-mobile={visibility.mobile !== false}>{sectionView}</div>;
  };

  return <>{enabledSections.map(renderSection)}</>;
}