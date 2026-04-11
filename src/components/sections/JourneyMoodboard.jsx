import React, { memo, useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Volume2, VolumeX } from 'lucide-react';
import MEDIA_OPTIMIZED_MANIFEST from '../../data/mediaOptimizedManifest.json';
import { getDeliveredImageUrl, isRemoteUrl } from '../../utils/mediaDelivery';

// Global Media Set — The ultimate fusion of client offline media and stunning high-end scenes.
const RAW_MEDIA = [
  // === CLIENT'S OFFLINE MEDIA (Physically trimmed to 8s via Python) ===
  "/assets/media/WhatsApp%20Video%202026-04-09%20at%204.06.00%20PM.mp4",
  "/assets/media/WhatsApp%20Video%202026-04-09%20at%204.06.04%20PM.mp4",
  "/assets/media/WhatsApp%20Video%202026-04-09%20at%204.11.01%20PM.mp4",
  "/assets/media/WhatsApp%20Video%202026-04-09%20at%204.11.04%20PM.mp4",
  "/assets/media/WhatsApp%20Video%202026-04-09%20at%204.05.40%20PM.mp4",
  "/assets/media/WhatsApp%20Image%202026-04-09%20at%204.05.44%20PM.jpeg",
  "/assets/media/WhatsApp%20Image%202026-04-09%20at%204.05.48%20PM.jpeg",
  "/assets/media/WhatsApp%20Image%202026-04-09%20at%204.05.54%20PM.jpeg",
  "/assets/media/WhatsApp%20Image%202026-04-10%20at%202.45.56%20PM.jpeg",
  "/assets/media/WhatsApp%20Image%202026-04-10%20at%202.45.57%20PM.jpeg",
  "/assets/media/WhatsApp%20Image%202026-04-10%20at%202.49.12%20PM.jpeg",
  "/assets/media/WhatsApp%20Image%202026-04-10%20at%202.45.56%20PM%20(1).jpeg",
  "/assets/media/WhatsApp%20Image%202026-04-10%20at%202.45.56%20PM%20(2).jpeg",
  "/assets/media/WhatsApp%20Image%202026-04-10%20at%202.49.12%20PM%20(1).jpeg",
  "/assets/media/WhatsApp%20Image%202026-04-10%20at%202.55.46%20PM.jpeg",
  "/assets/media/IMG_0660.MOV",
  "/assets/media/IMG_0664.MOV",
  "/assets/media/IMG_1540.MOV",
  "/assets/media/VID_20240514_120916.mp4",

  // === RAJASTHAN ===
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&q=90&fit=crop",

  // === HIMACHAL PRADESH ===
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=90&fit=crop",
  "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=1600&q=90&fit=crop",

  // === SPITI VALLEY ===
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&q=90&fit=crop",

  // === UTTARAKHAND ===
  "https://images.unsplash.com/photo-1704392768299-cbc3cae79817?w=1600&q=90&fit=crop",
  
  // === KASHMIR ===
  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Dal_Lake_Hazratbal_Srinagar.jpg/960px-Dal_Lake_Hazratbal_Srinagar.jpg",

  // === LADAKH ===
  "https://images.unsplash.com/photo-1530331130276-f0a905c819c2?w=1600&q=90&fit=crop",

  // === NORTHEAST INDIA ===
  "https://images.unsplash.com/photo-1759906356131-9a36dbba796c?w=1600&q=90&fit=crop",

  // === KERALA ===
  "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1600&q=90&fit=crop"
  
];

const toMediaEntry = (rawUrl) => {
  const manifestEntry = MEDIA_OPTIMIZED_MANIFEST[rawUrl];
  const isVideoByPath = /\.(mp4|mov)$/i.test(rawUrl);

  if (isVideoByPath) {
    return {
      raw: rawUrl,
      type: 'video',
      url: manifestEntry?.mp4 || rawUrl,
    };
  }

  if (manifestEntry?.type === 'image') {
    return {
      raw: rawUrl,
      type: 'image',
      url: manifestEntry.default,
      webpSrcSet: manifestEntry.webpSrcSet,
      avifSrcSet: manifestEntry.avifSrcSet,
      sizes: manifestEntry.sizes,
    };
  }

  return {
    raw: rawUrl,
    type: 'image',
    url: isRemoteUrl(rawUrl)
      ? getDeliveredImageUrl(rawUrl, { width: 1600, quality: 72, format: 'webp' })
      : rawUrl,
  };
};

const GLOBAL_MEDIA = RAW_MEDIA.map(toMediaEntry);
const LIGHTWEIGHT_MEDIA = GLOBAL_MEDIA.filter((entry) => entry.type !== 'video');

// Layout Definition for Desktop Overlap
const DESKTOP_LAYOUT = [
  { w: '35%', h: '62%', t: '16%', l: '33%', z: 10, r: 0 },    // Hero
  { w: '24%', h: '45%', t: '4%', l: '8%', z: 5, r: -2 },      // Top Left Large
  { w: '25%', h: '48%', t: '48%', l: '66%', z: 12, r: -1 },   // Bottom Right Large
  { w: '22%', h: '38%', t: '52%', l: '12%', z: 15, r: 1 },    // Bottom Left Medium
  { w: '21%', h: '34%', t: '6%', l: '71%', z: 8, r: 1.5 },    // Top Right Medium
  { w: '18%', h: '26%', t: '72%', l: '43%', z: 20, r: -1.5 },  // Bottom Center Small
  { w: '15%', h: '24%', t: '22%', l: '3%', z: 2, r: -3 },     // Far Left Small
  { w: '16%', h: '24%', t: '32%', l: '79%', z: 3, r: 3 },     // Far Right Small
];

// Aesthetic Mobile Configuration - Organic vertical collage
const MOBILE_LAYOUT = [
  { w: '88%', h: '280px', x: '0%', r: -2, delay: 0 },
  { w: '72%', h: '340px', x: '25%', r: 3, delay: 0.1 },
  { w: '92%', h: '260px', x: '-2%', r: -1, delay: 0.05 },
  { w: '78%', h: '320px', x: '15%', r: 2, delay: 0.15 },
  { w: '84%', h: '280px', x: '10%', r: -3, delay: 0.1 },
  { w: '88%', h: '360px', x: '-5%', r: 1.5, delay: 0.05 },
  { w: '100%', h: '250px', x: '0%', r: 0, delay: 0.2 },
  { w: '75%', h: '300px', x: '22%', r: -4, delay: 0.1 },
];

// ─── MediaSwitcher ───────────────────────────────────────────────────────────
// Now using Framer Motion AnimatePresence for a military-grade smooth crossfade.
const MediaSwitcher = memo(({ src, isPlaying }) => {
  const isVideo = src?.type === 'video';
  const videoRef = useRef(null);

  // Physically pause/play video based on viewport visibility to save CPU/GPU
  // AND manage muted state dynamically for user interaction
  useEffect(() => {
    if (!videoRef.current || !isVideo) return;
    
    // Play/Pause sync
    if (isPlaying) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }

    // Audio sync - direct mutation for reliability across browsers
    videoRef.current.muted = !src.isUnmuted;
  }, [isPlaying, isVideo, src.isUnmuted]);

  return (
    <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={src?.raw}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {isVideo ? (
            <video
              ref={videoRef}
              src={src.url}
              muted loop playsInline
              preload="metadata"
              autoPlay // Added as a hint for mobile browsers
              className="w-full h-full object-cover"
            />
          ) : (
            <picture>
              {src?.avifSrcSet ? <source type="image/avif" srcSet={src.avifSrcSet} sizes={src.sizes} /> : null}
              {src?.webpSrcSet ? <source type="image/webp" srcSet={src.webpSrcSet} sizes={src.sizes} /> : null}
              <img
                src={src.url}
                srcSet={src.webpSrcSet || undefined}
                sizes={src.sizes || '(max-width: 768px) 92vw, (max-width: 1280px) 72vw, 1280px'}
                alt=""
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                className="w-full h-full object-cover"
              />
            </picture>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

const CinematicMoodboard = () => {
  const [allowHeavyMedia, setAllowHeavyMedia] = useState(true);
  const [currentMedia, setCurrentMedia] = useState(
    DESKTOP_LAYOUT.map((_, i) => ({ 
      ...LIGHTWEIGHT_MEDIA[i % LIGHTWEIGHT_MEDIA.length],
      isUnmuted: false 
    }))
  );
  const [isInView, setIsInView] = useState(false);
  const [isPC, setIsPC] = useState(false);

  // Viewport detection to separate PC and Mobile logic
  useEffect(() => {
    const checkPC = () => setIsPC(window.innerWidth >= 1024);
    checkPC();
    window.addEventListener('resize', checkPC);
    return () => window.removeEventListener('resize', checkPC);
  }, []);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return;

    const setPreference = () => {
      const effectiveType = connection.effectiveType || '';
      const isSlowNetwork = /(^|-)2g$|(^|-)3g$/i.test(effectiveType);
      setAllowHeavyMedia(!(connection.saveData || isSlowNetwork));
    };

    setPreference();
    connection.addEventListener?.('change', setPreference);

    return () => {
      connection.removeEventListener?.('change', setPreference);
    };
  }, []);

  const containerRef = useRef(null);
  const triggerSwitchRef = useRef(null);
  const sectionRef = useRef(null);

  const triggerSwitch = useCallback((cardIndex) => {
    // If not in view, don't even try to switch or schedule next
    if (!triggerSwitchRef.current || !document.getElementById('moodboard')) return;

    setCurrentMedia(prev => {
      const mediaPool = allowHeavyMedia ? GLOBAL_MEDIA : LIGHTWEIGHT_MEDIA;
      const currentlyShown = new Set(prev.map((item) => item.raw));
      const available = mediaPool.filter((m) => !currentlyShown.has(m.raw));
      const selectionPool = available.length > 0 ? available : mediaPool;
      const validPool = selectionPool.filter((m) => m.raw !== prev[cardIndex]?.raw);
      const nextItem = validPool[Math.floor(Math.random() * validPool.length)];

      if (!nextItem) return prev;

      const performSwitch = () => {
        setCurrentMedia(latest => {
          const updated = [...latest];
          updated[cardIndex] = { ...nextItem, isUnmuted: false };
          return updated;
        });
        
        // Schedule next switch ONLY if we're still in view
        // If not in view, the IntersectionObserver will restart the cycle later
        if (triggerSwitchRef.current) {
          setTimeout(() => triggerSwitchRef.current(cardIndex), 8000);
        }
      };

      // Preload before switching
      if (nextItem.type === 'video') {
        performSwitch();
      } else {
        const img = new window.Image();
        img.onload = performSwitch;
        img.onerror = performSwitch;
        img.src = nextItem.url;
      }
      
      return prev;
    });
  }, [allowHeavyMedia]);

  // Intersection Observer to Pause/Resume
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Sync ref with latest callback
  useEffect(() => {
    triggerSwitchRef.current = triggerSwitch;
  }, [triggerSwitch]);

  // Restart timers when coming back into view
  useEffect(() => {
    if (!isInView) return;

    const timers = DESKTOP_LAYOUT.map((_, i) => {
      const stagger = 4000 + i * 2000; // Slightly faster initial switch when entering
      return setTimeout(() => triggerSwitch(i), stagger);
    });

    return () => timers.forEach(clearTimeout);
  }, [isInView, triggerSwitch]);

  const handleCardClick = (index) => {
    const media = currentMedia[index];
    if (!media?.url || media.type !== 'video') return;

    setCurrentMedia(prevMedia => {
      const currentlyUnmutedIndex = prevMedia.findIndex(m => m.isUnmuted);
      const isNewActive = currentlyUnmutedIndex !== index;
      const nextActiveIndex = isNewActive ? index : null;

      return prevMedia.map((m, i) => ({
        ...m,
        isUnmuted: i === nextActiveIndex
      }));
    });
  };

  // Subtle continuous floating drift
  useEffect(() => {
    let frame;
    const update = (time) => {
      if (!isInView || !containerRef.current) {
        frame = requestAnimationFrame(update);
        return;
      }
      const cards = containerRef.current.querySelectorAll('.collage-card');
      cards.forEach((card, i) => {
        const ox = Math.sin(time * 0.0003 + i * 2) * 6;
        const oy = Math.cos(time * 0.0004 + i * 2) * 6;
        card.style.setProperty('--drift-x', `${ox}px`);
        card.style.setProperty('--drift-y', `${oy}px`);
      });
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [isInView]);

  return (
    <section
      ref={sectionRef}
      id="moodboard"
      className="relative w-full overflow-hidden py-16 md:py-24 transition-colors duration-400"
      style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-body)' }}
    >
      <style>{`
        .collage-container {
          display: flex;
          flex-direction: column;
          gap: 3.5rem; /* More space for the organic overlap feel */
          padding: 0 6vw 5rem;
          width: 100%;
        }
        
        .collage-card {
           position: relative;
           width: var(--w);
           height: var(--h);
           left: var(--x);
           flex-shrink: 0;
           border-radius: 20px;
           overflow: hidden;
           box-shadow: 0 15px 45px rgba(0,0,0,0.1);
           /* Use mobile-specific rotation on small screens */
           transform: rotate(var(--mobile-rot, 0deg));
        }

        @media (min-width: 1024px) {
          .collage-container {
            position: relative;
            display: block;
            height: 88vh;
            max-height: 960px;
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
            overflow: hidden;
            padding: 0;
          }
          .collage-card {
            position: absolute;
            width: var(--w);
            height: var(--h);
            top: var(--t);
            left: var(--l);
            z-index: var(--z);
            border-radius: 24px;
            /* Use desktop-specific rotation + drift on PC */
            transform: translate3d(var(--drift-x,0px), var(--drift-y,0px), 0) rotate(var(--desktop-rot, 0deg));
            transition: box-shadow 0.5s ease, z-index 0s;
          }
          .collage-card:hover {
            box-shadow: 0 30px 80px rgba(0,0,0,0.28);
            z-index: 50 !important;
          }
        }
      `}</style>


      {/* Edge vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-40 hidden lg:block"
        style={{ background: 'radial-gradient(ellipse at center, transparent 30%, var(--bg-base) 100%)' }}
      />

      {/* Mobile heading */}
      <div className="mx-auto max-w-7xl px-5 mb-12 lg:hidden">
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-primary mb-3">
          A Visual Journey
        </h2>
        <p className="text-sm md:text-base opacity-60">Scroll to explore places in motion</p>
      </div>

      <div ref={containerRef} className="collage-container">
        {DESKTOP_LAYOUT.map((l, index) => {
          const media = currentMedia[index];
          const ml = MOBILE_LAYOUT[index] || MOBILE_LAYOUT[0];
          
          return (
            <motion.article
              key={`card-${index}`}
              onClick={() => handleCardClick(index)}
              initial={{ opacity: 0, y: 40, rotate: (isPC ? l.r : ml.r) - 2 }}
              whileInView={{ 
                opacity: 1, 
                y: 0, 
                rotate: isPC ? l.r : ml.r,
                transition: { duration: 0.8, delay: (isPC ? index * 0.1 : ml.delay), ease: "easeOut" }
              }}
              viewport={{ once: true, margin: "-10%" }}
              className="collage-card group"
              style={{
                // General Props - Dynamic scaling based on viewport
                '--w': isPC ? l.w : ml.w, 
                '--h': isPC ? l.h : ml.h, 
                '--x': ml.x,
                '--t': l.t, '--l': l.l, '--z': l.z, 
                // Platform-Specific Rotations
                '--desktop-rot': `${l.r}deg`,
                '--mobile-rot': `${ml.r}deg`,
              }}
            >
              <MediaSwitcher src={media} isPlaying={isInView && allowHeavyMedia} />

              {/* Audio Status Indicators */}
              <div className="absolute top-4 right-4 z-30">
                <AnimatePresence>
                  {media?.type === 'video' && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`p-2 rounded-full backdrop-blur-md border border-white/20 ${media.isUnmuted ? 'bg-gold text-black' : 'bg-black/30 text-white/70 hover:bg-black/50'}`}
                    >
                      {media.isUnmuted ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Inner edge highlight */}
              <div
                className="pointer-events-none absolute inset-0 rounded-[inherit] z-20"
                style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)' }}
              />
            </motion.article>
          );
        })}
      </div>
    </section>
  );
};

export default CinematicMoodboard;

