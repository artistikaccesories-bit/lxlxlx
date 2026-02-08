
import React from 'react';

const ComingSoon: React.FC = () => {
    return (
        <section className="py-24 bg-zinc-950 relative overflow-hidden border-t border-white/5">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-white blur-[150px] rounded-full"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="w-full md:w-1/2">
                        <span className="text-red-500 font-bold tracking-[0.3em] text-xs uppercase mb-4 block animate-pulse">Coming Soon</span>
                        <h2 className="text-5xl md:text-7xl font-black font-heading text-white mb-6 tracking-tighter">
                            THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-600">SILHOUETTE</span>
                            <br />
                            <span className="text-zinc-800">PROJECT</span>
                        </h2>
                        <div className="h-1 w-24 bg-red-500 mb-8"></div>
                        <p className="text-zinc-400 text-lg leading-relaxed max-w-md mb-8">
                            We are translating automotive passion into wall art.
                            Laser-cut steel profiles of iconic machines.
                        </p>

                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <span className="block text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Scale</span>
                                <span className="block text-white font-mono text-xl">90cm Width</span>
                            </div>
                            <div>
                                <span className="block text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Price Range</span>
                                <span className="block text-white font-mono text-xl">$50 - $90</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <input
                                type="text"
                                id="carRequest"
                                placeholder="E.g., BMW M3 E46..."
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 flex-grow"
                            />
                            <button
                                onClick={() => {
                                    const car = (document.getElementById('carRequest') as HTMLInputElement).value;
                                    if (car) window.open(`https://wa.me/96181388115?text=${encodeURIComponent('I am interested in a custom car silhouette for: ' + car)}`, '_blank');
                                }}
                                className="px-6 py-3 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-xl hover:bg-zinc-200 transition-all whitespace-nowrap"
                            >
                                Request Design
                            </button>
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 relative">
                        <div className="aspect-video bg-zinc-900 rounded-3xl border border-white/10 flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[url('/images/car.jpeg')] bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent"></div>

                            <div className="relative z-10 text-center">
                                <svg className="w-20 h-20 text-white/20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                <span className="text-white/50 font-black uppercase tracking-[0.5em] text-sm">Automotive Art</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ComingSoon;
