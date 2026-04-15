import React from 'react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: 'home' | 'customize') => void;
  cartCount: number;
  onOpenCart: () => void;
  onToggleSearch: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, cartCount, onOpenCart, onToggleSearch }) => {
  return (
    <nav className="sticky top-0 z-50 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 md:h-24">
          {/* Logo Section */}
          <div className="flex items-center cursor-pointer gap-2 md:gap-4 group shrink-0" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-white/5 rounded-full blur-md group-hover:bg-white/10 transition-all duration-500"></div>
              <img src="/images/logo.webp" alt="LaserArtLB" fetchpriority="high" loading="eager" className="w-full h-full object-contain relative z-10 filter brightness-200" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] md:text-xl font-black tracking-[0.2em] font-heading text-white leading-none relative">
                <span className="absolute -inset-1 blur-sm bg-white/10 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></span>
                <span className="relative z-10">LASERARTLB</span>
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-3 md:space-x-12">
            {['home', 'customize'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`relative py-2 text-[10px] md:text-[12px] uppercase tracking-[0.25em] font-bold transition-all duration-300 group ${
                  activeTab === tab ? 'text-white' : 'text-zinc-500 hover:text-white'
                }`}
              >
                {tab === 'customize' ? 'Shop' : 'Home'}
                <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-white transform origin-left transition-transform duration-500 ${activeTab === tab ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 md:gap-8">
            <button onClick={onToggleSearch} className="relative p-2 text-zinc-400 hover:text-white transition-all group scale-90 md:scale-100">
              <div className="absolute inset-0 bg-white/5 rounded-full scale-0 group-hover:scale-125 transition-transform duration-300"></div>
              <svg className="w-5 h-5 md:w-6 md:h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            <button onClick={onOpenCart} className="relative p-2 text-zinc-400 hover:text-white transition-all group scale-90 md:scale-100">
              <div className="absolute inset-0 bg-white/5 rounded-full scale-0 group-hover:scale-125 transition-transform duration-300"></div>
              <svg className="w-5 h-5 md:w-6 md:h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 md:-top-0.5 md:-right-0.5 w-5 h-5 bg-white text-black text-[10px] md:text-[11px] font-black rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.4)] animate-pulse-slow">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
