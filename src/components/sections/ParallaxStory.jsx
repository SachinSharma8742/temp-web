import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const previewMoments = [
  {
    label: 'Palace Morning',
    title: 'Wake up in a palace in Udaipur',
    image: 'https://images.unsplash.com/photo-1496372412473-e8548ffd82bc?q=80&w=2000&auto=format&fit=crop',
    className: 'lg:col-span-7 min-h-[46vh] md:min-h-[52vh]',
    objectPosition: 'center 62%',
  },
  {
    label: 'Desert Crossing',
    title: 'Private desert safari in Rajasthan',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=1800&auto=format&fit=crop',
    className: 'lg:col-span-5 min-h-[46vh] md:min-h-[52vh]',
    objectPosition: 'center center',
  },
  {
    label: 'After Dark',
    title: 'Dinner under a sky full of stars',
    image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1800&auto=format&fit=crop',
    className: 'lg:col-span-4 min-h-[34vh] md:min-h-[38vh]',
    objectPosition: 'center center',
  },
  {
    label: 'Hidden Retreat',
    title: 'A quiet Himalayan hideaway above the clouds',
    image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=2000&auto=format&fit=crop',
    className: 'lg:col-span-8 min-h-[34vh] md:min-h-[38vh]',
    objectPosition: 'center 58%',
  },
];

const ParallaxStory = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-preview-intro]',
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.95,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          },
        }
      );

      gsap.utils.toArray('[data-preview-card]').forEach((card, index) => {
        const media = card.querySelector('[data-preview-media]');

        gsap.fromTo(
          card,
          { opacity: 0, y: 54 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: index * 0.06,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 84%',
            },
          }
        );

        if (media) {
          gsap.fromTo(
            media,
            { scale: 1.1, yPercent: -4 },
            {
              scale: 1.02,
              yPercent: 4,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden px-6 py-section md:px-12 lg:px-16 transition-colors duration-400"
      style={{
        background:
          'radial-gradient(120% 90% at 50% 0%, color-mix(in srgb, var(--color-gold) 9%, transparent), transparent 58%), linear-gradient(180deg, var(--bg-base) 0%, var(--bg-surface) 14%, var(--bg-surface) 100%)',
      }}
    >
      <div className="mx-auto max-w-[1180px]">
        <div
          data-preview-intro
          className="mb-10 flex flex-col gap-6 md:mb-14 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-3xl">
            <span className="mb-4 block text-xs uppercase tracking-[0.24em] text-gold md:text-sm">
              Experience Preview
            </span>
            <h2 className="font-heading text-2xl leading-[1.08] text-primary md:text-3xl lg:text-4xl">
              Four moments that make the journey feel immediate.
            </h2>
          </div>

          <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.3em] text-white/45">
            <span className="h-px w-14 bg-gold/70" />
            Cinematic highlights
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
          {previewMoments.map((moment) => (
            <article
              key={moment.title}
              data-preview-card
              className={`group relative overflow-hidden rounded-[24px] border border-white/10 bg-black/30 shadow-[0_24px_72px_rgba(0,0,0,0.28)] transition-transform duration-500 hover:-translate-y-1 ${moment.className}`}
            >
              <div className="absolute inset-0 overflow-hidden">
                <img
                  data-preview-media
                  src={moment.image}
                  alt={moment.title}
                  className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  style={{ objectPosition: moment.objectPosition }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.04),rgba(5,5,5,0.18)_30%,rgba(5,5,5,0.9)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(198,169,107,0.14),transparent_40%)] opacity-75 transition-opacity duration-500 group-hover:opacity-100" />
              </div>

              <div className="pointer-events-none absolute inset-[1px] rounded-[23px] border border-white/10 group-hover:border-[color:rgba(198,169,107,0.36)] transition-colors duration-500" />

              <div className="relative z-10 flex h-full items-end p-6 md:p-7 lg:p-8">
                <div className="max-w-[30rem]">
                  <span className="mb-4 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.34em] text-gold md:text-xs">
                    <span className="h-px w-8 bg-gold/70" />
                    {moment.label}
                  </span>
                  <h3 className="font-heading text-xl leading-[1.08] text-white md:text-2xl lg:text-[2rem]">
                    {moment.title}
                  </h3>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ParallaxStory;
