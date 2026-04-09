import React, { useEffect, useState } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import IntroLoader from './components/layout/IntroLoader';
import Hero from './components/sections/Hero';
import WhyChooseUs from './components/sections/WhyChooseUs';
import Destinations from './components/sections/Destinations';
import Experience from './components/sections/Experience';
import JourneyMoodboard from './components/sections/JourneyMoodboard';
import ContactForm from './components/sections/ContactForm';
import { HERO_SLIDES } from './data/heroSlides';
import { ThemeProvider } from './ThemeContext';

const INTRO_MIN_DURATION_MS = 2200;
const INTRO_EXIT_DURATION_MS = 700;

function preloadHeroImages() {
  return Promise.all(
    HERO_SLIDES.map(
      ({ image }) =>
        new Promise((resolve) => {
          const img = new Image();
          img.src = image;

          if (img.complete) {
            resolve();
            return;
          }

          img.onload = () => resolve();
          img.onerror = () => resolve();
        })
    )
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
function AppShell() {
  const [heroReady, setHeroReady] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [loaderExiting, setLoaderExiting] = useState(false);
  const fogBlend = 'var(--bg-surface)';

  useEffect(() => {
    let isMounted = true;
    let exitTimer;

    Promise.all([
      preloadHeroImages(),
      new Promise((resolve) => window.setTimeout(resolve, INTRO_MIN_DURATION_MS)),
    ]).then(() => {
      if (!isMounted) return;

      setHeroReady(true);
      setLoaderExiting(true);
      exitTimer = window.setTimeout(() => setShowLoader(false), INTRO_EXIT_DURATION_MS);
    });

    return () => {
      isMounted = false;
      if (exitTimer) window.clearTimeout(exitTimer);
    };
  }, []);

  useEffect(() => {
    if (!showLoader) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showLoader]);

  return (
    <>
      {showLoader && <IntroLoader isExiting={loaderExiting} />}

      <div
        className={`min-h-dvh font-body selection:bg-gold selection:text-black transition-opacity duration-700 ${heroReady ? 'opacity-100' : 'opacity-0'
          }`}
        style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-body)' }}
      >
        <Header />
        <main className="relative" style={{ '--fog-blend': fogBlend }}>
          <Hero isReady={heroReady} />

          <div
            className="relative z-10"
            style={{ backgroundColor: 'var(--bg-surface)', '--fog-blend': fogBlend }}
          >
            <WhyChooseUs />
            <Destinations />
            <Experience />
            <JourneyMoodboard />
            <ContactForm />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}

export default App;
