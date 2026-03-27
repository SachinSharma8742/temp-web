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
      className="fixed top-0 left-0 w-full h-screen flex items-center justify-center overflow-hidden z-0"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
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
            <div className={`absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`} />
          </div>
        ))}
      </div>

      <div ref={contentRef} className="relative z-20 text-center px-4 max-w-2xl">
        <h1 className="hero-text font-heading text-2xl md:text-4xl lg:text-5xl text-primary mb-3 md:mb-4 leading-tight">
          Travel, Tailored <br className="hidden md:block" /> to You.
        </h1>
        
        <div className="h-8 md:h-9 mb-5 md:mb-8 flex items-center justify-center">
          <p ref={subtextRef} className="hero-text font-body text-secondary text-sm md:text-base tracking-wide font-light italic opacity-0">
            {HERO_SLIDES[currentIndex].subtext}
          </p>
        </div>
        
        <div className="hero-text flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
          <button 
            className="group relative px-7 py-2.5 md:px-9 md:py-3 border border-current transition-all duration-500 overflow-hidden w-full sm:w-auto backdrop-blur-sm"
            style={{ color: 'var(--text-primary)' }}
          >
            <span className="relative z-10 tracking-[0.2em] uppercase text-xs font-semibold">Plan My Trip</span>
            <div className="absolute inset-0 bg-current translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out opacity-10" />
            <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out delay-75" />
          </button>
          
          <a href="#destinations" className="group flex items-center gap-3 text-xs tracking-[0.2em] uppercase font-semibold transition-all duration-300" style={{ color: 'var(--text-secondary)' }}>
            <span className="opacity-80 group-hover:opacity-100 group-hover:text-gold transition-all">Explore Destinations</span>
            <span className="text-gold transform group-hover:translate-x-2 transition-transform duration-300">→</span>
          </a>
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
