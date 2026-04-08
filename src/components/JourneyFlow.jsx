import { useEffect, useRef, useState } from 'react';
import './JourneyFlow.css';
import { DESTINATIONS } from '../data/destinations';

const JOURNEY_REGIONS = [
  'Rajasthan',
  'Himachal',
  'Uttarakhand',
  'Kashmir',
  'Ladakh',
  'NorthEast',
  'Kerala',
];

const STOPS = JOURNEY_REGIONS.map((label, index) => {
  const source = DESTINATIONS[index % DESTINATIONS.length];
  return {
    id: label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    label,
    destinationName: source.name,
    image: source.image,
    alt: label,
    description: source.subtitle,
  };
});

function JourneyFlow() {
  const wrapperRef = useRef(null);
  const navZoneRef = useRef(null);
  const pathLayerRef = useRef(null);
  const curvePathRef = useRef(null);
  const cardRefs = useRef([]);
  const stopRefs = useRef([]);
  const animationRef = useRef(null);
  const motionRef = useRef({
    targetX: 0,
    currentX: 0,
    isDragging: false,
    startX: 0,
    scrollLeftStart: 0,
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const activeStop = STOPS[activeIndex] ?? STOPS[0];

  const jumpToStop = (index) => {
    const wrapper = wrapperRef.current;
    const stop = stopRefs.current[index];
    if (!wrapper || !stop) return;

    const wrapperRect = wrapper.getBoundingClientRect();
    const stopRect = stop.getBoundingClientRect();
    const stopCenter = stopRect.left - wrapperRect.left + stopRect.width / 2;
    const nextTarget = motionRef.current.targetX + (stopCenter - wrapperRect.width / 2);
    const maxScroll = Math.max(0, wrapper.scrollWidth - wrapper.clientWidth);

    motionRef.current.targetX = Math.max(0, Math.min(nextTarget, maxScroll));
  };

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const navZone = navZoneRef.current;
    if (!wrapper || !navZone) return undefined;

    const lerpFactor = 0.075;

    const getPathYForViewportX = (viewportX) => {
      const path = curvePathRef.current;
      const pathLayer = pathLayerRef.current;
      if (!path || !pathLayer) return null;

      const layerRect = pathLayer.getBoundingClientRect();
      const xInLayerPx = Math.max(0, Math.min(viewportX - layerRect.left, layerRect.width));

      if (layerRect.width <= 0) return null;

      const targetX = (xInLayerPx / layerRect.width) * 1400;
      const total = path.getTotalLength();
      let low = 0;
      let high = total;

      for (let i = 0; i < 22; i += 1) {
        const mid = (low + high) / 2;
        const point = path.getPointAtLength(mid);
        if (point.x < targetX) {
          low = mid;
        } else {
          high = mid;
        }
      }

      const yNorm = path.getPointAtLength((low + high) / 2).y;
      return layerRect.top + (yNorm / 100) * layerRect.height;
    };

    const clampTarget = () => {
      const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
      const max = Math.max(0, maxScroll);
      motionRef.current.targetX = Math.max(0, Math.min(motionRef.current.targetX, max));
    };

    const onWheel = (e) => {
      e.preventDefault();
      motionRef.current.targetX += e.deltaY * 1.8;
      clampTarget();
    };

    const getPageX = (e) => {
      if ('touches' in e && e.touches.length > 0) return e.touches[0].pageX;
      return e.pageX;
    };

    const onStart = (e) => {
      motionRef.current.isDragging = true;
      motionRef.current.startX = getPageX(e);
      motionRef.current.scrollLeftStart = motionRef.current.targetX;
    };

    const onMove = (e) => {
      if (!motionRef.current.isDragging) return;
      const x = getPageX(e);
      const walk = (x - motionRef.current.startX) * 2.5;
      motionRef.current.targetX = motionRef.current.scrollLeftStart - walk;
      clampTarget();
    };

    const onEnd = () => {
      motionRef.current.isDragging = false;
    };

    const animate = () => {
      motionRef.current.currentX +=
        (motionRef.current.targetX - motionRef.current.currentX) * lerpFactor;
      wrapper.scrollLeft = motionRef.current.currentX;

      const viewportCenter = window.innerWidth / 2;
      let nextActive = -1;
      let minDistance = Number.POSITIVE_INFINITY;

      for (let i = 0; i < stopRefs.current.length; i += 1) {
        const stop = stopRefs.current[i];
        if (!stop) continue;
        const card = cardRefs.current[i];

        const rect = stop.getBoundingClientRect();
        const stopCenter = rect.left + rect.width / 2;
        const distance = Math.abs(viewportCenter - stopCenter);
        const focus = Math.max(0, 1 - distance / 420);
        const wave = Math.sin(motionRef.current.currentX / 220 + i * 0.7) * 10;
        const dotViewportY = getPathYForViewportX(stopCenter);

        if (dotViewportY !== null) {
          const stopRect = stop.getBoundingClientRect();
          const dotTopInStop = dotViewportY - stopRect.top;
          stop.style.setProperty('--dot-top', `${dotTopInStop.toFixed(2)}px`);
        }

        stop.style.setProperty('--focus', focus.toFixed(3));
        stop.style.setProperty('--wave', `${wave.toFixed(2)}px`);
        if (card) {
          card.style.setProperty('--focus', focus.toFixed(3));
          card.style.setProperty('--wave', `${wave.toFixed(2)}px`);
        }

        if (distance < minDistance && distance < 150) {
          minDistance = distance;
          nextActive = i;
        }
      }

      if (nextActive !== -1) {
        setActiveIndex((prev) => (prev === nextActive ? prev : nextActive));
      }

      animationRef.current = window.requestAnimationFrame(animate);
    };

    const onPointerDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      onStart(e);
    };

    navZone.addEventListener('wheel', onWheel, { passive: false });
    navZone.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    navZone.addEventListener('touchstart', onPointerDown, { passive: true });
    navZone.addEventListener('touchmove', onMove);
    navZone.addEventListener('touchend', onEnd);
    window.addEventListener('resize', clampTarget);

    clampTarget();
    animationRef.current = window.requestAnimationFrame(animate);

    return () => {
      navZone.removeEventListener('wheel', onWheel);
      navZone.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      navZone.removeEventListener('touchstart', onPointerDown);
      navZone.removeEventListener('touchmove', onMove);
      navZone.removeEventListener('touchend', onEnd);
      window.removeEventListener('resize', clampTarget);

      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <section className="journey-flow" aria-labelledby="journey-flow-title">
      <div className="journey-flow__ambient journey-flow__ambient--one" />
      <div className="journey-flow__ambient journey-flow__ambient--two" />

      <div className="journey-flow__shell">
        <header className="journey-flow__intro">
          <div className="journey-flow__headline-block">
            <span className="journey-flow__eyebrow">Signature route</span>
            <h2 id="journey-flow-title">A cinematic trail across seven landscapes.</h2>
          </div>

          <div className="journey-flow__lede">
            <p>
              Scroll, drag, or swipe through the route to move between destinations. The active
              card, checkpoint, and path all stay in sync as you explore.
            </p>

            <div className="journey-flow__chips" aria-hidden="true">
              <span>Wheel friendly</span>
              <span>Touch ready</span>
              <span>Seven checkpoints</span>
            </div>
          </div>
        </header>

        <div className="journey-flow__signals">
          <div className="journey-flow__signal">
            <span className="journey-flow__signal-label">Current stop</span>
            <strong>{activeStop.label}</strong>
            <span>
              {String(activeIndex + 1).padStart(2, '0')} of {String(STOPS.length).padStart(2, '0')}
            </span>
          </div>
          <div className="journey-flow__signal journey-flow__signal--accent">
            <span className="journey-flow__signal-label">Destination</span>
            <strong>{activeStop.destinationName}</strong>
            <span>{activeStop.description}</span>
          </div>
          <div className="journey-flow__signal">
            <span className="journey-flow__signal-label">Motion</span>
            <strong>Drag or wheel</strong>
            <span>Checkpoint positions follow your movement in real time</span>
          </div>
        </div>

        <div className="journey-flow__stage">
          <div className="card-display">
            {STOPS.map((stop, index) => (
              <article
                key={stop.id}
                className={`journey-card ${activeIndex === index ? 'active' : 'inactive'}`}
                role="button"
                tabIndex={0}
                onClick={() => jumpToStop(index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    jumpToStop(index);
                  }
                }}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
              >
                <img src={stop.image} alt={stop.alt} className="journey-card__image" />
                <div className="journey-card__overlay">
                  <div className="journey-card__eyebrow">
                    Checkpoint {String(index + 1).padStart(2, '0')}
                  </div>
                  <h3>{stop.destinationName}</h3>
                  <p>
                    {stop.label} - {stop.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <aside className="journey-flow__sidebar">
            <div className="journey-flow__story">
              <span className="journey-flow__eyebrow">Highlighted destination</span>
              <h3>{activeStop.destinationName}</h3>
              <p>
                {activeStop.label} opens the route with a different mood, color, and rhythm. The
                travel line keeps the focus on the current scene while the other stops orbit in the
                background.
              </p>
            </div>

            <div className="journey-flow__route-list">
              {STOPS.map((stop, index) => (
                <div
                  key={stop.id}
                  className={`journey-flow__route-item ${activeIndex === index ? 'is-active' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => jumpToStop(index)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      jumpToStop(index);
                    }
                  }}
                >
                  <span className="journey-flow__route-index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="journey-flow__route-copy">
                    <strong>{stop.label}</strong>
                    <span>{stop.destinationName}</span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="path-navigation" id="navZone" ref={navZoneRef}>
          <div className="path-svg-layer" ref={pathLayerRef}>
            <svg width="100%" height="100%" viewBox="0 0 1400 100" preserveAspectRatio="none">
              <path className="base-path" d="M0,50 Q350,0 700,50 T1400,50" />
              <path
                className="glow-path"
                d="M0,50 Q350,0 700,50 T1400,50"
                ref={curvePathRef}
              />
            </svg>
          </div>

          <div className="scroll-wrapper" id="scrollWrapper" ref={wrapperRef}>
            {STOPS.map((stop, index) => (
              <div
                key={stop.id}
                className={`region-stop ${activeIndex === index ? 'active' : ''}`}
                data-target={stop.id}
                role="button"
                tabIndex={0}
                onClick={() => jumpToStop(index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    jumpToStop(index);
                  }
                }}
                ref={(el) => {
                  stopRefs.current[index] = el;
                }}
              >
                <div className="region-label">{stop.label}</div>
                <div className="checkpoint-dot" />
              </div>
            ))}
          </div>
        </div>

        <div className="hint">Drag or wheel to explore the route</div>
      </div>
    </section>
  );
}

export default JourneyFlow;
