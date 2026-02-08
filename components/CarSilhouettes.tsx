
import React, { useState } from 'react';

const CarSilhouettes: React.FC = () => {
    const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium');
    const [carModel, setCarModel] = useState('');

    const pricing = {
        small: { price: 50, size: 'Small (50cm)' },
        medium: { price: 60, size: 'Medium (60cm)' },
        large: { price: 70, size: 'Large (90cm)' }
    };

    const handleRequest = () => {
        if (!carModel) return;
        const { size, price } = pricing[selectedSize];
        const message = `I am interested in a Custom Car Silhouette:\n\n*Car Model:* ${carModel}\n*Size:* ${size}\n*Price:* $${price}`;
        window.open(`https://wa.me/96181388115?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-zinc-950 text-white font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-red-500 font-bold tracking-[0.3em] text-xs uppercase mb-4 block animate-pulse">Now Available</span>
                    <h2 className="text-4xl md:text-7xl font-black font-heading text-white mb-6 tracking-tighter">
                        THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 to-zinc-600">SILHOUETTE</span>
                        <br />
                        <span className="text-zinc-800">PROJECT</span>
                    </h2>
                    <p className="text-zinc-400 text-lg leading-relaxed max-w-xl mx-auto">
                        Transform your passion into a masterpiece. Laser-cut steel profiles of your favorite machine, available in three perfect sizes.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Visual Preview */}
                    <div className="relative group">
                        <div className="aspect-video bg-zinc-900 rounded-[2rem] border border-white/10 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-950 to-zinc-950"></div>
                            {/* Placeholder for car silhouette visual - using the existing car image or a generic SVG */}
                            <div className="absolute inset-0 bg-[url('/images/car.jpeg')] bg-cover bg-center opacity-50 grayscale group-hover:grayscale-0 transition-all duration-700 mix-blend-overlay"></div>

                            <div className="relative z-10 w-full px-12">
                                {/* SVG Representation of a silhouette (abstract) */}
                                <svg className="w-full h-auto text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" viewBox="0 0 400 100" fill="currentColor">
                                    <path d="M40.5,65.5 C40.5,65.5 60.5,45.5 90.5,40.5 C120.5,35.5 150.5,25.5 180.5,25.5 C210.5,25.5 260.5,25.5 290.5,35.5 C320.5,45.5 340.5,65.5 340.5,65.5 L40.5,65.5 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                                    <path d="M50,65 A10,10 0 0 1 70,65" fill="none" stroke="currentColor" strokeWidth="2" />
                                    <path d="M310,65 A10,10 0 0 1 330,65" fill="none" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                <div className="text-center mt-4">
                                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                                        {pricing[selectedSize].size} Visualization
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Configuration Panel */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[2rem] p-8 md:p-12">
                        <h3 className="text-2xl font-black font-heading mb-8">Configure Your Art</h3>

                        {/* Size Selection */}
                        <div className="mb-10">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 block">Select Size</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {(['small', 'medium', 'large'] as const).map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden group ${selectedSize === size
                                                ? 'bg-white border-white text-black'
                                                : 'bg-black/50 border-white/10 text-zinc-400 hover:border-white/30'
                                            }`}
                                    >
                                        <span className="block text-sm font-black uppercase mb-1">{pricing[size].size.split(' ')[0]}</span>
                                        <span className="block text-xs opacity-70 mb-2">{pricing[size].size.match(/\((.*?)\)/)?.[1]}</span>
                                        <span className={`block text-lg font-mono font-bold ${selectedSize === size ? 'text-black' : 'text-white'}`}>
                                            ${pricing[size].price}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Car Model Input */}
                        <div className="mb-10">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 block">Car Model</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={carModel}
                                    onChange={(e) => setCarModel(e.target.value)}
                                    placeholder="e.g. Porsche 911 GT3 RS..."
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-6 py-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-white/50 transition-all text-lg"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Totals & Action */}
                        <div className="pt-8 border-t border-white/10">
                            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                                <div className="text-center md:text-left">
                                    <span className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Estimated Total</span>
                                    <span className="block text-4xl font-black font-heading silver-gradient">${pricing[selectedSize].price}</span>
                                </div>
                                <button
                                    onClick={handleRequest}
                                    disabled={!carModel}
                                    className="w-full md:w-auto px-12 py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-xs rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                >
                                    Request Design
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarSilhouettes;
