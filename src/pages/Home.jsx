import AnimationLibrarySection from '../components/AnimationLibrarySection';
import CharacterEcosystem from '../components/CharacterEcosystem';
import DownloadCenterSection from '../components/DownloadCenterSection';
import ExpressionSection from '../components/ExpressionSection';
import HeroSection from '../components/HeroSection';
import HowItWorks from '../components/HowItWorks';
import LifestyleSection from '../components/LifestyleSection';
import NewContentSection from '../components/NewContentSection';
import Support from './Support';

export default function Home({ onNavigate }) {
  return <><HeroSection onNavigate={onNavigate} /><ExpressionSection /><CharacterEcosystem /><LifestyleSection /><AnimationLibrarySection /><DownloadCenterSection /><NewContentSection /><HowItWorks /><Support /></>;
}
