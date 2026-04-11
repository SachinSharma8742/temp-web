import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShieldCheck, Map, Diamond } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: ShieldCheck,
    title: 'Absolute Privacy',
    desc: 'Exclusively for you—no group schedules, no shared experiences. Every moment remains entirely personal.'
  },
  {
    icon: Map,
    title: 'Curated Access',
    desc: 'Unlock doors normally closed to the public—private palace dining, village immersions, and exclusive cultural experiences handpicked just for you.'
  },
  {
    icon: Diamond,
    title: 'Uncompromising Luxury',
    desc: 'Only the finest, handpicked accommodations and local experiences—chosen for authentic character and impeccable service.'
  }
];

const WhyChooseUs = () => {
  const sectionRef = useRef(null);
  const carouselRef = useRef(null);
  const rafRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const loopWidthRef = useRef(0);
  const isInteractingRef = useRef(false);
  const cardsLayoutRef = useRef([]); // Stores { center, id, node } to prevent offsetLeft reads in loop
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false
  );

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(
        '.feature-item',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          }
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const syncMobile = (e) => setIsMobile(e.matches);

    if (mq.addEventListener) {
      mq.addEventListener('change', syncMobile);
    } else {
      mq.addListener(syncMobile);
    }

    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', syncMobile);
      } else {
        mq.removeListener(syncMobile);
      }
    };
  }, []);

  useEffect(() => {
    const container = carouselRef.current;
    if (!container || !isMobile) return undefined;
    let virtualScrollLeft = container.scrollLeft;

    const syncLoopWidth = () => {
      if (!container) return;
      const cards = container.querySelectorAll('.feature-card');
      if (cards.length >= 4) {
        // PRECISE MEASUREMENT: The distance between the 1st card of set 1 and the 1st card of set 2
        // This is mathematically perfect because it includes exactly 3 cards and 3 gaps.
        loopWidthRef.current = cards[3].offsetLeft - cards[0].offsetLeft;
      } else {
        loopWidthRef.current = container.scrollWidth / 3;
      }
      measureLayout();
      virtualScrollLeft = container.scrollLeft;
    };

    const measureLayout = () => {
      const cards = container.querySelectorAll('.feature-card');
      cardsLayoutRef.current = Array.from(cards).map((node) => ({
        center: node.offsetLeft + node.offsetWidth / 2,
        node: node,
      }));
    };

    const updateCenterFocus = (currentScroll, time = 0) => {
      const layout = cardsLayoutRef.current;
      if (!layout.length) return;

      const centerX = currentScroll + container.clientWidth / 2;
      const focusRange = container.clientWidth * 0.6;

      layout.forEach((data) => {
        const { center, node } = data;
        const distance = Math.abs(center - centerX);
        const focus = Math.max(0, 1 - distance / focusRange);
        
        const scale = 1 + focus * 0.12;
        const lift = focus * (4 + Math.sin(time * 0.01) * 2);
        const shadowStrength = 0.08 + focus * 0.2;

        // Optimized direct style manipulation using cached nodes and translate3d
        node.style.transform = `translate3d(0, ${-lift}px, 0) scale(${scale})`;
        node.style.zIndex = String(5 + Math.round(focus * 10));
        node.style.boxShadow = `0 14px 34px color-mix(in srgb, var(--color-black) ${Math.round(
          shadowStrength * 100
        )}%, transparent)`;
      });
    };

    const pauseAutoScroll = () => {
      isInteractingRef.current = true;
      virtualScrollLeft = container.scrollLeft;
      if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = window.setTimeout(() => {
        isInteractingRef.current = false;
      }, 1800);
    };

    const handleScroll = () => {
      const loopWidth = loopWidthRef.current;

      const buffer = 2; // Pixel buffer to prevent oscillation
      if (loopWidth > 0 && container.scrollLeft < loopWidth - buffer) {
        container.scrollLeft += loopWidth;
      }

      if (loopWidth > 0 && container.scrollLeft >= loopWidth * 2 - buffer) {
        container.scrollLeft -= loopWidth;
      }

      virtualScrollLeft = container.scrollLeft;
      // updateCenterFocus is now centralized in the step() RAF loop to prevent double-firing and shaking
    };

    const step = (time = 0) => {
      const loopWidth = loopWidthRef.current || container.scrollWidth / 3;
      if (!isInteractingRef.current && loopWidth > 0) {
        // Smooth, slower drift with gentle pulse for a subtle bounce-like rhythm.
        const drift = 0.36;
        const pulse = 1 + Math.sin(time * 0.004) * 0.18;
        virtualScrollLeft += drift * pulse;

        const buffer = 2;
        if (virtualScrollLeft >= loopWidth * 2 - buffer) {
          virtualScrollLeft -= loopWidth;
        }

        if (virtualScrollLeft < loopWidth - buffer) {
          virtualScrollLeft += loopWidth;
        }

        container.scrollLeft = virtualScrollLeft;
      }

      updateCenterFocus(container.scrollLeft, time);

      rafRef.current = window.requestAnimationFrame(step);
    };

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            syncLoopWidth();
          })
        : null;

    const events = [
      ['pointerdown', pauseAutoScroll],
      ['pointerup', pauseAutoScroll],
      ['touchstart', pauseAutoScroll],
      ['touchmove', pauseAutoScroll],
      ['touchend', pauseAutoScroll],
      ['wheel', pauseAutoScroll],
    ];

    events.forEach(([eventName, handler]) => {
      container.addEventListener(eventName, handler, { passive: true });
    });
    container.addEventListener('scroll', handleScroll, { passive: true });
    resizeObserver?.observe(container);

    // Start from the middle set so interaction can resume without jumping back to the start.
    syncLoopWidth();
    container.scrollLeft = loopWidthRef.current;
    virtualScrollLeft = loopWidthRef.current;
    measureLayout(); 
    updateCenterFocus(container.scrollLeft, 0);
    rafRef.current = window.requestAnimationFrame(step);

    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);

      events.forEach(([eventName, handler]) => {
        container.removeEventListener(eventName, handler);
      });
      container.removeEventListener('scroll', handleScroll);
      resizeObserver?.disconnect();

      const cards = container.querySelectorAll('.feature-card');
      cards.forEach((card) => {
        card.style.transform = '';
        card.style.zIndex = '';
        card.style.boxShadow = '';
      });
    };
  }, [isMobile]);

  const visibleFeatures = isMobile ? [...features, ...features, ...features] : features;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-visible py-section transition-colors duration-400"
      style={{
        color: 'var(--text-body)',
        background:
          'linear-gradient(180deg, var(--fog-blend, var(--bg-surface)) 0%, color-mix(in srgb, var(--bg-surface) 85%, var(--bg-base)) 100%)',
      }}
    >
      <div className="max-w-[1320px] mx-auto px-0 md:px-[clamp(20px,3.2vw,44px)]">
        <div className="text-center mb-9 md:mb-12 feature-item px-4 md:px-[clamp(20px,4.5vw,88px)]">
          <h2 className="font-heading text-[clamp(1.8rem,2.4vw,2.6rem)] mb-4 md:mb-5" style={{ color: 'var(--text-heading)' }}>The Art of Travel</h2>
          <div className="w-12 h-px bg-gold mx-auto mb-4 md:mb-6" />
          <p className="font-body font-normal tracking-wide max-w-[clamp(560px,66vw,820px)] mx-auto text-[clamp(1rem,0.9vw,1.2rem)] leading-[1.55]" style={{ color: 'color-mix(in srgb, var(--text-body) 72%, transparent)' }}>
            We don't sell packages. We design experiences. For those who seek the extraordinary, we craft journeys that are as unique as you are.
          </p>
        </div>

        <div ref={carouselRef} className="flex gap-6 md:gap-0 overflow-x-auto pt-8 pb-10 md:pt-6 md:pb-8 no-scrollbar md:grid md:grid-cols-3 md:[column-gap:clamp(14px,1.8vw,24px)] md:[row-gap:clamp(14px,1.8vw,24px)] md:overflow-visible">
          {visibleFeatures.map((feature, idx) => (
            <div
              key={`${feature.title}-${idx}`}
              className={`feature-item feature-card my-3 md:my-0 w-[clamp(230px,74vw,320px)] max-w-none shrink-0 snap-center rounded-2xl border p-[clamp(18px,2vw,26px)] min-h-[clamp(220px,42vw,320px)] flex flex-col items-center justify-center text-center group will-change-transform md:w-auto md:min-h-[clamp(240px,20vw,300px)] ${
                isMobile 
                  ? '' // Transition MUST be disabled on mobile to prevent conflict with high-freq RAF loop
                  : 'transition-all duration-300' 
              }`}
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'color-mix(in srgb, var(--bg-surface) 95%, transparent)',
                boxShadow: '0 14px 34px color-mix(in srgb, var(--color-black) 10%, transparent)',
                backdropFilter: 'blur(6px)',
              }}
            >
              <div className="w-12 h-12 md:w-[clamp(50px,3.2vw,60px)] md:h-[clamp(50px,3.2vw,60px)] rounded-full border flex items-center justify-center mb-5 md:mb-6 group-hover:border-gold/50 transition-colors duration-500" style={{ borderColor: 'var(--border-subtle)' }}>
                <feature.icon strokeWidth={1} size={28} className="text-primary group-hover:text-gold transition-colors duration-500" />
              </div>
              <h3 className="font-heading text-[clamp(1.35rem,1.35vw,1.7rem)] mb-3 md:mb-4 tracking-wide" style={{ color: 'var(--text-heading)' }}>{feature.title}</h3>
              <p className="font-body font-normal text-[clamp(0.95rem,0.86vw,1.08rem)] leading-relaxed max-w-[40ch]" style={{ color: 'color-mix(in srgb, var(--text-body) 66%, transparent)' }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--bg-surface) 82%, var(--bg-base)) 100%)',
        }}
      />
    </section>
  );
};

export default WhyChooseUs;
