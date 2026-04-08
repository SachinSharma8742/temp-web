import React, {
  memo,
  startTransition,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import gsap from 'gsap';

const extraStyles = `
  @keyframes fadeIt {
    from { opacity: 1; }
    to   { opacity: 0; }
  }
  @keyframes slideIt {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  .fadeClass { animation: fadeIt 900ms ease forwards; }
  .noScrollClass { scrollbar-width: none; }
  .noScrollClass::-webkit-scrollbar { display: none; }
`;

if (typeof document !== 'undefined' && !document.getElementById('myStylesId')) {
  const myTag = document.createElement('style');
  myTag.id = 'myStylesId';
  myTag.textContent = extraStyles;
  document.head.appendChild(myTag);
}

const placesData = [
  {
    title: 'Varanasi', region: 'Uttar Pradesh', tagline: 'Where eternity meets the Ganges',
    images: [
      'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&q=90&fit=crop',
    ],
  },
  {
    title: 'Jaisalmer', region: 'Rajasthan', tagline: 'A golden fortress in the desert',
    images: [
      'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&q=90&fit=crop',
    ],
  },
  {
    title: 'Alleppey', region: 'Kerala', tagline: 'Backwaters and monsoon silence',
    images: [
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?w=1200&q=90&fit=crop',
    ],
  },
  {
    title: 'Ladakh', region: 'Kashmir', tagline: 'Sky kingdoms above the clouds',
    images: [
      'https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1536421469767-80559bb6f5e1?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=1200&q=90&fit=crop',
    ],
  },
  {
    title: 'Hampi', region: 'Karnataka', tagline: 'Ruins of forgotten empires',
    images: [
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1496372412473-e8548ffd82bc?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1568168361784-22e428b8a9c3?w=1200&q=90&fit=crop',
    ],
  },
  {
    title: 'Udaipur', region: 'Rajasthan', tagline: 'The city of lakes and longing',
    images: [
      'https://images.unsplash.com/photo-1568168361784-22e428b8a9c3?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1496372412473-e8548ffd82bc?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=90&fit=crop',
    ],
  },
  {
    title: 'Darjeeling', region: 'West Bengal', tagline: 'Tea gardens veiled in mist',
    images: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1622308644420-b20142dc993c?w=1200&q=90&fit=crop',
      'https://images.unsplash.com/photo-1623625434462-e5e42318ae49?w=1200&q=90&fit=crop',
    ],
  },
];

const boxSizes = [
  { left: '0%',    top: '0%',  width: '55%', height: '62%', opacity: 1,    zIndex: 20, size: 'hero'   },
  { left: '56%',   top: '0%',  width: '44%', height: '30%', opacity: 1,    zIndex: 10, size: 'medium' },
  { left: '56%',   top: '32%', width: '44%', height: '30%', opacity: 1,    zIndex: 10, size: 'medium' },
  { left: '0%',    top: '64%', width: '24%', height: '36%', opacity: 1,    zIndex: 6,  size: 'small'  },
  { left: '25.5%', top: '64%', width: '24%', height: '36%', opacity: 1,    zIndex: 6,  size: 'small'  },
  { left: '51%',   top: '64%', width: '24%', height: '36%', opacity: 1,    zIndex: 6,  size: 'small'  },
  { left: '76%',   top: '64%', width: '24%', height: '36%', opacity: 1,    zIndex: 6,  size: 'small'  },
];

const boxCount = boxSizes.length;
const cardCount = placesData.length;

const baseBoxArr = Object.freeze(
  Array.from({ length: cardCount }, (_, i) => i % boxCount)
);

const textSizesObj = {
  hero:   'text-2xl md:text-3xl',
  medium: 'text-lg md:text-xl',
  small:  'text-sm md:text-base',
};

let didPreloadThing = false;
function doPreload() {
  if (didPreloadThing) return;
  didPreloadThing = true;
  const runnerFunc = typeof requestIdleCallback !== 'undefined'
    ? (fn) => requestIdleCallback(fn, { timeout: 4000 })
    : (fn) => setTimeout(fn, 200);
  runnerFunc(() => {
    const checkedStuff = new Set();
    placesData.forEach(({ images }) =>
      images.forEach((theSrc) => {
        if (checkedStuff.has(theSrc)) return;
        checkedStuff.add(theSrc);
        const pic = new Image();
        pic.decoding = 'async';
        pic.fetchPriority = 'low';
        pic.src = theSrc;
      })
    );
  });
}

const SmallIconThing = memo(function SmallIconThing({ className, style }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
});

const ImageSwitcher = memo(
  function ImageSwitcher({ images, alt, priority, advanceTick, onImageClick }) {
    const [goodImg, setGoodImg] = useState(0);
    const [badImg, setBadImg] = useState(-1);
    const goodRef = useRef(0);
    const timeRef = useRef(null);
    const lastTick = useRef(advanceTick);

    const switchItUp = useCallback(() => {
      const oldVal = goodRef.current;
      const newVal = (oldVal + 1) % images.length;
      goodRef.current = newVal;
      setGoodImg(newVal);
      setBadImg(oldVal);
      clearTimeout(timeRef.current);
      timeRef.current = setTimeout(() => setBadImg(-1), 960);
    }, [images.length]);

    useEffect(() => {
      if (advanceTick !== lastTick.current) {
        lastTick.current = advanceTick;
        switchItUp();
      }
    });

    useEffect(() => () => clearTimeout(timeRef.current), []);

    const clickyFunc = useCallback(() => {
      switchItUp();
      if (onImageClick) onImageClick();
    }, [switchItUp, onImageClick]);

    return (
      <div
        className="absolute inset-0 w-full h-full cursor-pointer group/rot overflow-hidden"
        onClick={clickyFunc}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && clickyFunc()}
        aria-label="Next photo"
      >
        <img
          key={`a-${images[goodImg]}`}
          src={images[goodImg]}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transform-gpu transition-transform duration-700 group-hover/rot:scale-[1.04]"
          style={{ pointerEvents: 'none' }}
        />
        {badImg !== -1 && (
          <img
            key={`o-${images[badImg]}`}
            src={images[badImg]}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transform-gpu fadeClass"
            style={{ pointerEvents: 'none' }}
          />
        )}
      </div>
    );
  },
  (oldProps, newProps) =>
    oldProps.advanceTick === newProps.advanceTick &&
    oldProps.priority === newProps.priority &&
    oldProps.images === newProps.images &&
    oldProps.onImageClick === newProps.onImageClick
);

const CoolMoodboardComponent = () => {
  const bigDivRef = useRef(null);
  const cardItemsRef = useRef([]);
  const boxStateRef = useRef([...baseBoxArr]);
  const pausedRef = useRef(false);
  const myFlowTimer = useRef(null);
  const myStepTimer = useRef(null);
  const myCycleTimer = useRef(null);
  const cursorRef = useRef(0);
  const mobTimerA = useRef(null);
  const mobTimerB = useRef(null);
  const mobPauseRef = useRef(false);

  const [tickNums, setTickNums] = useState(() => Array.from({ length: cardCount }, () => 0));
  const [bigOneIdx, setBigOneIdx] = useState(0);
  const [currBoxArray, setCurrBoxArray] = useState(() => [...baseBoxArr]);

  const emptyClicks = useMemo(() => placesData.map(() => () => {}), []);

  useLayoutEffect(() => {
    doPreload();
  }, []);

  const makeStateGood = useCallback(() => {
    const arrThing = boxStateRef.current;
    const findBig = arrThing.indexOf(0);
    startTransition(() => {
      setBigOneIdx(findBig >= 0 ? findBig : 0);
      setCurrBoxArray([...arrThing]);
    });
  }, []);

  const startDoingSequence = useCallback(() => {
    clearTimeout(myStepTimer.current);
    clearTimeout(myCycleTimer.current);
    if (pausedRef.current) return;

    const theStepFunc = () => {
      if (pausedRef.current) return;
      let triesNum = 0;
      while (triesNum < cardCount) {
        const val1 = cursorRef.current % cardCount;
        cursorRef.current = (val1 + 1) % cardCount;
        triesNum++;

        const getSz = boxSizes[boxStateRef.current[val1]]?.size ?? 'small';
        if (getSz !== 'small') {
          setTickNums((oldTicks) => {
            const nextTicks = [...oldTicks];
            nextTicks[val1] = oldTicks[val1] + 1;
            return nextTicks;
          });

          if (cursorRef.current === 0) {
            myCycleTimer.current = setTimeout(() => { startDoingSequence(); }, 7000);
          } else {
            myStepTimer.current = setTimeout(theStepFunc, 1000);
          }
          return;
        }
      }
      myCycleTimer.current = setTimeout(() => { startDoingSequence(); }, 7000);
    };

    myStepTimer.current = setTimeout(theStepFunc, 1000);
  }, []);

  const stopDoingSequence = useCallback(() => {
    clearTimeout(myStepTimer.current);
    clearTimeout(myCycleTimer.current);
  }, []);

  useEffect(() => {
    const theStage = bigDivRef.current;
    if (!theStage) return;

    const moveTheBox = (elItem, slotIdVal, makeFast = false) => {
      const sObj = boxSizes[slotIdVal];
      gsap.to(elItem, {
        left: sObj.left, top: sObj.top, width: sObj.width, height: sObj.height,
        opacity: sObj.opacity, zIndex: sObj.zIndex,
        duration: makeFast ? 0 : 1.45,
        ease: 'power3.inOut',
        overwrite: true,
        force3D: true,
      });
    };

    const runFlow = () => {
      if (pausedRef.current) return;
      const arrNext = boxStateRef.current.map((sNum) => (sNum + 1) % boxCount);
      boxStateRef.current = arrNext;
      arrNext.forEach((idVal, cardIdVal) => {
        const dEl = cardItemsRef.current[cardIdVal];
        if (dEl) moveTheBox(dEl, idVal);
      });
      makeStateGood();
    };

    const gCtx = gsap.context(() => {
      const mMed = gsap.matchMedia();
      mMed.add('(min-width: 1024px)', () => {
        cardItemsRef.current.forEach((elementThing, iVal) => {
          if (!elementThing) return;
          gsap.set(elementThing, { position: 'absolute', force3D: true });
          moveTheBox(elementThing, boxStateRef.current[iVal], true);
        });
        makeStateGood();
        myFlowTimer.current = setInterval(runFlow, 5600);
        startDoingSequence();

        const inHover = () => {
          pausedRef.current = true;
          stopDoingSequence();
        };
        const outHover = () => {
          pausedRef.current = false;
          startDoingSequence();
        };

        theStage.addEventListener('mouseenter', inHover, { passive: true });
        theStage.addEventListener('mouseleave', outHover, { passive: true });

        return () => {
          theStage.removeEventListener('mouseenter', inHover);
          theStage.removeEventListener('mouseleave', outHover);
          clearInterval(myFlowTimer.current);
          stopDoingSequence();
          pausedRef.current = false;
        };
      });
      return () => mMed.revert();
    }, theStage);

    const mQuery = window.matchMedia('(max-width: 1023px)');
    if (mQuery.matches) startDoingSequence();

    return () => {
      clearInterval(myFlowTimer.current);
      stopDoingSequence();
      gCtx.revert();
    };
  }, [makeStateGood, startDoingSequence, stopDoingSequence]);

  useEffect(() => {
    const theStageBox = bigDivRef.current;
    if (!theStageBox) return;
    const chkDesk = () => window.matchMedia('(min-width: 1024px)').matches;
    let rafScrollId = null;

    const getVisibleCards = () =>
      Array.from(theStageBox.querySelectorAll('[data-mood-card-index]')).filter(
        (el) => el.offsetParent !== null
      );

    const syncNowShowing = () => {
      if (chkDesk()) return;

      const cards = getVisibleCards();
      if (!cards.length) return;

      const viewCenter = theStageBox.scrollLeft + theStageBox.clientWidth / 2;
      let nearestIdx = 0;
      let nearestDist = Number.POSITIVE_INFINITY;

      cards.forEach((cardEl) => {
        const idxAttr = Number(cardEl.getAttribute('data-mood-card-index'));
        if (Number.isNaN(idxAttr)) return;

        const cardCenter = cardEl.offsetLeft + cardEl.offsetWidth / 2;
        const dist = Math.abs(cardCenter - viewCenter);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = idxAttr;
        }
      });

      setBigOneIdx((prevIdx) => (prevIdx === nearestIdx ? prevIdx : nearestIdx));
    };

    const onScrollSync = () => {
      if (rafScrollId) window.cancelAnimationFrame(rafScrollId);
      rafScrollId = window.requestAnimationFrame(syncNowShowing);
    };

    const doNextScroll = () => {
      clearTimeout(mobTimerA.current);
      if (chkDesk() || mobPauseRef.current) return;
      mobTimerA.current = setTimeout(() => {
        if (mobPauseRef.current || chkDesk()) return;
        const cards = getVisibleCards();
        if (!cards.length) return;
        const randNum = Math.floor(Math.random() * cards.length);
        const childEl = cards[randNum];
        if (childEl) theStageBox.scrollTo({ left: childEl.offsetLeft - 16, behavior: 'smooth' });
        doNextScroll();
      }, 5000 + Math.random() * 2000);
    };

    const stopScrollThing = () => {
      mobPauseRef.current = true;
      clearTimeout(mobTimerA.current);
      clearTimeout(mobTimerB.current);
      mobTimerB.current = setTimeout(() => {
        mobPauseRef.current = false;
        doNextScroll();
      }, 2000);
    };

    const mobQuery = window.matchMedia('(max-width: 1023px)');
    if (mobQuery.matches) {
      syncNowShowing();
      doNextScroll();
    }
    const fixChange = (evObj) => {
      clearTimeout(mobTimerA.current);
      if (evObj.matches) {
        mobPauseRef.current = false;
        syncNowShowing();
        doNextScroll();
      }
    };

    theStageBox.addEventListener('scroll', onScrollSync, { passive: true });
    window.addEventListener('resize', onScrollSync);
    theStageBox.addEventListener('touchstart', stopScrollThing, { passive: true });
    theStageBox.addEventListener('touchend',   stopScrollThing, { passive: true });
    theStageBox.addEventListener('mouseenter', stopScrollThing, { passive: true });
    theStageBox.addEventListener('mouseleave', stopScrollThing, { passive: true });
    mobQuery.addEventListener('change', fixChange);

    return () => {
      clearTimeout(mobTimerA.current);
      clearTimeout(mobTimerB.current);
      if (rafScrollId) window.cancelAnimationFrame(rafScrollId);
      theStageBox.removeEventListener('scroll', onScrollSync);
      window.removeEventListener('resize', onScrollSync);
      theStageBox.removeEventListener('touchstart', stopScrollThing);
      theStageBox.removeEventListener('touchend',   stopScrollThing);
      theStageBox.removeEventListener('mouseenter', stopScrollThing);
      theStageBox.removeEventListener('mouseleave', stopScrollThing);
      mobQuery.removeEventListener('change', fixChange);
    };
  }, []);

  const theTitleTxt = useMemo(
    () => placesData[bigOneIdx]?.title ?? placesData[0].title,
    [bigOneIdx]
  );
  const theRegTxt = placesData[bigOneIdx]?.region ?? '';

  return (
    <section
      id="journey-moodboard"
      className="relative -mt-px overflow-hidden px-4 py-16 md:px-8 md:py-24 lg:px-12"
      style={{ backgroundColor: 'var(--bg-base, #0e0e0e)', color: 'var(--text-body, #e8e0d0)' }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 14%, black 100%)',
          maskImage: 'linear-gradient(180deg, transparent 0%, black 14%, black 100%)',
        }}
      />

      <div className="mx-auto max-w-[1120px]">
        <div className="mb-10 md:mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-5">
          <div className="max-w-2xl">
            <span
              className="mb-4 block text-[10px] uppercase tracking-[0.3em] md:text-xs font-bold"
              style={{
                backgroundImage: 'linear-gradient(90deg, var(--accent-primary, #4F7FF0) 0%, #8FB3FF 45%, var(--accent-primary, #4F7FF0) 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'slideIt 5s linear infinite',
              }}
            >
              Journey Moodboard
            </span>
            <h2
              className="font-heading text-[1.75rem] leading-[1.05] md:text-4xl lg:text-[3rem]"
              style={{ letterSpacing: '-0.025em' }}
            >
              Places In Motion
            </h2>
            <p className="mt-3 text-sm leading-relaxed opacity-50 md:mt-4 md:text-[15px] max-w-sm">
              One destination at a time — a slow visual journey across India.
            </p>
          </div>

          <div className="flex items-end gap-4">
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-[0.3em] opacity-35 mb-1">Now Showing</p>
              <p className="font-heading text-xl md:text-2xl" style={{ letterSpacing: '-0.02em' }}>
                {theTitleTxt}
              </p>
              <p
                className="mt-0.5 text-[9px] uppercase tracking-[0.3em]"
                style={{ color: 'var(--accent-primary, #4F7FF0)', opacity: 0.8 }}
              >
                {theRegTxt}
              </p>
            </div>
            <div className="flex flex-col gap-[4px] pb-[2px]">
              {placesData.map((dItem, iNum) => (
                <span
                  key={dItem.title}
                  className="rounded-full block transition-all duration-500"
                  style={{
                    width:  '2px',
                    height: iNum === bigOneIdx ? '22px' : '5px',
                    backgroundColor:
                      iNum === bigOneIdx
                        ? 'var(--accent-primary, #4F7FF0)'
                        : 'rgba(255,255,255,0.12)',
                    boxShadow: iNum === bigOneIdx
                      ? '0 0 6px rgba(79, 127, 240,0.6)'
                      : 'none',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          ref={bigDivRef}
          className="noScrollClass relative flex w-full gap-4 md:gap-5 overflow-x-auto pb-4 lg:block lg:h-[620px] lg:overflow-visible"
        >
          {placesData.map((dItem2, idxNum) => {
            const thisBoxId = currBoxArray[idxNum];
            const sizeStr = boxSizes[thisBoxId]?.size ?? 'small';
            const isBigOne = thisBoxId === 0;

            return (
              <article
                key={dItem2.title}
                data-mood-card-index={idxNum}
                ref={(theNode) => { cardItemsRef.current[idxNum] = theNode; }}
                className={[
                  'group relative shrink-0 snap-center overflow-hidden rounded-2xl',
                  'border bg-transparent',
                  'h-[200px] w-[80vw] max-w-[280px]',
                  'md:h-[240px] md:w-[320px] md:max-w-[320px]',
                  'lg:mb-4 lg:h-auto lg:w-auto lg:max-w-none',
                  'backdrop-blur-[1px]',
                  'transition-[border-color,box-shadow] duration-500',
                  isBigOne
                    ? 'border-[rgba(79,127,240,0.42)] lg:hover:border-[rgba(79,127,240,0.7)]'
                    : 'border-white/[0.14] lg:hover:border-white/35',
                  'lg:hover:shadow-[0_18px_50px_rgba(8,15,34,0.45)]',
                  idxNum > 4 ? 'hidden md:block lg:block' : '',
                ].join(' ')}
                style={{ willChange: 'transform, opacity, left, top, width, height' }}
              >
                <div className="absolute inset-0 transform-gpu">
                  <ImageSwitcher
                    images={dItem2.images}
                    alt={dItem2.title}
                    priority={isBigOne}
                    advanceTick={tickNums[idxNum]}
                    onImageClick={emptyClicks[idxNum]}
                  />
                </div>

                <div
                  className="pointer-events-none absolute inset-0 transition-all duration-500"
                  style={{
                    background:
                      sizeStr === 'small'
                        ? 'linear-gradient(to top, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.16) 42%, rgba(0,0,0,0) 78%)'
                        : 'linear-gradient(to top, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.18) 42%, rgba(0,0,0,0) 78%)',
                  }}
                />

                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl"
                  style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)' }}
                />

                <div
                  className="absolute top-2.5 right-2.5 z-20 pointer-events-none
                    w-7 h-7 rounded-full
                    flex items-center justify-center
                    bg-black/45 backdrop-blur-md
                    border border-white/10
                    group-hover:border-white/22 group-hover:bg-black/65
                    transition-all duration-300"
                >
                  <SmallIconThing
                    className="w-3 h-3 transition-colors duration-300"
                    style={{ color: 'rgba(255,255,255,0.45)', transform: 'rotate(-10deg)' }}
                  />
                </div>

                <div className="absolute top-3 left-3 z-20 flex gap-[5px] pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-400">
                  {dItem2.images.map((_, imgN) => (
                    <div
                      key={imgN}
                      className="rounded-full"
                      style={{
                        height: '2px',
                        width:  imgN === 0 ? '14px' : '4px',
                        backgroundColor:
                          imgN === 0
                            ? 'var(--accent-primary, #4F7FF0)'
                            : 'rgba(255,255,255,0.18)',
                      }}
                    />
                  ))}
                </div>

                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-10
                    p-4 md:p-5
                    group-hover:-translate-y-1 transition-transform duration-400
                    bg-gradient-to-t to-transparent"
                  style={{
                    backgroundImage:
                      sizeStr === 'small'
                        ? 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.28) 48%, rgba(0,0,0,0) 100%)'
                        : 'linear-gradient(to top, rgba(0,0,0,0.76) 0%, rgba(0,0,0,0.42) 48%, rgba(0,0,0,0) 100%)',
                  }}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className="h-[4px] w-[4px] rounded-full shrink-0"
                      style={{ backgroundColor: 'var(--accent-primary, #4F7FF0)' }}
                    />
                    <span
                      className="text-[8px] uppercase tracking-[0.45em] font-bold"
                      style={{ color: 'var(--accent-primary, #4F7FF0)', opacity: 0.85 }}
                    >
                      {dItem2.region}
                    </span>
                  </div>

                  <h3
                    className={`font-heading leading-[1.1] text-white/95 ${textSizesObj[sizeStr]}`}
                    style={{ letterSpacing: '-0.015em' }}
                  >
                    {dItem2.title}
                  </h3>

                  <p className="mt-1 text-[11px] md:text-xs leading-relaxed text-white/65 group-hover:text-white/80 transition-colors duration-300">
                    {dItem2.tagline}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <div
          className="mt-5 flex items-center justify-between"
          style={{ opacity: 0.3, fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase' }}
        >
          <span>{placesData.length} destinations</span>
          <span style={{ color: 'var(--accent-primary, #4F7FF0)' }}>India</span>
        </div>
      </div>
    </section>
  );
};

export default CoolMoodboardComponent;

