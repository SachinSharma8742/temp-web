import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HERO_SLIDES } from '../../data/heroSlides';

gsap.registerPlugin(ScrollTrigger);

const Hero = ({ isReady = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const slidesRef = useRef([]); // Now refers to <img> elements
  const subtextRef = useRef(null);
  const kenBurnsRef = useRef(null); // To store active animation

  // Slide interval timer
  useEffect(() => {
    if (!isReady) return;
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % HERO_SLIDES.length;
      
      gsap.to(subtextRef.current, {
        y: -10,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.in',
        onComplete: () => {
          setCurrentIndex(nextIndex);
          gsap.fromTo(subtextRef.current,
            { y: 10, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.2, ease: 'power2.out' }
          );
        }
      });
    }, 7000);

    return () => clearInterval(interval);
  }, [currentIndex, isReady]);

  // EFFECT 1: Initial Load Animation
  useEffect(() => {
    if (!isReady) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-text',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, stagger: 0.2, ease: 'power3.out', delay: 0.5 }
      );
    }, heroRef);
    return () => ctx.revert();
  }, [isReady]);

  // EFFECT 2: Slide Transitions, Ken Burns & Parallax
  useEffect(() => {
    if (!isReady) return;

    const ctx = gsap.context(() => {
      // 1. Ken Burns Effect (Active Only)
      if (kenBurnsRef.current) kenBurnsRef.current.kill(); 
      
      const activeSlideImage = slidesRef.current[currentIndex];
      if (activeSlideImage) {
        gsap.set(activeSlideImage, { scale: 1 });
        kenBurnsRef.current = gsap.to(activeSlideImage, {
          scale: 1.15,
          duration: 12, 
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true
        });
      }

      // 2. Crossfade images
      slidesRef.current.forEach((el, i) => {
        if (el) {
          gsap.to(el, { 
            opacity: i === currentIndex ? 1 : 0, 
            duration: 2, 
            ease: 'power2.inOut' 
          });
        }
      });

      // 3. Parallax Depth Effect (ScrollTrigger)
      // Background slides move slightly slower than scroll for depth
      gsap.to('.parallax-container', {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });

      // Fade out content slightly as we scroll away
      gsap.to(contentRef.current, {
        opacity: 0,
        y: -100,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom 50%',
          scrub: true
        }
      });

    }, heroRef);

    return () => ctx.revert();
  }, [currentIndex, isReady]);

  return (
    <section 
      ref={heroRef} 
      className="relative w-full h-dvh flex items-center justify-center overflow-hidden z-0"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      {/* Bottom fog blend into next section */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-44 md:h-52 z-10"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, color-mix(in srgb, var(--fog-blend, var(--bg-surface)) 52%, transparent) 56%, var(--fog-blend, var(--bg-surface)) 100%)',
        }}
      />

      {/* Background Slides with Parallax Layer */}
      <div className="absolute inset-0 z-0 parallax-container">
        {HERO_SLIDES.map((slide, index) => (
          <div 
            key={index}
            className="absolute inset-0 overflow-hidden"
          >
            <img 
              ref={el => slidesRef.current[index] = el}
              src={slide.image}
              alt={slide.subtext}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-0 transition-none scale-105"
            />
            <div className={`absolute inset-0 bg-gradient-to-b from-black/38 via-black/14 to-transparent transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`} />
          </div>
        ))}
      </div>

      <div ref={contentRef} className="relative z-20 text-center px-4 max-w-2xl" style={{ color: '#FFFFFF' }}>
        <h1 className="hero-text font-heading text-3xl md:text-5xl lg:text-6xl text-white mb-3 md:mb-4 leading-[1.06] drop-shadow-[0_8px_28px_rgba(0,0,0,0.35)]">
          Tailor-Made Journeys <br className="hidden md:block" /> Across India.
        </h1>
        
        <div className="h-8 md:h-9 mb-5 md:mb-8 flex items-center justify-center">
          <p
            ref={subtextRef}
            className="hero-text font-body text-white/90 text-sm md:text-base tracking-wide font-medium opacity-0 drop-shadow-[0_4px_14px_rgba(0,0,0,0.28)]"
            style={{ mixBlendMode: 'screen' }}
          >
            {HERO_SLIDES[currentIndex].subtext}
          </p>
        </div>
        
        <div className="hero-text flex items-center justify-center gap-4 md:gap-6">
          <button 
            className="group relative min-w-[13rem] px-8 py-3 md:px-10 md:py-3.5 border border-white/70 rounded-full shadow-[0_12px_28px_rgba(0,0,0,0.22)] transition-all duration-500 overflow-hidden backdrop-blur-md hover:border-white"
            style={{ color: '#FFFFFF' }}
          >
            <span className="relative z-10 tracking-[0.18em] uppercase text-xs md:text-[13px] font-semibold">Plan My Trip</span>
            <div className="absolute inset-0 bg-white/12 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-out" />
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/28 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>
        </div>
      </div>

      {/* Minimal Navigation */}
      <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-4 md:gap-6">
        <div className="flex gap-4 items-center">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 transition-all duration-500 rounded-full ${index === currentIndex ? 'w-10 bg-gold' : 'w-2 bg-black/20 dark:bg-white/20 hover:bg-gold/50'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        <div className="w-[1px] h-10 bg-black/10 dark:bg-white/10 relative overflow-hidden">
          <div className="w-full h-1/2 bg-gold absolute top-0 -translate-y-full animate-[scrollDown_2.5s_ease-in-out_infinite]" />
        </div>
      </div>
      
      <style>{`
        @keyframes scrollDown {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
      `}</style>
    </section>
  );
};

export default Hero;
