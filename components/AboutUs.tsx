
import React from 'react';

const AboutUs: React.FC = () => {
    return (
        <section className="py-24 px-4 bg-zinc-950 border-t border-white/5 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-black font-heading silver-gradient mb-8 uppercase tracking-tighter">About Us</h2>

                        <div className="space-y-6 text-zinc-400 text-sm md:text-base leading-relaxed font-medium">
                            <p>
                                At <span className="text-white font-bold">LASERARTLB</span>, we don't just make keychains; we forge permanent statements.
                                We specialize in <span className="text-white">high-quality laser cutting and engraving</span>, transforming raw surgical-grade steel into personalized masterpieces that last a lifetime.
                            </p>
                            <p>
                                Our journey started with perfecting the humble keychain—taking a daily essential and elevating it into a luxury item.
                                But we are just getting started.
                            </p>

                            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl mt-8">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-4">Coming Soon to the Studio</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                        <span><span className="text-white font-bold">Picture Silhouettes</span> — Your favorite photos turned into metal art.</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                        <span><span className="text-white font-bold">Car Silhouettes</span> — Indestructible replicas of your dream rides.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="aspect-square rounded-[3rem] overflow-hidden glass border-white/10 relative">
                            {/* Abstract representation of laser process since we might not have a photo yet */}
                            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center">
                                <div className="relative w-full h-full">
                                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/20"></div>
                                    <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white/20"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-32 h-32 border-2 border-white/50 rounded-full animate-pulse"></div>
                                    </div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-[0.5em] text-white/50">
                                        Precision in Progress
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Floating badge */}
                        <div className="absolute -bottom-6 -left-6 glass px-8 py-4 rounded-full border border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Est. 2024 • Lebanon</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
