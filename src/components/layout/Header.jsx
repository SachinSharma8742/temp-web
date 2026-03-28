import React, { useState, useEffect } from 'react';
import { useTheme } from '../../App';


const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrolledBg = theme === 'light'
    ? 'bg-[#E8DCCB]/90 backdrop-blur-md py-3 md:py-4'
    : 'bg-black/90 backdrop-blur-md py-3 md:py-4';

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out px-4 md:px-8 py-4 md:py-6 flex justify-between items-center ${
        scrolled ? scrolledBg : 'bg-transparent'
      }`}
    >
      <div className="logo text-2xl md:text-3xl" style={{ color: 'var(--text-heading)' }}>
        DYI
      </div>
      <nav className="hidden md:flex gap-8 text-sm uppercase tracking-widest" style={{ color: 'var(--text-body)', opacity: 0.8 }}>
        <a href="#destinations" className="hover:text-gold transition-colors">Destinations</a>
        <a href="#experience" className="hover:text-gold transition-colors">Experience</a>
      </nav>
      <div className="flex items-center gap-4">

        <button className="px-4 md:px-6 py-2 border border-gold text-gold hover:bg-gold hover:text-black transition-colors duration-300 text-[11px] md:text-sm tracking-[0.2em] md:tracking-widest uppercase">
          Enquire
        </button>
      </div>
    </header>
  );
};

export default Header;
