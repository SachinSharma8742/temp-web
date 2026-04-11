import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import IntroLoader from './components/layout/IntroLoader';
import Hero from './components/sections/Hero';
import WhyChooseUs from './components/sections/WhyChooseUs';
import Destinations from './components/sections/Destinations';
import { HERO_SLIDES } from './data/heroSlides';
import { ThemeProvider } from './ThemeContext';

const INTRO_MIN_DURATION_MS = 2200;
const INTRO_EXIT_DURATION_MS = 700;
const SECTION_ROOT_MARGIN = '320px 0px';

const Experience = lazy(() => import('./components/sections/Experience'));
const JourneyMoodboard = lazy(() => import('./components/sections/JourneyMoodboard'));
const ContactForm = lazy(() => import('./components/sections/ContactForm'));
const TermsAndConditions = lazy(() => import('./components/sections/TermsAndConditions'));
const DestinationDetails = lazy(() => import('./components/pages/DestinationDetails'));

function preloadHeroImages(limit = 2, startIndex = 0) {
  const selectedSlides = HERO_SLIDES.slice(startIndex, startIndex + limit);
  return Promise.all(
    selectedSlides.map(
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

function DeferredSection({ children, minHeight = '70vh', rootMargin = SECTION_ROOT_MARGIN }) {
  const anchorRef = useRef(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (shouldRender) return undefined;

    const node = anchorRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldRender(true);
      },
      { rootMargin, threshold: 0.01 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, shouldRender]);

  if (shouldRender) return children;

  return <div ref={anchorRef} aria-hidden="true" style={{ minHeight }} />;
}

// ─── ScrollToTop Helper ───────────────────────────────────────────────────
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    } else {
      const targetId = hash.slice(1);
      
      // Polling mechanism to wait for the element to appear in DOM 
      // (important for AnimatePresence mode="wait" transitions)
      let attempts = 0;
      const interval = setInterval(() => {
        const element = document.getElementById(targetId);
        attempts++;
        
        if (element) {
          clearInterval(interval);
          const y = element.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
        
        if (attempts > 20) clearInterval(interval); // Stop after 2 seconds
      }, 100);

      return () => clearInterval(interval);
    }
  }, [pathname, hash]);
  return null;
}

// ─── Home Page Component ──────────────────────────────────────────────────
function Home({ heroReady, fogBlend }) {
  return (
    <>
      <Hero isReady={heroReady} />
      <div
        className="relative z-10"
        style={{ backgroundColor: 'var(--bg-surface)', '--fog-blend': fogBlend }}
      >
        <WhyChooseUs />
        <Destinations />
        <DeferredSection minHeight="76vh">
          <Suspense fallback={<div aria-hidden="true" style={{ minHeight: '76vh' }} />}>
            <Experience />
          </Suspense>
        </DeferredSection>
        <DeferredSection minHeight="84vh">
          <Suspense fallback={<div aria-hidden="true" style={{ minHeight: '84vh' }} />}>
            <JourneyMoodboard />
          </Suspense>
        </DeferredSection>
        <DeferredSection minHeight="62vh">
          <Suspense fallback={<div aria-hidden="true" style={{ minHeight: '62vh' }} />}>
            <ContactForm />
          </Suspense>
        </DeferredSection>
      </div>
    </>
  );
}

// ─── App Content ───────────────────────────────────────────────────────────
function AppContent() {
  const location = useLocation();
  const [heroReady, setHeroReady] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [loaderExiting, setLoaderExiting] = useState(false);
  const fogBlend = 'var(--bg-surface)';

  useEffect(() => {
    let isMounted = true;
    let exitTimer;
    let preloadHandle;
    let usingIdleCallback = false;

    Promise.all([
      preloadHeroImages(2, 0),
      new Promise((resolve) => window.setTimeout(resolve, INTRO_MIN_DURATION_MS)),
    ]).then(() => {
      if (!isMounted) return;

      setHeroReady(true);
      setLoaderExiting(true);
      exitTimer = window.setTimeout(() => setShowLoader(false), INTRO_EXIT_DURATION_MS);

      const preloadRemaining = () => {
        preloadHeroImages(HERO_SLIDES.length - 2, 2);
      };

      if ('requestIdleCallback' in window) {
        usingIdleCallback = true;
        preloadHandle = window.requestIdleCallback(preloadRemaining, { timeout: 2200 });
      } else {
        preloadHandle = window.setTimeout(preloadRemaining, 1800);
      }
    });

    return () => {
      isMounted = false;
      if (exitTimer) window.clearTimeout(exitTimer);
      if (preloadHandle && usingIdleCallback && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(preloadHandle);
      } else if (preloadHandle) {
        window.clearTimeout(preloadHandle);
      }
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
      <ScrollToTop />

      <div
        className={`min-h-dvh font-body selection:bg-gold selection:text-black transition-opacity duration-700 ${heroReady ? 'opacity-100' : 'opacity-0'}`}
        style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-body)' }}
      >
        <Header />
        
        <main className="relative" style={{ '--fog-blend': fogBlend }}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route 
                path="/" 
                element={
                  <Motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Home heroReady={heroReady} fogBlend={fogBlend} />
                  </Motion.div>
                } 
              />
              <Route 
                path="/destination/:id" 
                element={
                  <Suspense fallback={<div className="min-h-[70vh]" />}>
                    <Motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <DestinationDetails />
                    </Motion.div>
                  </Suspense>
                } 
              />
              <Route 
                path="/terms" 
                element={
                  <Suspense fallback={<div className="min-h-[60vh]" />}>
                    <Motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                    >
                      <TermsAndConditions />
                    </Motion.div>
                  </Suspense>
                } 
              />
            </Routes>
          </AnimatePresence>
        </main>
        
        <Footer />
      </div>
    </>
  );
}

// ─── Main App Component ────────────────────────────────────────────────────
function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
