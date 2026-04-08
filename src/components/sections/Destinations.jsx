import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { DESTINATIONS } from '../../data/destinations';

const PATH_VIEWBOX_HEIGHT = 120;

function buildPathD(width, height = PATH_VIEWBOX_HEIGHT) {
  const sx = width / 1200;
  const sy = height / 120;
  return [
    `M 0 ${76 * sy}`,
    `C ${120 * sx} ${50 * sy}, ${220 * sx} ${36 * sy}, ${320 * sx} ${44 * sy}`,
    `S ${520 * sx} ${100 * sy}, ${640 * sx} ${78 * sy}`,
    `S ${840 * sx} ${22 * sy}, ${960 * sx} ${44 * sy}`,
    `S ${1100 * sx} ${90 * sy}, ${1200 * sx} ${70 * sy}`,
  ].join(' ');
}

const Destinations = () => {
  const destinationClipId = `destination-card-${useId().replace(/:/g, '')}`;
  const destinationClipPath = `url(#${destinationClipId})`;
  const trackRef = useRef(null);
  const pathViewportRef = useRef(null);
  const curvePathRef = useRef(null);
  const pathStopRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [railWidth, setRailWidth] = useState(1200);

  const cardCount = DESTINATIONS.length;
  const pathStops = useMemo(
    () =>
      DESTINATIONS.map((dest, index) => ({
        ...dest,
        index,
      })),
    []
  );

  const pathD = useMemo(() => buildPathD(railWidth, PATH_VIEWBOX_HEIGHT), [railWidth]);

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

  const scrollToCard = useCallback((index) => {
    const container = trackRef.current;
    if (!container) return;

    const cards = container.querySelectorAll('[data-destination-card="true"]');
    const card = cards[index];
    if (!card) return;

    container.scrollTo({ left: card.offsetLeft - 20, behavior: 'smooth' });
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

  const updatePathMarkers = useCallback(() => {
    const container = trackRef.current;
    const pathViewport = pathViewportRef.current;
    const curvePath = curvePathRef.current;
    if (!container || !pathViewport || !curvePath) return;

    const getPathYForContentX = (targetX) => {
      const total = curvePath.getTotalLength();
      let low = 0;
      let high = total;

      for (let i = 0; i < 18; i += 1) {
        const mid = (low + high) / 2;
        const point = curvePath.getPointAtLength(mid);
        if (point.x < targetX) {
          low = mid;
        } else {
          high = mid;
        }
      }

      return curvePath.getPointAtLength((low + high) / 2).y;
    };

    const cards = container.querySelectorAll('[data-destination-card="true"]');
    const viewportCenter = container.scrollLeft + container.clientWidth / 2;

    pathViewport.scrollLeft = container.scrollLeft;

    for (let i = 0; i < cards.length; i += 1) {
      const stop = pathStopRefs.current[i];
      const card = cards[i];
      if (!stop || !card) continue;

      const x = card.offsetLeft + card.clientWidth / 2;
      const y = getPathYForContentX(x);
      const distance = Math.abs(x - viewportCenter);
      const focus = Math.max(0, 1 - distance / 420);

      stop.style.left = `${x.toFixed(2)}px`;
      stop.style.top = `${y.toFixed(2)}px`;
      stop.style.setProperty('--focus', focus.toFixed(3));
      stop.style.setProperty('--dot-scale', activeIndex === i ? '1.55' : '1');
    }
  }, [activeIndex]);

  useEffect(() => {
    syncActiveCard();
    const container = trackRef.current;
    const pathViewport = pathViewportRef.current;
    if (!container) return undefined;

    let rafId = null;
    const onScroll = () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        syncActiveCard();
        updatePathMarkers();
      });
    };

    const onResize = () => {
      syncActiveCard();
      setRailWidth(Math.max(container.scrollWidth, container.clientWidth));
      updatePathMarkers();
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    setRailWidth(Math.max(container.scrollWidth, container.clientWidth));
    updatePathMarkers();

    return () => {
      container.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [syncActiveCard, updatePathMarkers]);

  useEffect(() => {
    updatePathMarkers();
  }, [railWidth, activeIndex, updatePathMarkers]);

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

      <div className="mx-auto w-full max-w-[1320px] px-5 md:px-12 mb-8 md:mb-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="text-gold tracking-[0.22em] text-xs md:text-sm uppercase block mb-4">
              Northern Signatures
            </span>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-primary">
              Discover India through a guided path.
            </h2>
          </div>

          <div className="hidden md:flex items-center gap-2 self-start lg:self-auto">
            <button
              type="button"
              aria-label="Scroll destinations left"
              onClick={() => scrollByCard(-1)}
              className="h-11 w-11 rounded-full border flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/70"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'color-mix(in srgb, var(--bg-surface) 86%, transparent)',
              }}
            >
              <ArrowLeft size={18} />
            </button>

            <button
              type="button"
              aria-label="Scroll destinations right"
              onClick={() => scrollByCard(1)}
              className="h-11 w-11 rounded-full border flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/70"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'color-mix(in srgb, var(--bg-surface) 86%, transparent)',
              }}
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

      </div>

      <div ref={trackRef} className="flex gap-4 md:gap-6 px-5 md:px-12 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pt-4 md:pt-5 pb-6 md:pb-8 w-full">
        {DESTINATIONS.map((dest, index) => (
          <article
            key={dest.name}
            data-destination-card="true"
            className={`group relative mt-1 md:mt-0.5 h-[320px] md:h-[450px] shrink-0 cursor-pointer overflow-hidden snap-center transition-[width,max-width,transform,box-shadow] duration-500 ${
              activeIndex === index
                ? 'w-[82vw] min-w-[82vw] max-w-[340px] md:w-[380px] md:min-w-[380px] md:max-w-[380px]'
                : 'w-[74vw] min-w-[74vw] max-w-[280px] md:w-[320px] md:min-w-[320px] md:max-w-[320px]'
            }`}
            onClick={() => scrollToCard(index)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                scrollToCard(index);
              }
            }}
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

      <div className="w-full mt-0 md:mt-1 overflow-hidden">
        <div ref={pathViewportRef} className="relative h-24 overflow-hidden px-0 py-0 md:h-40 md:py-2">
          <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-[var(--path-dim)] to-transparent opacity-80" />
          <div className="pointer-events-none absolute left-0 right-0 top-[56%] h-20 -translate-y-1/2 bg-[radial-gradient(circle_at_center,rgba(79,127,240,0.16)_0%,transparent_55%)] opacity-70 blur-2xl" />

          <div className="relative h-full" style={{ width: `${railWidth}px` }}>
            <svg
              viewBox={`0 0 ${railWidth} ${PATH_VIEWBOX_HEIGHT}`}
              preserveAspectRatio="none"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full"
            >
              <defs>
                <linearGradient id="destination-path-glow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(79, 127, 240, 0.03)" />
                  <stop offset="24%" stopColor="rgba(79, 127, 240, 0.28)" />
                  <stop offset="50%" stopColor="rgba(79, 127, 240, 0.92)" />
                  <stop offset="76%" stopColor="rgba(79, 127, 240, 0.28)" />
                  <stop offset="100%" stopColor="rgba(79, 127, 240, 0.03)" />
                </linearGradient>
                <linearGradient id="destination-path-fade" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(79, 127, 240, 0.14)" />
                  <stop offset="50%" stopColor="rgba(79, 127, 240, 0.92)" />
                  <stop offset="100%" stopColor="rgba(79, 127, 240, 0.14)" />
                </linearGradient>
              </defs>
              <path
                ref={curvePathRef}
                d={pathD}
                fill="none"
                stroke="rgba(79, 127, 240, 0.08)"
                strokeWidth="5"
                strokeLinecap="round"
                className="md:stroke-[8]"
              />
              <path
                d={pathD}
                fill="none"
                stroke="url(#destination-path-glow)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d={pathD}
                fill="none"
                stroke="url(#destination-path-fade)"
                strokeOpacity="0.32"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>

            {pathStops.map((stop, index) => (
              <button
                key={stop.name}
                type="button"
                onClick={() => scrollToCard(index)}
                aria-label={`Go to ${stop.name}`}
                className="absolute focus-visible:outline-none"
                style={{
                  transform: `translate(-50%, -50%) scale(${activeIndex === index ? 1.55 : 1})`,
                  left: '-9999px',
                  top: '0px',
                }}
                ref={(el) => {
                  pathStopRefs.current[index] = el;
                }}
              >
                <span className="relative flex h-7 w-7 items-center justify-center md:h-12 md:w-12">
                  <span
                    className="absolute inset-0 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor:
                        activeIndex === index
                          ? 'color-mix(in srgb, var(--color-gold) 20%, transparent)'
                          : 'transparent',
                      boxShadow:
                        activeIndex === index
                          ? '0 0 0 12px color-mix(in srgb, var(--color-gold) 12%, transparent)'
                          : 'none',
                    }}
                  />
                  <span
                    className="relative z-10 h-2.5 w-2.5 rounded-full transition-all duration-300 md:h-3.5 md:w-3.5"
                    style={{
                      backgroundColor:
                        activeIndex === index
                          ? 'var(--color-gold)'
                          : 'color-mix(in srgb, var(--text-body) 24%, transparent)',
                      transform: activeIndex === index ? 'scale(1.45)' : 'scale(0.9)',
                      boxShadow:
                        activeIndex === index
                          ? '0 0 18px color-mix(in srgb, var(--color-gold) 76%, transparent)'
                          : 'none',
                    }}
                  />
                </span>
              </button>
            ))}
          </div>
        </div>
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
