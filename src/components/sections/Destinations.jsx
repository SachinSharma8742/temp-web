import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DESTINATIONS } from '../../data/destinations';
import { getDeliveredImageUrl } from '../../utils/mediaDelivery';

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
  const navigate = useNavigate();
  const trackRef = useRef(null);
  const pathViewportRef = useRef(null);
  const curvePathRef = useRef(null);
  const pathStopRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [railWidth, setRailWidth] = useState(1200);
  const [scrollControls, setScrollControls] = useState({
    canScrollPrev: false,
    canScrollNext: DESTINATIONS.length > 1,
  });

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

  const getCardScrollLeft = useCallback((container, card) => {
    if (!container || !card) return 0;
    const centeredLeft = card.offsetLeft - (container.clientWidth - card.clientWidth) / 2;
    const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
    return Math.min(Math.max(0, centeredLeft), maxScrollLeft);
  }, []);

  const getClosestVisibleCardIndex = useCallback(() => {
    const container = trackRef.current;
    if (!container) return -1;

    const cards = container.querySelectorAll('[data-destination-card="true"]');
    if (!cards.length) return -1;

    const viewportCenter = container.scrollLeft + container.clientWidth / 2;
    let closestIndex = 0;
    let smallestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(cardCenter - viewportCenter);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  }, []);

  const updateScrollControls = useCallback(() => {
    const container = trackRef.current;
    if (!container) return;

    const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
    const canScrollPrev = container.scrollLeft > 4;
    const canScrollNext = container.scrollLeft < maxScrollLeft - 4;

    setScrollControls((prev) => {
      if (prev.canScrollPrev === canScrollPrev && prev.canScrollNext === canScrollNext) {
        return prev;
      }
      return { canScrollPrev, canScrollNext };
    });
  }, []);

  const scrollByCard = useCallback((direction) => {
    const container = trackRef.current;
    if (!container) return;

    const cards = container.querySelectorAll('[data-destination-card="true"]');
    if (!cards.length) return;

    const currentIndex = getClosestVisibleCardIndex();
    const baseIndex = currentIndex >= 0 ? currentIndex : activeIndex;
    const nextIndex = Math.max(0, Math.min(cardCount - 1, baseIndex + direction));
    const nextCard = cards[nextIndex];
    if (!nextCard) return;

    setActiveIndex(nextIndex);
    container.scrollTo({ left: getCardScrollLeft(container, nextCard), behavior: 'smooth' });
  }, [activeIndex, cardCount, getCardScrollLeft, getClosestVisibleCardIndex]);

  const scrollToCard = useCallback((index) => {
    const container = trackRef.current;
    if (!container) return;

    const cards = container.querySelectorAll('[data-destination-card="true"]');
    const card = cards[index];
    if (!card) return;

    setActiveIndex(index);
    container.scrollTo({ left: getCardScrollLeft(container, card), behavior: 'smooth' });
  }, [getCardScrollLeft]);

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
    const scaleY = pathViewport.clientHeight / PATH_VIEWBOX_HEIGHT;

    for (let i = 0; i < cards.length; i += 1) {
      const stop = pathStopRefs.current[i];
      const card = cards[i];
      if (!stop || !card) continue;

      const x = card.offsetLeft + card.clientWidth / 2;
      const y = getPathYForContentX(x) * scaleY;

      stop.style.left = `${x.toFixed(2)}px`;
      stop.style.top = `${y.toFixed(2)}px`;
      stop.style.setProperty('--dot-scale', activeIndex === i ? '1.55' : '1');
    }
  }, [activeIndex]);

  useEffect(() => {
    const container = trackRef.current;
    const pathViewport = pathViewportRef.current;
    if (!container) return undefined;

    const cards = Array.from(container.querySelectorAll('[data-destination-card="true"]'));
    if (!cards.length) return undefined;

    let rafId = null;
    const onScroll = () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        if (pathViewport) pathViewport.scrollLeft = container.scrollLeft;
        updateScrollControls();
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        let bestIndex = -1;
        let bestRatio = 0;

        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.intersectionRatio <= bestRatio) return;

          const rawIndex = Number(entry.target.getAttribute('data-card-index'));
          if (Number.isNaN(rawIndex)) return;

          bestRatio = entry.intersectionRatio;
          bestIndex = rawIndex;
        });

        if (bestIndex >= 0) {
          setActiveIndex((prev) => (prev === bestIndex ? prev : bestIndex));
        }
      },
      {
        root: container,
        threshold: [0.5, 0.65, 0.8],
      }
    );

    cards.forEach((card, index) => {
      card.setAttribute('data-card-index', String(index));
      observer.observe(card);
    });

    const onResize = () => {
      setRailWidth(Math.max(container.scrollWidth, container.clientWidth));
      updatePathMarkers();
      if (pathViewport) pathViewport.scrollLeft = container.scrollLeft;
      updateScrollControls();
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    setRailWidth(Math.max(container.scrollWidth, container.clientWidth));
    updatePathMarkers();
    updateScrollControls();
    onScroll();

    return () => {
      container.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      observer.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [updatePathMarkers, updateScrollControls]);

  useEffect(() => {
    updatePathMarkers();
  }, [railWidth, activeIndex, updatePathMarkers]);

  return (
    <section
      id="destinations"
      className="relative scroll-mt-24 pt-24 pb-16 md:scroll-mt-28 md:pt-32 md:pb-24 flex flex-col justify-center transition-colors duration-400"
      style={{
        background: `
          radial-gradient(120% 42% at 50% 0%, color-mix(in srgb, var(--bg-surface) 14%, transparent) 0%, transparent 70%),
          radial-gradient(120% 48% at 50% 100%, color-mix(in srgb, var(--bg-surface) 24%, transparent) 0%, transparent 72%),
          linear-gradient(180deg, color-mix(in srgb, var(--bg-surface) 82%, var(--bg-base)) 0%, var(--bg-base) 22%, var(--bg-base) 68%, var(--bg-surface) 100%)
        `,
        color: 'var(--text-body)',
      }}
    >
      <style>{`
        .photo-stack-card {
          position: relative;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .photo-stack-card:hover {
          transform: translateY(-12px) scale(1.02);
        }
        
        .card-bg {
          position: absolute;
          inset: 0;
          border-radius: 2rem;
          transform: skewY(-6deg);
          z-index: 0;
          transition: background-color 0.4s, box-shadow 0.4s;
          background-color: var(--bg-surface);
          box-shadow: 0 12px 28px color-mix(in srgb, var(--color-black) 10%, transparent);
        }
        .photo-stack-card:hover .card-bg {
          box-shadow: 0 20px 40px color-mix(in srgb, var(--color-black) 26%, transparent);
        }

        .stack-img {
          transition: transform 0.4s cubic-bezier(0.2, 1, 0.3, 1), box-shadow 0.3s ease;
          transform-origin: bottom center;
          width: 94%; 
          left: 3%; 
          border-radius: 1.25rem;
        }
        .stack-img:nth-child(1) { transform: rotate(-3deg); z-index: 1; }
        .stack-img:nth-child(2) { transform: rotate(0deg); z-index: 2; }
        .stack-img:nth-child(3) { transform: rotate(3deg); z-index: 3; }

        .photo-stack-card:hover .stack-img:nth-child(1) {
          transform: translateY(-20px) rotate(-8deg) translateX(-10px);
          box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.15);
        }
        .photo-stack-card:hover .stack-img:nth-child(2) {
          transform: translateY(-40px) rotate(0deg) scale(1.02);
          box-shadow: 0px 15px 30px rgba(0, 0, 0, 0.2);
          transition-delay: 0.03s;
        }
        .photo-stack-card:hover .stack-img:nth-child(3) {
          transform: translateY(-20px) rotate(8deg) translateX(10px);
          box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.15);
          transition-delay: 0.06s;
        }

        @media (max-width: 767px) {
          .photo-stack-card.active {
            transform: translateY(-12px) scale(1.02);
          }
          .photo-stack-card.active .card-bg {
            box-shadow: 0 20px 40px color-mix(in srgb, var(--color-black) 26%, transparent);
          }
          .photo-stack-card.active .stack-img:nth-child(1) {
            transform: translateY(-20px) rotate(-8deg) translateX(-10px);
            box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.15);
          }
          .photo-stack-card.active .stack-img:nth-child(2) {
            transform: translateY(-40px) rotate(0deg) scale(1.02);
            box-shadow: 0px 15px 30px rgba(0, 0, 0, 0.2);
            transition-delay: 0.03s;
          }
          .photo-stack-card.active .stack-img:nth-child(3) {
            transform: translateY(-20px) rotate(8deg) translateX(10px);
            box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.15);
            transition-delay: 0.06s;
          }
        }
      `}</style>

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
              disabled={!scrollControls.canScrollPrev}
              className="h-11 w-11 rounded-full border flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/70 disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:border-[var(--border-subtle)]"
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
              disabled={!scrollControls.canScrollNext}
              className="h-11 w-11 rounded-full border flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/70 disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:border-[var(--border-subtle)]"
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

      <div ref={trackRef} className="flex gap-4 md:gap-6 px-5 md:px-12 overflow-x-auto snap-x snap-mandatory scroll-smooth [scroll-padding-inline:1.25rem] md:[scroll-padding-inline:3rem] [overscroll-behavior-x:contain] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pt-16 md:pt-20 pb-20 md:pb-28 w-full">
        {DESTINATIONS.map((dest, index) => (
          <article
            key={dest.name}
            data-destination-card="true"
            className={`photo-stack-card group relative mt-1 md:mt-0.5 h-[360px] md:h-[450px] w-[74vw] min-w-[74vw] max-w-[280px] md:w-[320px] md:min-w-[320px] md:max-w-[320px] shrink-0 cursor-pointer flex flex-col p-4 md:p-5 snap-center outline-none ${activeIndex === index ? 'active' : ''}`}
            onClick={() => {
              navigate(`/destination/${dest.name.replace(/\s+/g, '-').toLowerCase()}`);
              // Fallback scroll to ensure the card is centered if they don't navigate
              scrollToCard(index);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                navigate(`/destination/${dest.name.replace(/\s+/g, '-').toLowerCase()}`);
              }
            }}
            style={{}}
          >
            <div className="card-bg" />

            {/* Premium Top-Right Navigation Indicator */}
            <div className={`
              absolute top-5 right-5 z-20 flex items-center justify-center 
              w-10 h-10 rounded-full bg-[var(--bg-base)] text-[var(--text-body)] shadow-sm border border-[var(--border-subtle)]
              transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
              opacity-0 scale-75 -translate-y-2
              md:group-hover:opacity-100 md:group-hover:scale-100 md:group-hover:translate-y-0 md:group-hover:bg-[var(--text-body)] md:group-hover:text-[var(--bg-base)] md:group-hover:border-transparent
              ${activeIndex === index ? 'max-md:opacity-100 max-md:scale-100 max-md:translate-y-0 max-md:bg-[var(--text-body)] max-md:text-[var(--bg-base)] max-md:border-transparent max-md:shadow-xl shadow-black/10' : ''}
            `}>
              <ArrowUpRight size={18} className="transition-transform duration-500 group-hover:scale-110" />
            </div>
            
            <div className="z-10 mt-6 px-3 flex flex-col justify-between items-start gap-3">
              <div>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-gold">
                  {dest.subtitle}
                </p>
                <h2 className="mt-1 text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-primary">
                  {dest.name}
                </h2>
              </div>
            </div>

            <div className="z-10 relative mt-auto h-[55%] md:h-[60%] w-full mb-2 md:mb-5">
              {(dest.images || []).slice(0, 3).map((imgUrl, imgIndex) => (
                <img 
                  key={`${dest.name}-${imgIndex}`}
                  src={getDeliveredImageUrl(imgUrl, { width: 960, quality: 72, format: 'webp' })} 
                  alt={`${dest.name} ${imgIndex + 1}`} 
                  loading="lazy" 
                  decoding="async" 
                  onError={(event) => {
                    const target = event.currentTarget;
                    if (target.dataset.fallbackApplied === '1') return;
                    target.dataset.fallbackApplied = '1';
                    target.src = imgUrl;
                  }}
                  className="stack-img absolute bottom-0 h-full border-[3px] md:border-[4px] object-cover" 
                  style={{ borderColor: 'var(--bg-base)' }} 
                />
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="w-full mt-0 md:mt-1 overflow-hidden md:hidden">
        <div ref={pathViewportRef} className="relative h-[120px] overflow-hidden px-0 py-0">
          <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-[var(--path-dim)] to-transparent opacity-80" />
          <div className="pointer-events-none absolute left-0 right-0 top-[56%] h-20 -translate-y-1/2 bg-[radial-gradient(circle_at_center,rgba(79,127,240,0.16)_0%,transparent_55%)] opacity-70 blur-2xl" />

          <div className="relative h-full" style={{ width: `${railWidth}px` }}>
            <svg
              viewBox={`0 0 ${railWidth} ${PATH_VIEWBOX_HEIGHT}`}
              preserveAspectRatio="none"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full drop-shadow-sm"
            >
              <defs>
                <linearGradient id="destination-path-glow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(79, 127, 240, 0.03)" />
                  <stop offset="30%" stopColor="rgba(79, 127, 240, 0.4)" />
                  <stop offset="50%" stopColor="rgba(79, 127, 240, 1)" />
                  <stop offset="70%" stopColor="rgba(79, 127, 240, 0.4)" />
                  <stop offset="100%" stopColor="rgba(79, 127, 240, 0.03)" />
                </linearGradient>
              </defs>

              {/* Road Base */}
              <path
                ref={curvePathRef}
                d={pathD}
                fill="none"
                stroke="#0f0f0f"
                strokeWidth="10"
                strokeLinecap="round"
                className="opacity-90 md:stroke-[12]"
              />
              {/* Dashed Center Route */}
              <path
                d={pathD}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeDasharray="6 8"
                strokeLinecap="round"
                className="opacity-[0.85]"
              />
              {/* Subtle Glowing Pulse over dashes */}
              <path
                d={pathD}
                fill="none"
                stroke="url(#destination-path-glow)"
                strokeWidth="2.5"
                strokeDasharray="6 8"
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
          disabled={!scrollControls.canScrollPrev}
          className="h-10 px-4 rounded-full border text-sm tracking-wide uppercase flex items-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <ArrowLeft size={16} />
          Prev
        </button>

        <button
          type="button"
          aria-label="Next destination"
          onClick={() => scrollByCard(1)}
          disabled={!scrollControls.canScrollNext}
          className="h-10 px-4 rounded-full border text-sm tracking-wide uppercase flex items-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed"
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
