import React, { useState } from 'react';

const CustomPreview: React.FC = () => {
    const [previewText, setPreviewText] = useState('YOUR NAME');

    return (
        <section className="py-24 px-4 relative bg-black border-t border-white/5 overflow-hidden">
            {/* Dynamic Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.05)_0%,_transparent_70%)] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
                <div className="flex-1 w-full text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-widest mb-6">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                        Live Preview Studio
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black font-heading text-white mb-6 uppercase tracking-tighter leading-none">
                        See Your <br className="hidden md:block" />
                        <span className="text-zinc-500">Vision Reality.</span>
                    </h2>
                    <p className="text-zinc-400 max-w-md text-lg mx-auto md:mx-0 mb-10 leading-relaxed font-light">
                        Type your name, an important date, or a motivational quote. Instantly visualize your custom steel engraving.
                    </p>

                    <div className="max-w-md mx-auto md:mx-0 relative group">
                        <div className="absolute -inset-1 bg-white/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                        <input
                            type="text"
                            maxLength={20}
                            value={previewText}
                            onChange={(e) => setPreviewText(e.target.value.toUpperCase())}
                            placeholder="ENTER TEXT HERE"
                            className="relative w-full bg-zinc-900 border border-white/10 rounded-2xl px-6 py-5 text-xl font-black text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/40 transition-all font-heading tracking-widest uppercase text-center md:text-left"
                        />
                    </div>
                </div>

                <div className="flex-1 w-full flex justify-center mt-10 md:mt-0">
                    <div className="relative w-full max-w-sm aspect-square bg-zinc-900/50 rounded-full flex items-center justify-center p-8 border border-white/5 shadow-[0_0_50px_rgba(255,255,255,0.03)] group transition-all duration-700 hover:border-white/10">
                        {/* The actual keychain preview representation */}
                        <div className="relative w-full aspect-[2/3] bg-gradient-to-br from-zinc-300 via-zinc-400 to-zinc-600 rounded-lg shadow-2xl overflow-hidden transform group-hover:-rotate-3 transition-transform duration-700 flex items-center justify-center">
                            {/* Silver reflections */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000"></div>

                            {/* Engraved text */}
                            <div
                                className="text-black/80 font-black tracking-widest font-heading absolute w-full text-center px-4 transform rotate-90"
                                style={{
                                    fontSize: previewText.length > 10 ? '1.25rem' : '1.75rem',
                                    textShadow: '0px 1px 1px rgba(255,255,255,0.5), 0px -1px 1px rgba(0,0,0,0.3)',
                                    mixBlendMode: 'multiply'
                                }}
                            >
                                {previewText || 'YOUR NAME'}
                            </div>

                            {/* Keychain hole */}
                            <div className="absolute top-4 w-4 h-4 rounded-full bg-zinc-900 shadow-inner"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CustomPreview;
