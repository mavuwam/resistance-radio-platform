import { ReactNode, Suspense } from 'react';
import Header from './Header';
import Footer from './Footer';
import AudioPlayer from './AudioPlayer';

interface PageLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showAudioPlayer?: boolean;
}

const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '60vh',
    fontSize: '1.2rem',
    color: '#666'
  }}>
    Loading...
  </div>
);

export default function PageLayout({ 
  children, 
  showHeader = true, 
  showFooter = true, 
  showAudioPlayer = true 
}: PageLayoutProps) {
  return (
    <>
      {showHeader && <Header />}
      <main id="main-content">
        <Suspense fallback={<LoadingFallback />}>
          {children}
        </Suspense>
      </main>
      {showFooter && <Footer />}
      {showAudioPlayer && <AudioPlayer />}
    </>
  );
}
