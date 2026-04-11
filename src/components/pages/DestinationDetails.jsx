import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MapPin, Calendar, IndianRupee, ArrowLeft, Download, CircleCheck, CircleX } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { DESTINATIONS } from '../../data/destinations';
import { getDeliveredImageUrl } from '../../utils/mediaDelivery';

const tripModules = import.meta.glob('../../data/trips/*.json');

const DestinationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activePackageIndex, setActivePackageIndex] = useState(0);
  const [expandedDay, setExpandedDay] = useState(0);
  const [destinationPackages, setDestinationPackages] = useState([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Find the base destination from destinations.js for images & subtitle
  const destNameFromUrl = id.replace(/-/g, ' ').toLowerCase();
  
  const baseDest = DESTINATIONS.find(
    d => d.name.toLowerCase() === destNameFromUrl
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDestinationPackages = async () => {
      setIsLoadingPackages(true);

      const destSlug = id.replace(/-/g, ' ').toLowerCase().replace(/\s+/g, '-');
      const matchingKey = Object.keys(tripModules).find((key) => {
        const lowerKey = key.toLowerCase();
        return lowerKey.includes(`/${destSlug}.json`) || (lowerKey.includes(destSlug) && lowerKey.endsWith('.json'));
      });

      if (!matchingKey) {
        if (isMounted) {
          setDestinationPackages([]);
          setIsLoadingPackages(false);
        }
        return;
      }

      try {
        const loadedModule = await tripModules[matchingKey]();
        const parsedPackages = Array.isArray(loadedModule)
          ? loadedModule
          : (loadedModule?.default || []);

        if (!isMounted) return;
        setDestinationPackages(parsedPackages);
      } catch {
        if (!isMounted) return;
        setDestinationPackages([]);
      } finally {
        if (isMounted) setIsLoadingPackages(false);
      }
    };

    setActivePackageIndex(0);
    setExpandedDay(0);
    loadDestinationPackages();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Auto-cycle atmosphere images
  useEffect(() => {
    if (!baseDest || baseDest.images.length <= 1) return undefined;

    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % baseDest.images.length);
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, [baseDest]);

  if (!isLoadingPackages && !baseDest && destinationPackages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center font-body text-primary">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Destination Not Found</h1>
          <button onClick={() => navigate('/')} className="text-gold hover:underline underline-offset-4">Return Home</button>
        </div>
      </div>
    );
  }

  // Fallback defaults if trips parsing missed something
  const packages = destinationPackages.length > 0 ? destinationPackages : [{
    title: `${baseDest?.name} Custom Tour`,
    price: 'Contact for pricing',
    days: []
  }];

  const currentPackage = packages[activePackageIndex];

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-primary pb-24">
      {/* 
        ========================================================================
        HERO SECTION - REDESIGNED (Immersive Narrative Layout)
        ========================================================================
      */}
      <div className="relative w-full h-[60vh] md:h-[85vh] flex flex-col justify-end overflow-hidden print:hidden group">
        
        {/* Main Background Layer with Ken Burns Effect */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <Motion.div
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Motion.img
                src={getDeliveredImageUrl(baseDest?.images[activeImage], { width: 1920, quality: 72, format: 'webp' })}
                alt={`${baseDest?.name} - Main`}
                onError={(event) => {
                  const target = event.currentTarget;
                  if (target.dataset.fallbackApplied === '1') return;
                  target.dataset.fallbackApplied = '1';
                  target.src = baseDest?.images[activeImage] || '';
                }}
                animate={{ 
                  scale: [1, 1.08],
                  transition: { duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }
                }}
                className="w-full h-full object-cover"
              />
            </Motion.div>
          </AnimatePresence>
          
          {/* Multi-stage Scenery Blending Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/20 to-transparent z-10" />
          <div className="absolute inset-0 bg-black/10 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent z-10" />
        </div>

        {/* Floating Navigation Controls */}
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-24 md:top-32 left-5 md:left-12 z-50 flex items-center gap-2 bg-black/20 hover:bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 md:px-6 md:py-3 rounded-full text-white transition-all duration-500 hover:scale-105 active:scale-95 group/back"
        >
          <ArrowLeft size={18} className="group-hover/back:-translate-x-1 transition-transform" />
          <span className="text-[10px] md:text-xs tracking-[0.2em] font-medium uppercase">Back to Destinations</span>
        </button>

        {/* Narrative Side Accordion (Desktop Only) */}
        {baseDest && baseDest.images.length > 1 && (
          <div className="absolute top-1/2 -translate-y-1/2 right-0 z-40 hidden md:flex flex-col h-[400px] w-auto lg:w-96 px-6 gap-3 group/accordion">
            <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-bold mb-2 ml-auto">Atmosphere</p>
            {baseDest.images.map((img, i) => (
              <Motion.div
                key={i}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className={`relative h-1/3 flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl border transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${activeImage === i
                    ? 'border-gold w-48'
                    : 'border-white/20 w-32 hover:w-40 grayscale-[0.5] hover:grayscale-0'
                  } ml-auto shadow-2xl shadow-black/40`}
                onClick={() => setActiveImage(i)}
              >
                <img
                  src={getDeliveredImageUrl(img, { width: 960, quality: 72, format: 'webp' })}
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="Atmosphere"
                  onError={(event) => {
                    const target = event.currentTarget;
                    if (target.dataset.fallbackApplied === '1') return;
                    target.dataset.fallbackApplied = '1';
                    target.src = img;
                  }}
                />
                <div className={`absolute inset-0 transition-opacity duration-500 ${activeImage === i ? 'bg-black/0' : 'bg-black/40 hover:bg-black/20'}`} />
                {activeImage === i && (
                  <div className="absolute bottom-3 left-3 right-3 z-10">
                    <div className="w-6 h-0.5 bg-gold mb-1" />
                    <span className="text-[10px] text-white font-bold uppercase tracking-wider">Viewing</span>
                  </div>
                )}
              </Motion.div>
            ))}
          </div>
        )}

        {/* Main Content Info */}
        <div className="relative z-20 w-full max-w-[1320px] mx-auto px-5 md:px-12 pb-12 md:pb-20">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center gap-4 mb-3 md:mb-4">
              <div className="h-[2px] w-8 md:w-12 bg-gold" />
              <p className="text-gold tracking-[0.3em] md:tracking-[0.4em] text-[10px] md:text-sm uppercase font-black">
                {baseDest?.subtitle || 'Explore India'}
              </p>
            </div>
            <h1 className="text-5xl md:text-8xl lg:text-9xl font-serif md:font-serif tracking-tight text-white mb-6 md:mb-8 leading-[1.1] md:leading-[0.9]" style={{ textShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
              {baseDest?.name || id}
            </h1>
            
            {/* Action Bar (Desktop Only) */}
            <div className="hidden md:flex flex-wrap items-center gap-6 mt-8">
              <div className="flex -space-x-3 overflow-hidden">
                {baseDest?.images.slice(0, 3).map((img, i) => (
                  <img
                    key={i}
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-black/20 object-cover"
                    src={getDeliveredImageUrl(img, { width: 160, quality: 72, format: 'webp' })}
                    alt="Trip preview"
                    onError={(event) => {
                      const target = event.currentTarget;
                      if (target.dataset.fallbackApplied === '1') return;
                      target.dataset.fallbackApplied = '1';
                      target.src = img;
                    }}
                  />
                ))}
              </div>
              <p className="text-white/80 text-sm font-medium tracking-wide flex items-center gap-2">
                <span className="text-gold">1.2k+</span> travelers explored this month
              </p>
            </div>
          </Motion.div>
        </div>
        
        {/* Subtle Bottom Fog Transition */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/80 to-transparent z-10" />
      </div>

      {/* 
        ========================================================================
        CONTENT & ITINERARY SECTION
        ========================================================================
      */}
      <div className="w-full max-w-[1320px] mx-auto px-5 md:px-12 -mt-4 md:-mt-8 relative z-20">
        
        {/* Packages Selector */}
        {packages.length > 1 && (
          <div className="relative -mx-2 px-2 overflow-hidden print:hidden">
            <div className="flex overflow-x-auto gap-4 px-4 pb-8 no-scrollbar snap-x scroll-smooth">
              <div className="flex-shrink-0 w-2" />
              {packages.map((pkg, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActivePackageIndex(idx);
                    setExpandedDay(0);
                  }}
                  className={`snap-center whitespace-nowrap px-6 py-4 rounded-xl border backdrop-blur-md transition-all duration-300 text-sm font-bold tracking-wide flex-shrink-0 shadow-sm ${
                    activePackageIndex === idx 
                      ? 'bg-gold text-white border-gold shadow-lg shadow-gold/20' 
                      : 'bg-white border-black/5 text-[var(--text-muted)] hover:border-gold/30 hover:bg-white/95'
                  }`}
                >
                  {pkg.title}
                </button>
              ))}
              <div className="flex-shrink-0 w-8" />
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 mt-8">
          
          {/* Main Itinerary Content */}
          <div className="w-full lg:w-2/3">
            <Motion.div 
              key={activePackageIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{currentPackage.title}</h2>
                <div className="flex flex-wrap items-center gap-4 text-[var(--text-muted)] text-sm md:text-base">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-gold" />
                    <span>{baseDest?.name}</span>
                  </div>
                  {currentPackage.days.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-gold" />
                      <span>{currentPackage.days.length} Days Tour</span>
                    </div>
                  )}
                  {currentPackage.price && (
                    <div className="flex items-center gap-2">
                      <IndianRupee size={18} className="text-gold" />
                      <span className="font-semibold text-primary uppercase text-xs tracking-wider">
                        {currentPackage.price.replace(/[^\d]/g, '') 
                          ? `${Number(currentPackage.price.replace(/[^\d]/g, '')).toLocaleString('en-IN')} PER PERSON` 
                          : currentPackage.price.replace(/starting from/i, '').trim()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 print:hidden">
                <h3 className="text-2xl font-bold mb-6 tracking-tight">Day-wise Itinerary</h3>
                
                {currentPackage.days.length > 0 ? (
                  currentPackage.days.map((day, idx) => (
                    <div 
                      key={idx} 
                      className="border border-[var(--border-subtle)] rounded-2xl overflow-hidden bg-[var(--bg-surface)] transition-all duration-300"
                      style={{
                        boxShadow: expandedDay === idx ? '0 8px 30px rgba(0,0,0,0.06)' : 'none'
                      }}
                    >
                      <button
                        onClick={() => setExpandedDay(expandedDay === idx ? -1 : idx)}
                        className="w-full flex items-center justify-between p-5 md:p-6 text-left focus:outline-none"
                      >
                        <div className="flex items-center gap-4 md:gap-6 pr-4">
                          <div className="flex flex-col items-center justify-center shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)] text-gold">
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest leading-none mb-1">Day</span>
                            <span className="text-lg md:text-2xl font-bold leading-none">{day.day || idx + 1}</span>
                          </div>
                          <h4 className="text-base md:text-xl font-semibold leading-tight">{day.title}</h4>
                        </div>
                        <div className={`shrink-0 w-8 h-8 rounded-full border border-[var(--border-subtle)] flex items-center justify-center transition-transform duration-300 ${expandedDay === idx ? 'rotate-180 bg-[var(--text-body)] text-[var(--bg-base)]' : 'text-[var(--text-muted)]'}`}>
                          <ChevronDown size={18} />
                        </div>
                      </button>

                      <AnimatePresence>
                        {expandedDay === idx && (
                          <Motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                          >
                            <div className="px-5 pb-6 md:px-6 md:pb-8 pt-2 md:pt-0 ml-16 md:ml-22">
                              <ul className="space-y-4">
                                {day.activities.map((activity, aIdx) => (
                                  <li key={aIdx} className="flex gap-3 text-sm md:text-base text-[var(--text-muted)] leading-relaxed">
                                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gold shrink-0 block" />
                                    <span>{activity}</span>
                                  </li>
                                ))}
                              </ul>
                              {day.highlight && (
                                <div className="mt-6 p-4 rounded-xl bg-gold/10 border border-gold/20 inline-block">
                                  <p className="text-xs uppercase tracking-widest text-gold font-bold mb-1">Highlight of the day</p>
                                  <p className="text-sm font-medium text-primary">{day.highlight}</p>
                                </div>
                              )}
                            </div>
                          </Motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                ) : (
                  <p className="text-[var(--text-muted)] italic p-6 border border-[var(--border-subtle)] rounded-2xl">
                    Detailed itinerary currently being curated for this package.
                  </p>
                )}
              </div>

              {/* ── Inclusions ── */}
              <div className="mt-10 border border-[var(--border-subtle)] rounded-2xl overflow-hidden bg-[var(--bg-surface)]">
                <div className="p-5 md:p-6 flex items-center gap-3 border-b border-[var(--border-subtle)]" style={{ background: 'color-mix(in srgb, var(--color-gold) 6%, var(--bg-surface))' }}>
                  <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
                    <CircleCheck size={18} className="text-gold" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold tracking-tight" style={{ color: 'var(--text-heading)' }}>Inclusions</h3>
                </div>
                <ul className="p-5 md:p-6 space-y-3">
                  {[
                    'Accommodation in Hotel / Camp as per itinerary',
                    'Volvo tickets both side (if required)',
                    'Buffet breakfast and dinner on all days',
                    'Highly-Experienced driver cum guide',
                    'Sightseeing as per itinerary',
                    'All toll tax, parking, fuel and driver allowances',
                    'Any Permit fee if required',
                    'All applicable taxes',
                    'Comfortable and hygienic vehicle for sightseeing on all days as per the itinerary (as per group size)',
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm md:text-base text-[var(--text-body)] leading-relaxed">
                      <CircleCheck size={16} className="text-gold mt-1 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── Exclusions ── */}
              <div className="mt-5 border border-[var(--border-subtle)] rounded-2xl overflow-hidden bg-[var(--bg-surface)]">
                <div className="p-5 md:p-6 flex items-center gap-3 border-b border-[var(--border-subtle)]" style={{ background: 'color-mix(in srgb, var(--text-body) 4%, var(--bg-surface))' }}>
                  <div className="w-8 h-8 rounded-full bg-[var(--border-subtle)] flex items-center justify-center shrink-0">
                    <CircleX size={18} className="text-[var(--text-muted)]" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold tracking-tight" style={{ color: 'var(--text-heading)' }}>Exclusions</h3>
                </div>
                <ul className="p-5 md:p-6 space-y-3">
                  {[
                    '5% GST',
                    'Train or Airfare',
                    'Personal Expenses like Entry charges, Telephone, Fax, Internet, Laundry, etc.',
                    'Any Extra Meals',
                    'Any extra excursions or sightseeing apart from the tour itinerary',
                    'Any entry fees for the museum, park, Jeep safari or anything else',
                    'Room Heater Charges',
                    'Insurance',
                    'Anything which is not included in the inclusion',
                    'Expenses caused by factors beyond our control like rail and flight delays, roadblocks, vehicle malfunctions, political disturbances etc.',
                    'We shall not be responsible for any delays & alterations in the programme or expenses incurred – directly or indirectly – due to natural hazards, flight cancellations, weather, sickness, landslides, political closures (Strike, Hartal, Bandh) or any untoward incidents.',
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm md:text-base text-[var(--text-muted)] leading-relaxed">
                      <CircleX size={16} className="text-[var(--text-muted)] opacity-50 mt-1 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </Motion.div>
          </div>

          {/* Sticky Sidebar */}
          <div className="w-full lg:w-1/3 mt-8 lg:mt-0 print:hidden">
            <div className="sticky top-28 border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 md:p-8 rounded-3xl shadow-xl shadow-black/5">
              <h3 className="text-xl font-bold mb-2">Book Your Journey</h3>
              <p className="text-sm text-[var(--text-muted)] mb-6">Plan your perfect trip with our specialized tour captains.</p>
              
              <div className="mb-6 p-5 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-subtle)]">
                <span className="block text-xs uppercase tracking-widest text-[var(--text-muted)] mb-1">Package starting from</span>
                <span className="text-3xl font-bold text-gold">
                  {currentPackage.price && currentPackage.price.replace(/[^\d]/g, '') 
                    ? `₹${Number(currentPackage.price.replace(/[^\d]/g, '')).toLocaleString('en-IN')}` 
                    : "Enquire"}
                  {currentPackage.price && currentPackage.price.replace(/[^\d]/g, '') && (
                    <span className="text-sm text-[var(--text-muted)] font-normal tracking-normal ml-1">/pp</span>
                  )}
                </span>
              </div>

              <a
                href={`https://wa.me/919999022503?text=${encodeURIComponent(`Hi! I'm interested in the package:\n\n*${currentPackage.title}*\n📍 ${baseDest?.name || id}\n${currentPackage.price ? `💰 ${currentPackage.price}` : ''}\n\nPlease share more details.`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-full bg-[#25D366] text-white font-bold tracking-wide transition-transform hover:-translate-y-1 active:translate-y-0 mb-4 shadow-[0_10px_20px_rgba(37,211,102,0.25)] text-sm uppercase"
              >
                <FaWhatsapp size={22} />
                Enquire on WhatsApp
              </a>
              <button 
                type="button" 
                onClick={async () => {
                  const { generateItineraryPDF } = await import('../../utils/generateItineraryPDF');
                  await generateItineraryPDF({
                    destinationName: baseDest?.name || id,
                    subtitle: baseDest?.subtitle || '',
                    packageData: currentPackage,
                  });
                }}
                className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-full border border-[var(--border-subtle)] text-[var(--text-body)] text-sm font-semibold uppercase tracking-widest hover:bg-[var(--border-subtle)] transition-colors duration-300"
              >
                <Download size={18} />
                Download PDF
              </button>
              
              <p className="text-xs text-center text-[var(--text-muted)] mt-6">
                Flexible cancellation available. Free rescheduling up to 7 days before departure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetails;
