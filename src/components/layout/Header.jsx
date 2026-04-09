import React, { useState, useEffect } from 'react';
import { useTheme } from '../../ThemeContext';
import logoMark from '../../assets/design-your-india-logo.png';


const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrolledBg = theme === 'light'
    ? 'bg-white/92 backdrop-blur-md shadow-[0_10px_24px_rgba(15,23,42,0.08)] border-b border-[rgba(30,58,138,0.12)]'
    : 'bg-black/90 backdrop-blur-md';

  const enquireButtonClass = scrolled
    ? 'px-4 md:px-6 py-2.5 rounded-lg border border-[rgba(79,127,240,0.35)] bg-white/85 text-[var(--text-heading)] shadow-[0_10px_20px_rgba(15,23,42,0.08)] transition-all duration-300 text-[11px] md:text-sm tracking-[0.2em] md:tracking-widest uppercase'
    : 'px-4 md:px-6 py-2.5 rounded-lg border border-gold/70 text-gold/85 bg-transparent transition-all duration-300 text-[11px] md:text-sm tracking-[0.2em] md:tracking-widest uppercase';

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out px-4 md:px-8 flex justify-between items-center ${scrolled ? scrolledBg : 'bg-transparent'
        }`}
    >
      <a href="#top" className="shrink-0 -ml-3 md:-ml-6" aria-label="Design Your India">
        <img
          src={logoMark}
          alt="Design Your India"
          className="h-16 md:h-20 lg:h-24 w-auto max-w-none object-contain"
          loading="eager"
          decoding="async"
        />
      </a>
      <nav className="hidden md:flex gap-8 text-sm uppercase tracking-widest" style={{ color: 'var(--text-body)', opacity: 0.8 }}>
        <a href="#destinations" className="hover:text-gold transition-colors">Destinations</a>
        <a href="#experience" className="hover:text-gold transition-colors">Experience</a>
      </nav>
      <div className="flex items-center gap-4">

        <button
          className={enquireButtonClass}
          style={{ WebkitTextStroke: scrolled ? '0.35px rgba(15, 23, 42, 0.55)' : '0px transparent' }}
        >
          Enquire
        </button>
      </div>
    </header>
  );
};

export default Header;
