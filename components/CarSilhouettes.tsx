import React, { useState } from 'react';
import { CAR_DESIGNS } from '../src/data/carDesigns';

interface CarSilhouettesProps {
    onBack: () => void;
}

const CarSilhouettes: React.FC<CarSilhouettesProps> = ({ onBack }) => {
    const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium');
    const [carModel, setCarModel] = useState('');

    // Promo Code State
    const [promoCode, setPromoCode] = useState('');
    const [discountApplied, setDiscountApplied] = useState(false);
    const [promoError, setPromoError] = useState('');

    const pricing = {
        small: { price: 50, size: 'Small (50cm)' },
        medium: { price: 75, size: 'Medium (70cm)' },
        large: { price: 87.5, size: 'Large (90cm)' }
    };

    // Find if the entered model exists in our database (case-insensitive)
    const matchedDesign = carModel.length > 2
        ? CAR_DESIGNS.find(d => d.model.toLowerCase().includes(carModel.toLowerCase()))
        : null;

    const handleApplyPromo = () => {
        if (promoCode.trim().toUpperCase() === 'LASER20') {
            setDiscountApplied(true);
            setPromoError('');
        } else {
            setPromoError('Invalid code');
            setDiscountApplied(false);
        }
    };

    const getCurrentPrice = () => {
        const basePrice = pricing[selectedSize].price;
        if (discountApplied) {
            // Apply 20% discount
            return basePrice * 0.8;
        }
        return basePrice;
    };

    const handleRequest = () => {
        if (!carModel) return;
        const { size } = pricing[selectedSize];
        const finalPrice = getCurrentPrice();

        // If we found a design, mention it in the message
        const specificDesign = matchedDesign
            ? `\n*Selected Design:* ${matchedDesign.model} (ID: ${matchedDesign.id})`
            : '';

        let message = `I am interested in a Custom Car Silhouette:\n\n*Car Model:* ${carModel}\n*Size:* ${size}`;

        if (discountApplied) {
            message += `\n*Price:* $${pricing[selectedSize].price}\n*Discount (LASER20):* -20%\n*Final Price:* $${finalPrice}`;
        } else {
            message += `\n*Price:* $${finalPrice}`;
        }

        message += `${specificDesign}`;

        window.open(`https://wa.me/96181388115?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-zinc-950 text-white font-sans relative">
            {/* Mobile Back Button */}
            <button
                onClick={onBack}
                className="md:hidden fixed top-28 left-4 z-50 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors bg-black/50 backdrop-blur-md px-3 py-2 rounded-full border border-white/10"
                aria-label="Back to home"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-widest">Back</span>
            </button>

            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">

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
                        <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-1000 animate-pulse"></div>
                        <div className="aspect-video bg-zinc-900 rounded-[2rem] flex items-center justify-center relative overflow-hidden ring-1 ring-white/5 group-hover:ring-white/10 transition-all">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/10 via-zinc-950/50 to-zinc-950"></div>

                            <div className="w-full h-full flex items-center justify-center">
                                {matchedDesign ? (
                                    <div className="w-full h-full bg-contain bg-no-repeat bg-center transition-all duration-700"
                                        style={{ backgroundImage: `url('${matchedDesign.image}')` }}>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 bg-[url('/images/car.jpeg')] bg-cover bg-center transition-all duration-700" loading="lazy"></div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Configuration Panel */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-[2rem] p-6 md:p-12">
                        <h3 className="text-xl md:text-2xl font-black font-heading mb-6 md:mb-8">Configure Your Art</h3>

                        {/* Size Selection */}
                        <div className="mb-6 md:mb-10">
                            <label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 block">Select Size</label>
                            <div className="grid grid-cols-3 gap-2 md:gap-4">
                                {(['small', 'medium', 'large'] as const).map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`p-2 md:p-4 rounded-lg md:rounded-xl border transition-all duration-300 relative overflow-hidden group ${selectedSize === size
                                            ? 'bg-white border-white text-black'
                                            : 'bg-black/50 border-white/10 text-zinc-400 hover:border-white/30'
                                            }`}
                                    >
                                        <span className="block text-[10px] md:text-sm font-black uppercase mb-0.5 md:mb-1">{pricing[size].size.split(' ')[0]}</span>
                                        <span className="block text-[8px] md:text-xs opacity-70 mb-1 md:mb-2">{pricing[size].size.match(/\((.*?)\)/)?.[1]}</span>
                                        <span className={`block text-sm md:text-lg font-mono font-bold ${selectedSize === size ? 'text-black' : 'text-white'}`}>
                                            ${pricing[size].price}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Car Model Input */}
                        <div className="mb-8 md:mb-10">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 block">Car Model</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={carModel}
                                    onChange={(e) => setCarModel(e.target.value)}
                                    placeholder="e.g. Porsche 911 GT3 RS..."
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-3 md:px-6 md:py-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-white/50 transition-all text-base md:text-lg"
                                />
                                {matchedDesign && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info Notices */}
                        <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/5 text-xs text-zinc-400 space-y-1">
                            <p>• Production time: <span className="text-white">up to 10 days</span></p>
                            <p>• Delivery: <span className="text-white">$4 - $6</span></p>
                        </div>

                        {/* Promo Code Input */}
                        <div className="mb-8">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="PROMO CODE"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white flex-grow focus:outline-none focus:border-white/30 uppercase"
                                />
                                <button
                                    onClick={handleApplyPromo}
                                    disabled={!promoCode || discountApplied}
                                    className="px-4 py-2 bg-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {discountApplied ? 'APPLIED' : 'APPLY'}
                                </button>
                            </div>
                            {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}
                            {discountApplied && <p className="text-green-500 text-xs mt-2">Discount Applied: 20% OFF</p>}
                        </div>


                        {/* Totals & Action */}
                        <div className="pt-6 md:pt-8 border-t border-white/10">
                            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                                <div className="text-center md:text-left">
                                    <span className="block text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Estimated Total</span>
                                    <div className="flex items-center gap-2">
                                        {discountApplied && (
                                            <span className="block text-xl md:text-2xl font-bold text-zinc-500 line-through decoration-red-500 decoration-2">${pricing[selectedSize].price}</span>
                                        )}
                                        <span className={`block text-3xl md:text-4xl font-black font-heading silver-gradient ${discountApplied ? 'text-green-500' : ''}`}>
                                            ${getCurrentPrice()}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleRequest}
                                    disabled={!carModel}
                                    className="w-full md:w-auto px-10 py-4 md:px-12 md:py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] md:text-xs rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                >
                                    {matchedDesign ? 'Order Design' : 'Request Design'}
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
