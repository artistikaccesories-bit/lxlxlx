
import React, { useState, useEffect } from 'react';

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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black"></div>
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-up">
        {/* Animated Customer Counter */}
        <div className="inline-flex items-center gap-4 px-6 py-2.5 rounded-full glass mb-8 border-white/10 silver-glow">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-zinc-500 to-zinc-900"></div>
              </div>
            ))}
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-black text-white">
            <span className="silver-gradient text-sm">{count}+</span> Happy Customers
          </span>
        </div>
        
        <h1 className="text-6xl md:text-[10rem] font-black mb-8 tracking-tighter leading-[0.85] font-heading silver-gradient">
          CUSTOM <br />
          STEEL.
        </h1>
        
        <p className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto mb-14 leading-relaxed tracking-tight font-medium">
          Precision laser engineering meets bespoke Lebanese craftsmanship. <br/>
          Turn everyday items into permanent legacies.
        </p>

        <div className="flex justify-center">
          <button 
            onClick={onExplore}
            className="px-20 py-6 bg-white text-black font-black uppercase tracking-[0.4em] text-[10px] rounded-full hover:bg-zinc-200 transition-all transform hover:-translate-y-1 active:scale-95 silver-glow"
          >
            Explore Studio
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
