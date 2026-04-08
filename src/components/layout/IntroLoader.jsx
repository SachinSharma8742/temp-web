import React from 'react';
import tracedLogoSvg from '../../assets/logo-mark-traced.svg?raw';

function buildInlineLogo(rawSvg) {
  let pathIndex = 0;

  const withSvgAttrs = rawSvg.replace(
    /<svg\b/,
    '<svg class="logo-trace-svg" viewBox="0 0 2000 2000" preserveAspectRatio="xMidYMid meet"'
  );

  return withSvgAttrs.replace(/<path\b/g, () => {
    pathIndex += 1;

    if (pathIndex === 1) return '<path class="pin-segment"';
    if (pathIndex === 2) return '<path class="skip-segment"';

    return '<path class="trace-segment"';
  });
}

const INLINE_TRACED_LOGO = buildInlineLogo(tracedLogoSvg);

function IntroLoader({ isExiting }) {
  return (
    <div
      className={`fixed inset-0 z-[120] flex items-center justify-center overflow-hidden transition-all duration-700 ${
        isExiting ? 'pointer-events-none opacity-0 scale-[1.02]' : 'opacity-100 scale-100'
      }`}
      style={{ backgroundColor: 'var(--bg-base)' }}
      aria-hidden="true"
    >
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <div
          className="logo-trace-wrap relative w-[320px] max-w-[82vw] md:w-[520px]"
          aria-label="Design Your India"
          dangerouslySetInnerHTML={{ __html: INLINE_TRACED_LOGO }}
        />
      </div>

      <style>{`
        .logo-trace-wrap svg {
          width: 100%;
          height: auto;
          display: block;
        }

        /* Hide the traced solid divider path: we replace it with animated road dashes. */
        .logo-trace-wrap .skip-segment {
          opacity: 0;
        }

        .logo-trace-wrap .pin-segment {
          fill: #ff1414 !important;
          stroke: #ff1414 !important;
          opacity: 0;
          transform-box: fill-box;
          transform-origin: center;
          animation: pinDrop 0.56s cubic-bezier(0.22, 0.9, 0.26, 1) 1.65s forwards;
        }

        .logo-trace-wrap path.trace-segment {
          stroke: none !important;
          stroke-width: 0 !important;
          fill-opacity: 0;
          animation: fillLogo 0.28s ease 0.95s forwards;
        }

        .logo-trace-wrap path.trace-segment:nth-of-type(3) { animation-delay: 0.92s; }
        .logo-trace-wrap path.trace-segment:nth-of-type(4) { animation-delay: 0.97s; }
        .logo-trace-wrap path.trace-segment:nth-of-type(5) { animation-delay: 1.02s; }
        .logo-trace-wrap path.trace-segment:nth-of-type(6) { animation-delay: 1.07s; }
        .logo-trace-wrap path.trace-segment:nth-of-type(7) { animation-delay: 1.12s; }
        .logo-trace-wrap path.trace-segment:nth-of-type(8) { animation-delay: 1.17s; }
        .logo-trace-wrap path.trace-segment:nth-of-type(9) { animation-delay: 1.22s; }
        .logo-trace-wrap path.trace-segment:nth-of-type(10) { animation-delay: 1.27s; }
        .logo-trace-wrap path.trace-segment:nth-of-type(11) { animation-delay: 1.32s; }
        .logo-trace-wrap path.trace-segment:nth-of-type(12) { animation-delay: 1.37s; }

        /* Road body + dashed center line completing the missing i-stems. */
        .logo-trace-wrap::before {
          content: '';
          position: absolute;
          left: 45.9%;
          top: 36.5%;
          width: 3.6%;
          height: 36.1%;
          border-radius: 4px;
          background: #0d1016;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
          transform-origin: bottom;
          transform: translateX(-50%) scaleY(0);
          animation: roadBodyGrow 0.42s cubic-bezier(0.37, 0, 0.2, 1) 1.22s forwards;
        }

        .logo-trace-wrap::after {
          content: '';
          position: absolute;
          left: 45.9%;
          top: 36.5%;
          width: 0.66%;
          height: 36.1%;
          border-radius: 2px;
          background: repeating-linear-gradient(
            to bottom,
            #f1f1f1 0 10%,
            transparent 10% 17%
          );
          opacity: 1;
          transform-origin: bottom;
          transform: translateX(-50%) scaleY(0);
          animation: roadGrow 0.42s cubic-bezier(0.37, 0, 0.2, 1) 1.22s forwards;
        }

        @keyframes fillLogo {
          0% {
            fill-opacity: 0;
          }
          100% {
            fill-opacity: 1;
          }
        }

        @keyframes roadGrow {
          0% {
            transform: translateX(-50%) scaleY(0);
          }
          100% {
            transform: translateX(-50%) scaleY(1);
          }
        }

        @keyframes roadBodyGrow {
          0% {
            transform: translateX(-50%) scaleY(0);
          }
          100% {
            transform: translateX(-50%) scaleY(1);
          }
        }

        @keyframes pinDrop {
          0% {
            opacity: 0;
            transform: translateY(-90px) scale(0.96);
          }
          72% {
            opacity: 1;
            transform: translateY(4px) scale(1);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .logo-trace-wrap path.trace-segment,
          .logo-trace-wrap .pin-segment,
          .logo-trace-wrap::before,
          .logo-trace-wrap::after {
            animation: none;
          }

          .logo-trace-wrap path.trace-segment {
            fill-opacity: 1;
            stroke: none !important;
          }

          .logo-trace-wrap .pin-segment {
            opacity: 1;
          }

          .logo-trace-wrap::before,
          .logo-trace-wrap::after {
            transform: translateX(-50%) scaleY(1);
          }
        }
      `}</style>
    </div>
  );
}

export default IntroLoader;
