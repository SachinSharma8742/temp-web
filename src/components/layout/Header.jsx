import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../ThemeContext';
import logoMark from '../../assets/design-your-india-logo.png';


const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const { theme } = useTheme();

  const navigate = useNavigate();

  const scrollToSection = (e, targetId) => {
    e.preventDefault();
    const section = document.getElementById(targetId);
    if (!section) {
      navigate(`/#${targetId}`);
      return;
    }
    const y = section.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrolledBg = theme === 'light'
    ? 'bg-white/92 backdrop-blur-md shadow-[0_10px_24px_rgba(15,23,42,0.08)] border-b border-[rgba(30,58,138,0.12)]'
    : 'bg-black/90 backdrop-blur-md';

  const enquireButtonClass = scrolled
    ? 'px-4 md:px-6 py-2.5 rounded-lg border border-[rgba(79,127,240,0.35)] bg-white/85 text-[var(--text-heading)] shadow-md hover:shadow-xl hover:bg-gold hover:text-white hover:border-gold transition-all duration-500 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-[11px] md:text-sm tracking-[0.2em] md:tracking-widest uppercase cursor-pointer'
    : 'px-4 md:px-6 py-2.5 rounded-lg border border-gold/70 text-gold bg-transparent hover:bg-gold/10 hover:shadow-[0_0_20px_rgba(79,127,240,0.25)] transition-all duration-500 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-[11px] md:text-sm tracking-[0.2em] md:tracking-widest uppercase cursor-pointer';

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out px-4 md:px-8 flex justify-between items-center ${scrolled ? scrolledBg : 'bg-transparent'
        }`}
    >
      <Link
        to="/"
        className="shrink-0 -ml-3 md:-ml-6 cursor-pointer"
        aria-label="Design Your India"
      >
        <img
          src={logoMark}
          alt="Design Your India"
          className="h-16 md:h-20 lg:h-24 w-auto max-w-none object-contain"
          loading="eager"
          decoding="async"
        />
      </Link>
      <nav className="hidden md:flex gap-8 text-sm uppercase tracking-widest" style={{ color: 'var(--text-body)', opacity: 0.8 }}>
        <a href="#destinations" onClick={(e) => scrollToSection(e, 'destinations')} className="hover:text-gold transition-colors">Destinations</a>
        <a href="#moodboard" onClick={(e) => scrollToSection(e, 'moodboard')} className="hover:text-gold transition-colors">Moodboard</a>
        <a href="#experience" onClick={(e) => scrollToSection(e, 'experience')} className="hover:text-gold transition-colors">Experience</a>
      </nav>
      <div className="flex items-center gap-4">

        <button
          type="button"
          onClick={(e) => scrollToSection(e, 'contact')}
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
