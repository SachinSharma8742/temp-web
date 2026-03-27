import React, { memo, startTransition, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const memoryShots = [
  {
    title: 'Varanasi',
    region: 'Uttar Pradesh',
    tagline: 'Where eternity meets the Ganges',
    images: [
      'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&q=90&fit=crop'
    ]
  },
  {
    title: 'Jaisalmer',
    region: 'Rajasthan',
    tagline: 'A golden fortress in the desert',
    images: [
      'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&q=90&fit=crop'
    ]
  },
  {
    title: 'Alleppey',
    region: 'Kerala',
    tagline: 'Backwaters and monsoon silence',
    images: [
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?w=1200&q=90&fit=crop'
    ]
  },
  {
    title: 'Ladakh',
    region: 'Kashmir',
    tagline: 'Sky kingdoms above the clouds',
    images: [
      'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1536421469767-80559bb6f5e1?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=1200&q=90&fit=crop'
    ]
  },
  {
    title: 'Hampi',
    region: 'Karnataka',
    tagline: 'Ruins of forgotten empires',
    images: [
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1496372412473-e8548ffd82bc?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1568168361784-22e428b8a9c3?w=1200&q=90&fit=crop'
    ]
  },
  {
    title: 'Udaipur',
    region: 'Rajasthan',
    tagline: 'The city of lakes and longing',
    images: [
      'https://images.unsplash.com/photo-1568168361784-22e428b8a9c3?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1496372412473-e8548ffd82bc?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=90&fit=crop'
    ]
  },
  {
    title: 'Darjeeling',
    region: 'West Bengal',
    tagline: 'Tea gardens veiled in mist',
    images: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1622308644420-b20142dc993c?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1623625434462-e5e42318ae49?w=1200&q=90&fit=crop'
    ]
  }
];

const slots = [
  { left: '0%', top: '0%', width: '55%', height: '62%', opacity: 1, zIndex: 20, size: 'hero' },
  { left: '56%', top: '0%', width: '44%', height: '30%', opacity: 0.9, zIndex: 10, size: 'medium' },
  { left: '56%', top: '32%', width: '44%', height: '30%', opacity: 0.9, zIndex: 10, size: 'medium' },
  { left: '0%', top: '64%', width: '24%', height: '36%', opacity: 0.72, zIndex: 6, size: 'small' },
  { left: '25.5%', top: '64%', width: '24%', height: '36%', opacity: 0.72, zIndex: 6, size: 'small' },
  { left: '51%', top: '64%', width: '24%', height: '36%', opacity: 0.72, zIndex: 6, size: 'small' },
  { left: '76%', top: '64%', width: '24%', height: '36%', opacity: 0.72, zIndex: 6, size: 'small' }
];

const titleSizeBySlot = {
  hero: 'text-2xl md:text-3xl',
  medium: 'text-lg md:text-xl',
  small: 'text-sm md:text-base'
};

const INITIAL_SLOT_BY_CARD = memoryShots.map((_, index) => index);
const IMAGE_FADE_DURATION_MS = 1000;
const STAGE_FLOW_INTERVAL_MS = 5600;

const PlaceImageRotator = memo(function PlaceImageRotator({
  images,
  alt,
  paused,
  cycleMs,
  enableMotion,
  priority
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [outgoingIndex, setOutgoingIndex] = useState(null);
  const currentIndexRef = useRef(0);
  const clearFadeRef = useRef(null);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    if (!enableMotion || paused || images.length <= 1) {
      return undefined;
    }

    const id = window.setInterval(() => {
      const outgoing = currentIndexRef.current;
      const next = (outgoing + 1) % images.length;

      currentIndexRef.current = next;
      setOutgoingIndex(outgoing);
      setCurrentIndex(next);
    }, cycleMs);

    return () => {
      window.clearInterval(id);
    };
  }, [paused, cycleMs, enableMotion, images.length]);

  useEffect(() => {
    if (outgoingIndex === null) {
      return undefined;
    }

    clearFadeRef.current = window.setTimeout(() => {
      setOutgoingIndex(null);
    }, IMAGE_FADE_DURATION_MS + 50);

    return () => {
      if (clearFadeRef.current) {
        window.clearTimeout(clearFadeRef.current);
        clearFadeRef.current = null;
      }
    };
  }, [outgoingIndex]);

  const activeSrc = images[currentIndex] ?? images[0];

  return (
    <>
      <img
        src={activeSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transform-gpu"
      />

      {enableMotion && outgoingIndex !== null && (
        <img
          src={images[outgoingIndex]}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transform-gpu"
          style={{ animation: `moodboard-fade-out ${IMAGE_FADE_DURATION_MS}ms ease forwards` }}
        />
      )}
    </>
  );
});

const JourneyMoodboard = () => {
  const stageRef = useRef(null);
  const cardRefs = useRef([]);
  const slotIndexRef = useRef(INITIAL_SLOT_BY_CARD);
  const isPausedRef = useRef(false);
  const timerRef = useRef(null);
  const [stageState, setStageState] = useState(() => ({
    heroTitle: memoryShots[0].title,
    activeHeroCardIndex: 0,
    slotByCard: INITIAL_SLOT_BY_CARD
  }));
  const [isStagePaused, setIsStagePaused] = useState(false);

  useEffect(() => {
    const seen = new Set();

    memoryShots.forEach(({ images }) => {
      images.forEach((src) => {
        if (seen.has(src)) {
          return;
        }

        seen.add(src);
        const preload = new Image();
        preload.decoding = 'async';
        preload.src = src;
      });
    });
  }, []);

  useEffect(() => {
    let ctx;
    const stage = stageRef.current;

    if (!stage) {
      return undefined;
    }

    const syncStageState = () => {
      const currentSlots = slotIndexRef.current;
      const heroCardIndex = currentSlots.findIndex((slotIndex) => slotIndex === 0);

      startTransition(() => {
        setStageState({
          heroTitle: heroCardIndex >= 0 ? memoryShots[heroCardIndex].title : memoryShots[0].title,
          activeHeroCardIndex: heroCardIndex >= 0 ? heroCardIndex : 0,
          slotByCard: [...currentSlots]
        });
      });
    };

    const setStagePausedValue = (nextValue) => {
      isPausedRef.current = nextValue;
      setIsStagePaused((currentValue) => (currentValue === nextValue ? currentValue : nextValue));
    };

    const animateCardToSlot = (cardEl, slotIndex, immediate = false) => {
      const slot = slots[slotIndex];

      gsap.to(cardEl, {
        left: slot.left,
        top: slot.top,
        width: slot.width,
        height: slot.height,
        opacity: slot.opacity,
        zIndex: slot.zIndex,
        duration: immediate ? 0 : 1.45,
        ease: 'power3.inOut',
        overwrite: 'auto'
      });
    };

    const flow = () => {
      if (isPausedRef.current) {
        return;
      }

      slotIndexRef.current = slotIndexRef.current.map((slotIndex) => (slotIndex + 1) % slots.length);

      slotIndexRef.current.forEach((slotIndex, cardIndex) => {
        const cardEl = cardRefs.current[cardIndex];
        if (!cardEl) {
          return;
        }

        animateCardToSlot(cardEl, slotIndex);
      });

      syncStageState();
    };

    ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(min-width: 1024px)', () => {
        cardRefs.current.forEach((cardEl, index) => {
          if (!cardEl) {
            return;
          }

          gsap.set(cardEl, {
            position: 'absolute',
            force3D: true
          });

          animateCardToSlot(cardEl, slotIndexRef.current[index], true);
        });

        syncStageState();
        timerRef.current = window.setInterval(flow, STAGE_FLOW_INTERVAL_MS);

        const onStageEnter = () => {
          setStagePausedValue(true);
        };

        const onStageLeave = () => {
          setStagePausedValue(false);
        };

        stage.addEventListener('mouseenter', onStageEnter);
        stage.addEventListener('mouseleave', onStageLeave);

        return () => {
          stage.removeEventListener('mouseenter', onStageEnter);
          stage.removeEventListener('mouseleave', onStageLeave);

          if (timerRef.current) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }

          setStagePausedValue(false);
        };
      });

      return () => {
        mm.revert();
      };
    }, stage);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }

      ctx?.revert();
    };
  }, []);

  return (
    <section
      id="journey-moodboard"
      className="relative overflow-hidden px-4 py-16 md:px-8 md:py-24 lg:px-12"
      style={{
        backgroundColor: 'var(--bg-base)',
        color: 'var(--text-body)'
      }}
    >
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-8 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between md:gap-5">
          <div className="max-w-3xl">
            <span
              className="mb-4 block text-xs uppercase tracking-[0.22em] md:text-sm"
              style={{ color: 'var(--accent-primary, #C6A96B)' }}
            >
              Journey Moodboard
            </span>
            <h2 className="font-heading text-2xl leading-tight md:text-3xl lg:text-4xl">
              Places In Motion
            </h2>
            <p className="mt-3 text-sm leading-relaxed opacity-80 md:mt-5 md:text-base">
              The same place-swapping loop from your test concept, now embedded before the footer as a live gallery.
            </p>
          </div>

          <div className="flex items-end gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] opacity-65">Hero Card</p>
              <p className="mt-2 font-heading text-xl md:text-2xl">{stageState.heroTitle}</p>
            </div>
            <div className="flex gap-2">
              {memoryShots.map((shot, index) => (
                <span
                  key={`${shot.title}-pip`}
                  className={`h-[2px] rounded-full transition-all duration-500 ${
                    index === stageState.activeHeroCardIndex ? 'w-8' : 'w-3'
                  }`}
                  style={{
                    backgroundColor:
                      index === stageState.activeHeroCardIndex
                        ? 'var(--accent-primary, #C6A96B)'
                        : 'color-mix(in srgb, var(--text-body) 20%, transparent)'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          ref={stageRef}
          className="relative flex w-full gap-4 overflow-x-auto pb-2 no-scrollbar lg:block lg:h-[620px] lg:overflow-visible"
        >
          {memoryShots.map((shot, index) => {
            const slotForCard = stageState.slotByCard[index];
            const slotSize = slots[slotForCard]?.size ?? 'small';
            const titleClass = titleSizeBySlot[slotSize];
            const enableImageMotion = slotSize !== 'small';

            return (
              <article
                key={shot.title}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className={`group relative h-[190px] w-[72vw] max-w-[250px] shrink-0 snap-center overflow-hidden rounded-[10px] border border-white/10 bg-black/40 md:h-[220px] md:w-[300px] md:max-w-[300px] lg:mb-5 lg:h-auto lg:w-auto lg:max-w-none lg:shrink ${
                  index > 4 ? 'hidden md:block lg:block' : ''
                }`}
                style={{ willChange: 'transform, opacity' }}
              >
                <div className="absolute inset-0 scale-[1.06] transform-gpu" data-image-layer>
                  <PlaceImageRotator
                    images={shot.images}
                    alt={shot.title}
                    paused={isStagePaused}
                    cycleMs={4200 + index * 250}
                    enableMotion={enableImageMotion}
                    priority={slotForCard === 0}
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                <div
                  className="pointer-events-none absolute inset-[8px] rounded-[4px] border"
                  style={{
                    borderColor: 'color-mix(in srgb, white 22%, transparent)'
                  }}
                />

                <div
                  className="pointer-events-none absolute inset-0 border"
                  style={{
                    borderColor:
                      slotForCard === 0
                        ? 'color-mix(in srgb, var(--accent-primary, #C6A96B) 45%, transparent)'
                        : 'transparent'
                  }}
                />

                <div className="absolute inset-x-0 bottom-0 z-10 p-4 md:p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="h-1 w-1 rounded-full"
                      style={{ backgroundColor: 'var(--accent-primary, #C6A96B)' }}
                    />
                    <span
                      className="text-[10px] uppercase tracking-[0.38em] md:text-[11px]"
                      style={{ color: 'var(--accent-primary, #C6A96B)' }}
                    >
                      {shot.region}
                    </span>
                  </div>

                  <h3 className={`font-heading leading-none text-white ${titleClass}`}>{shot.title}</h3>
                  <p className="mt-2 text-xs italic text-white/70 md:text-base">{shot.tagline}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default JourneyMoodboard;
