import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const destinationData = [
  {
    name: 'Jaipur',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1400&auto=format&fit=crop',
    subtitle: 'Pink City Palaces',
  },
  {
    name: 'Jammu & Kashmir',
    image: 'https://images.unsplash.com/photo-1623625434462-e5e42318ae49?q=80&w=1400&auto=format&fit=crop',
    subtitle: 'Valleys in Silk Light',
  },
  {
    name: 'Udaipur',
    image: 'https://images.unsplash.com/photo-1496372412473-e8548ffd82bc?q=80&w=1400&auto=format&fit=crop',
    subtitle: 'Lakeside Royalty',
  },
  {
    name: 'Jodhpur',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1400&auto=format&fit=crop',
    subtitle: 'Blue City Vistas',
  },
  {
    name: 'Manali',
    image: 'https://images.unsplash.com/photo-1622308644420-b20142dc993c?q=80&w=1400&auto=format&fit=crop',
    subtitle: 'Alpine Escape',
  },
  {
    name: 'Himachal',
    image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=1400&auto=format&fit=crop',
    subtitle: 'Mountain Grandeur',
  },
  {
    name: 'Kerala',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1400&auto=format&fit=crop',
    subtitle: 'Backwater Reverie',
  }
];

const Destinations = () => {
  const destinationClipId = `destination-card-${useId().replace(/:/g, '')}`;
  const destinationClipPath = `url(#${destinationClipId})`;
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const cardCount = destinationData.length;

  const scrollByCard = useCallback((direction) => {
    const container = trackRef.current;
    if (!container) return;

    const firstCard = container.querySelector('[data-destination-card="true"]');
    if (!firstCard) return;

    const styles = window.getComputedStyle(container);
    const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
    const cardStep = firstCard.getBoundingClientRect().width + gap;

    container.scrollBy({
      left: direction * cardStep,
      behavior: 'smooth',
    });
  }, []);

  const syncActiveCard = useCallback(() => {
    const container = trackRef.current;
    if (!container) return;

    const cards = Array.from(container.querySelectorAll('[data-destination-card="true"]'));
    if (!cards.length) return;

    const center = container.scrollLeft + container.clientWidth / 2;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(cardCenter - center);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setActiveIndex(nearestIndex);
  }, []);

  useEffect(() => {
    syncActiveCard();
    const container = trackRef.current;
    if (!container) return undefined;

    let rafId = null;
    const onScroll = () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(syncActiveCard);
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', syncActiveCard);

    return () => {
      container.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', syncActiveCard);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [syncActiveCard]);

  const paginationDots = useMemo(
    () => destinationData.map((_, index) => index),
    []
  );

  return (
    <section
      id="destinations"
      className="relative overflow-hidden scroll-mt-24 pt-24 pb-16 md:scroll-mt-28 md:pt-32 md:pb-24 flex flex-col justify-center transition-colors duration-400"
      style={{
        background: `
          radial-gradient(120% 42% at 50% 0%, color-mix(in srgb, var(--bg-surface) 14%, transparent) 0%, transparent 70%),
          radial-gradient(120% 48% at 50% 100%, color-mix(in srgb, var(--bg-surface) 24%, transparent) 0%, transparent 72%),
          linear-gradient(180deg, color-mix(in srgb, var(--bg-surface) 82%, var(--bg-base)) 0%, var(--bg-base) 22%, var(--bg-base) 68%, var(--bg-surface) 100%)
        `,
        color: 'var(--text-body)',
      }}
    >
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        focusable="false"
        className="absolute pointer-events-none"
      >
        <defs>
          <clipPath id={destinationClipId} clipPathUnits="objectBoundingBox">
            <path d="M 0.0745 0.1111 L 0.9255 0.0089 Q 1 0 1 0.075 L 1 0.805 Q 1 0.88 0.9255 0.8889 L 0.0745 0.9911 Q 0 1 0 0.925 L 0 0.195 Q 0 0.12 0.0745 0.1111 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="px-5 md:px-12 mb-7 md:mb-8 shrink-0 max-w-[1160px] mx-auto w-full flex items-end justify-between gap-4">
        <div>
          <span className="text-gold tracking-[0.22em] text-xs md:text-sm uppercase block mb-4">
            Northern Signatures
          </span>
          <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-primary">Discover India</h2>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            aria-label="Scroll destinations left"
            onClick={() => scrollByCard(-1)}
            className="h-11 w-11 rounded-full border flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/70"
            style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'color-mix(in srgb, var(--bg-surface) 86%, transparent)' }}
          >
            <ArrowLeft size={18} />
          </button>

          <button
            type="button"
            aria-label="Scroll destinations right"
            onClick={() => scrollByCard(1)}
            className="h-11 w-11 rounded-full border flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/70"
            style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'color-mix(in srgb, var(--bg-surface) 86%, transparent)' }}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div ref={trackRef} className="flex gap-4 md:gap-6 px-5 md:px-12 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pt-4 md:pt-5 pb-6 md:pb-8 w-full">
        {destinationData.map((dest, index) => (
          <article
            key={dest.name}
            data-destination-card="true"
            className="group relative mt-1 md:mt-0.5 w-[74vw] max-w-[280px] md:w-[320px] md:max-w-[320px] h-[320px] md:h-[450px] shrink-0 cursor-pointer overflow-hidden snap-center transition-transform duration-500"
            style={{ 
              clipPath: destinationClipPath,
              WebkitClipPath: destinationClipPath,
              backgroundColor: 'var(--bg-surface)',
              transform: activeIndex === index ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
              boxShadow: activeIndex === index
                ? '0 20px 40px color-mix(in srgb, var(--color-black) 26%, transparent)'
                : '0 12px 28px color-mix(in srgb, var(--color-black) 14%, transparent)'
            }}
          >
            <img
              src={dest.image}
              alt={dest.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
            />
            
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/18 to-black/88 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-[35%] bg-gradient-to-b from-black/25 to-transparent pointer-events-none" />
            
            <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-7 pb-10 md:pb-13 z-10 gap-4 md:gap-5">
              <span className="text-gold tracking-[0.24em] uppercase text-xs md:text-sm transform translate-y-4 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100" style={{ opacity: activeIndex === index ? 1 : undefined, transform: activeIndex === index ? 'translateY(0)' : undefined }}>
                {dest.subtitle}
              </span>
              <h3 className="text-white text-xl md:text-2xl font-semibold transform transition-transform duration-500 ease-out group-hover:-translate-y-2" style={{ transform: activeIndex === index ? 'translateY(-4px)' : undefined }}>
                {dest.name}
              </h3>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-1 md:hidden flex items-center justify-center gap-2 px-5">
        {paginationDots.map((dotIndex) => (
          <button
            key={dotIndex}
            type="button"
            aria-label={`Go to destination ${dotIndex + 1}`}
            onClick={() => {
              const container = trackRef.current;
              if (!container) return;
              const cards = container.querySelectorAll('[data-destination-card="true"]');
              const card = cards[dotIndex];
              if (!card) return;
              container.scrollTo({ left: card.offsetLeft - 20, behavior: 'smooth' });
            }}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: activeIndex === dotIndex ? '26px' : '8px',
              backgroundColor: activeIndex === dotIndex ? 'var(--color-gold)' : 'color-mix(in srgb, var(--text-body) 30%, transparent)',
            }}
          />
        ))}
      </div>

      <div className="md:hidden mt-5 flex items-center justify-center gap-2 px-5">
        <button
          type="button"
          aria-label="Previous destination"
          onClick={() => scrollByCard(-1)}
          className="h-10 px-4 rounded-full border text-sm tracking-wide uppercase flex items-center gap-2"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <ArrowLeft size={16} />
          Prev
        </button>

        <button
          type="button"
          aria-label="Next destination"
          onClick={() => scrollByCard(1)}
          className="h-10 px-4 rounded-full border text-sm tracking-wide uppercase flex items-center gap-2"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          Next
          <ArrowRight size={16} />
        </button>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, var(--bg-surface) 100%)',
        }}
      />
    </section>
  );
};

export default Destinations;
