import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const experienceScenes = [
  {
    title: 'Wake up in a palace in Udaipur',
    desc: 'Private breakfast over the water, a waiting boat below, and a day that opens gently at your own pace.',
    image: 'https://images.unsplash.com/photo-1496372412473-e8548ffd82bc?q=80&w=2000&auto=format&fit=crop',
    objectPosition: 'center 62%',
  },
  {
    title: 'Private desert safari in Rajasthan',
    desc: 'Golden dunes, quiet service, and long stretches of stillness reserved entirely for you.',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=1800&auto=format&fit=crop',
    objectPosition: 'center center',
  },
  {
    title: 'Dinner under a sky full of stars',
    desc: 'A beautifully timed table, lantern light, and an evening that feels intimate instead of arranged.',
    image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1800&auto=format&fit=crop',
    objectPosition: 'center center',
  },
  {
    title: 'A quiet Himalayan hideaway above the clouds',
    desc: 'Cold air, complete stillness, and a retreat that feels impossibly far from the ordinary.',
    image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=2000&auto=format&fit=crop',
    objectPosition: 'center 58%',
  },
];

const benefits = [
  'You’ll never follow a fixed itinerary again',
  'Experiences not available to the public',
];

const Experience = () => {
  const sectionRef = useRef(null);
  const [activeScene, setActiveScene] = useState(0);

  useEffect(() => {
    const sceneTimer = window.setInterval(() => {
      setActiveScene((current) => (current + 1) % experienceScenes.length);
    }, 3000);

    return () => window.clearInterval(sceneTimer);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-experience-intro]',
        { opacity: 0, y: 34 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 76%',
          },
        }
      );

      gsap.fromTo(
        '[data-experience-visual]',
        { opacity: 0, y: 40, scale: 0.985 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.05,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '[data-experience-visual]',
            start: 'top 84%',
          },
        }
      );

      gsap.utils.toArray('[data-benefit]').forEach((item, index) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            delay: index * 0.08,
            scrollTrigger: {
              trigger: item,
              start: 'top 92%',
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative overflow-hidden px-5 py-section md:px-10 lg:px-14 transition-colors duration-400"
      style={{
        background:
          'linear-gradient(180deg, var(--bg-surface) 0%, color-mix(in srgb, var(--bg-surface) 96%, black) 100%)',
        color: 'var(--text-body)',
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[linear-gradient(180deg,rgba(198,169,107,0.06),transparent_76%)]" />

      <div className="relative mx-auto max-w-[1220px]">
        <div className="grid gap-10 lg:grid-cols-[minmax(260px,0.78fr)_minmax(0,1.22fr)] lg:items-center lg:gap-12 xl:gap-16">
          <div data-experience-intro className="max-w-xl">
            <span className="mb-4 block text-xs uppercase tracking-[0.24em] text-gold md:text-sm">
              Experience
            </span>
            <h2 className="font-heading text-2xl leading-[1.05] text-primary md:text-3xl lg:text-[3.1rem]">
              Access, atmosphere, and ease in one quietly exceptional journey.
            </h2>
            <p className="mt-5 max-w-[34rem] text-sm leading-relaxed text-secondary/72 md:text-base">
              Every detail is arranged to feel seamless, personal, and naturally elevated from the moment you arrive.
            </p>
          </div>

          <article
            data-experience-visual
            className="relative min-h-[28rem] overflow-hidden rounded-[28px] border border-white/10 bg-black/50 shadow-[0_28px_90px_rgba(0,0,0,0.28)]"
          >
            {experienceScenes.map((scene, index) => {
              const isActive = index === activeScene;

              return (
                <div
                  key={scene.title}
                  aria-hidden={!isActive}
                  className={`absolute inset-0 transition-all duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                  }`}
                >
                  <img
                    src={scene.image}
                    alt={isActive ? scene.title : ''}
                    className={`h-full w-full object-cover transition-transform duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isActive ? 'scale-100' : 'scale-[1.04]'
                    }`}
                    style={{ minHeight: '28rem', objectPosition: scene.objectPosition }}
                  />

                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,6,6,0.12),rgba(6,6,6,0.28)_42%,rgba(6,6,6,0.82)_100%)]" />

                  <div
                    className={`absolute inset-x-0 bottom-0 z-10 p-6 transition-all duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:p-8 lg:p-10 ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                  >
                    <div className="max-w-[34rem]">
                      <h3 className="font-heading text-[1.9rem] leading-[1] text-white md:text-[2.4rem] lg:text-[2.8rem]">
                        {scene.title}
                      </h3>
                      <p className="mt-4 max-w-[28rem] text-sm leading-relaxed text-white/74 md:text-base">
                        {scene.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </article>
        </div>

        <div className="mt-12 grid gap-8 md:mt-16 md:grid-cols-2 md:gap-10">
          {benefits.map((benefit) => (
            <div
              key={benefit}
              data-benefit
              className="border-t border-white/10 pt-6 md:pt-7"
            >
              <p className="font-heading text-2xl leading-[1.08] text-primary md:text-[2rem]">
                {benefit}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
