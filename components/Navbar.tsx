
import React from 'react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: 'home' | 'customize' | 'car-silhouettes') => void;
  cartCount: number;
  onOpenCart: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, cartCount, onOpenCart }) => {
  return (
    <nav className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center cursor-pointer gap-3 group" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 flex items-center justify-center transition-all duration-500 group-hover:scale-110">
              <img src="/images/logo.webp" alt="LaserArtLB" className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-[0.2em] font-heading silver-gradient leading-none">
                LASERARTLB
              </span>
              <span className="text-[7px] font-bold text-zinc-600 tracking-[0.4em] uppercase">Beirut • Lebanon</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 md:space-x-8">
            <button onClick={() => setActiveTab('home')} className={`text-[9px] uppercase tracking-[0.3em] font-black transition-all ${activeTab === 'home' ? 'text-white' : 'text-zinc-600 hover:text-white'}`}>Home</button>
            <button onClick={() => setActiveTab('customize')} className={`text-[9px] uppercase tracking-[0.3em] font-black transition-all ${activeTab === 'customize' ? 'text-white' : 'text-zinc-600 hover:text-white'}`}>Shop</button>
            <div className="h-4 w-px bg-zinc-800"></div>
            <button onClick={() => setActiveTab('car-silhouettes')} className={`text-[9px] uppercase tracking-[0.3em] font-black transition-all ${activeTab === 'car-silhouettes' ? 'text-white' : 'text-zinc-600 hover:text-white'}`}>
              Car Art
            </button>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onOpenCart} className="relative p-2 text-zinc-500 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-white text-black text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
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
