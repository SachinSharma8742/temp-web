import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShieldCheck, Map, Diamond } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: ShieldCheck,
    title: 'Absolute Privacy',
    desc: 'From secluded estates to private charters, your journey remains entirely yours.'
  },
  {
    icon: Map,
    title: 'Curated Access',
    desc: 'Unlock doors normally closed to the public—private palace dining to exclusive gallery previews.'
  },
  {
    icon: Diamond,
    title: 'Uncompromising Luxury',
    desc: 'Only the finest accommodations, handpicked for design, service, and profound character.'
  }
];

const WhyChooseUs = () => {
  const sectionRef = useRef(null);
  const carouselRef = useRef(null);
  const rafRef = useRef(null);
  const resumeTimerRef = useRef(null);
  const loopWidthRef = useRef(0);
  const isInteractingRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

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

    setIsMobile(mq.matches);
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
      loopWidthRef.current = container.scrollWidth / 3;
      virtualScrollLeft = container.scrollLeft;
    };

    const updateCenterFocus = (time = 0) => {
      const cards = container.querySelectorAll('.feature-card');
      const centerX = container.scrollLeft + container.clientWidth / 2;
      const focusRange = container.clientWidth * 0.6;

      cards.forEach((card) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - centerX);
        const focus = Math.max(0, 1 - distance / focusRange);
        const scale = 1 + focus * 0.12;
        const lift = focus * (4 + Math.sin(time * 0.01) * 2);
        const shadowStrength = 0.08 + focus * 0.2;

        card.style.transform = `translateY(${-lift}px) scale(${scale})`;
        card.style.zIndex = String(5 + Math.round(focus * 10));
        card.style.boxShadow = `0 14px 34px color-mix(in srgb, var(--color-black) ${Math.round(
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

      if (loopWidth > 0 && container.scrollLeft < loopWidth) {
        container.scrollLeft += loopWidth;
      }

      if (loopWidth > 0 && container.scrollLeft >= loopWidth * 2) {
        container.scrollLeft -= loopWidth;
      }

      virtualScrollLeft = container.scrollLeft;
      updateCenterFocus(performance.now());
    };

    const step = (time = 0) => {
      const loopWidth = loopWidthRef.current || container.scrollWidth / 3;
      if (!isInteractingRef.current && loopWidth > 0) {
        // Smooth, slower drift with gentle pulse for a subtle bounce-like rhythm.
        const drift = 0.36;
        const pulse = 1 + Math.sin(time * 0.004) * 0.18;
        virtualScrollLeft += drift * pulse;

        if (virtualScrollLeft >= loopWidth * 2) {
          virtualScrollLeft -= loopWidth;
        }

        if (virtualScrollLeft < loopWidth) {
          virtualScrollLeft += loopWidth;
        }

        container.scrollLeft = virtualScrollLeft;
      }

      updateCenterFocus(time);

      rafRef.current = window.requestAnimationFrame(step);
    };

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            syncLoopWidth();
            updateCenterFocus(performance.now());
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
    updateCenterFocus(0);
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
    <section ref={sectionRef} className="overflow-visible py-section transition-colors duration-400" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-body)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-9 md:mb-14 feature-item px-9 md:px-16 lg:px-24">
          <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl mb-4 md:mb-5" style={{ color: 'var(--text-heading)' }}>The Art of Travel</h2>
          <div className="w-12 h-px bg-gold mx-auto mb-4 md:mb-6" />
          <p className="font-body font-light tracking-wide max-w-2xl mx-auto" style={{ color: 'color-mix(in srgb, var(--text-body) 72%, transparent)' }}>
            We don't sell packages. We design experiences. For those who seek the extraordinary, we craft journeys that are as unique as you are.
          </p>
        </div>

        <div ref={carouselRef} className="flex gap-10 md:gap-6 lg:gap-8 overflow-x-auto pt-8 pb-10 md:pt-7 md:pb-9 no-scrollbar md:snap-x md:snap-mandatory">
          {visibleFeatures.map((feature, idx) => (
            <div key={`${feature.title}-${idx}`} className="feature-item feature-card my-3 md:my-2 w-[72vw] max-w-[250px] shrink-0 snap-center rounded-2xl border p-5 min-h-[230px] flex flex-col items-center text-center group transition-transform duration-300 will-change-transform md:w-[34vw] md:max-w-[330px] md:min-h-[250px] lg:w-[26vw]" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'color-mix(in srgb, var(--bg-base) 90%, transparent)' }}>
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border flex items-center justify-center mb-5 md:mb-7 group-hover:border-gold/50 transition-colors duration-500" style={{ borderColor: 'var(--border-subtle)' }}>
                <feature.icon strokeWidth={1} size={28} className="text-primary group-hover:text-gold transition-colors duration-500" />
              </div>
              <h3 className="font-heading text-base md:text-lg mb-3 md:mb-4 tracking-wide" style={{ color: 'var(--text-heading)' }}>{feature.title}</h3>
              <p className="font-body font-light text-sm leading-relaxed" style={{ color: 'color-mix(in srgb, var(--text-body) 66%, transparent)' }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
