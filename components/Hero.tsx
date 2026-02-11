
import React, { useState, useEffect } from 'react';
import ParticlesBackground from './ParticlesBackground';

interface HeroProps {
  onExplore: () => void;
}

const Hero: React.FC<HeroProps> = ({ onExplore }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = 500;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-[85vh] flex items-center overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <ParticlesBackground />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black"></div>
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-up">
        {/* Animated Customer Counter */}
        <div className="flex items-center gap-4 mb-8 bg-white/5 p-2 pr-6 rounded-full w-fit mx-auto border border-white/10 backdrop-blur-md">
          <div className="flex -space-x-4">
            {[
              'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=150&auto=format&fit=crop', // Man with glasses
              'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop', // Business woman
              'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop', // Man portrait
              'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=150&auto=format&fit=crop'  // Smiling man
            ].map((src, i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 overflow-hidden">
                <img src={src} alt={`Customer ${i + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <div className="text-left">
            <span className="block text-white text-sm"><span className="silver-gradient font-semibold">{count}+</span> Happy</span>
            <span className="block text-zinc-400 text-xs">Customers</span>
          </div>
        </div>

        <h1 className="text-6xl md:text-[9rem] font-black mb-8 tracking-tighter leading-[0.85] font-heading silver-gradient">
          CRAFT YOUR <br />
          LEGACY.
        </h1>

        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-14 leading-relaxed tracking-tight font-medium">
          Premium stainless steel engraving for those who value permanence. <br />
          <span className="text-white font-bold">Keychains • Accessories • Gifts</span>
        </p>

        <div className="flex justify-center">
          <button
            onClick={onExplore}
            className="px-20 py-6 bg-white text-black font-black uppercase tracking-[0.4em] text-[10px] rounded-full hover:bg-zinc-200 transition-all transform hover:-translate-y-1 active:scale-95 silver-glow"
          >
            Start Creating
          </button>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
      </div>
    </div>
  );
};

export default Hero;
