import React from 'react';

const LETTER_PATHS = [
  {
    d: 'M22 23V137.8M22 23H53C65.5 23 75.8 25.4 83.8 30.3C91.8 35.3 97.8 42.1 101.7 50.8C105.6 59.6 107.5 69.4 107.5 80.4C107.5 91.3 105.6 101.1 101.7 109.9C97.8 118.6 91.8 125.4 83.8 130.4C75.8 135.3 65.5 137.8 53 137.8H22',
    delay: '0.15s',
  },
  {
    d: 'M150 23L181 74.5L212 23M181 74.5V137.8',
    delay: '0.55s',
  },
  {
    d: 'M250 23V137.8',
    delay: '0.95s',
  },
];

function IntroLoader({ isExiting }) {
  return (
    <div
      className={`fixed inset-0 z-[120] flex items-center justify-center overflow-hidden transition-all duration-700 ${
        isExiting ? 'pointer-events-none opacity-0 scale-[1.02]' : 'opacity-100 scale-100'
      }`}
      style={{ backgroundColor: 'var(--bg-base)' }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 opacity-90">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 50% 40%, rgba(198,169,107,0.18), transparent 42%), linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0))',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        <div className="relative">
          <div
            className="absolute inset-0 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(198,169,107,0.28), transparent 62%)',
              transform: 'scale(1.1)',
            }}
          />

          <svg
            viewBox="0 0 272 161"
            className="relative w-[220px] md:w-[300px] overflow-visible"
            fill="none"
          >
            {LETTER_PATHS.map((path) => (
              <path
                key={path.d}
                d={path.d}
                pathLength="1"
                className="loader-trace"
                style={{ animationDelay: path.delay }}
              />
            ))}
          </svg>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] md:text-xs uppercase tracking-[0.42em] text-gold/80">
            Design Your India
          </p>
          <div className="mx-auto h-px w-40 overflow-hidden rounded-full bg-white/10">
            <div className="loader-progress h-full w-1/2 rounded-full bg-gold" />
          </div>
        </div>
      </div>

      <style>{`
        .loader-trace {
          stroke: #c6a96b;
          stroke-width: 12;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          filter: drop-shadow(0 0 18px rgba(198, 169, 107, 0.18));
          animation: traceDYI 1.25s cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }

        .loader-progress {
          transform: translateX(-120%);
          animation: loaderSweep 1.85s ease-in-out infinite;
        }

        @keyframes traceDYI {
          0% {
            stroke-dashoffset: 1;
            opacity: 0.35;
          }
          65% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0.92;
          }
        }

        @keyframes loaderSweep {
          0% {
            transform: translateX(-120%);
          }
          60% {
            transform: translateX(200%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}

export default IntroLoader;
