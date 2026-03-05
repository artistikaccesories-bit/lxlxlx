import React, { useState, useEffect } from 'react';

const LiveVisitorCounter: React.FC = () => {
    const [visitors, setVisitors] = useState(1);

    useEffect(() => {
        // Initialize with a random number between 1 and 5 to keep it believable
        setVisitors(Math.floor(Math.random() * 4) + 2); // 2 to 5

        // Slowly, randomly fluctuate the number to make it look alive, but never exceeding 5
        const interval = setInterval(() => {
            setVisitors(prev => {
                const change = Math.random() > 0.5 ? 1 : -1;
                let next = prev + change;
                if (next < 1) next = 1;
                if (next > 5) next = 5;
                return next;
            });
        }, 15000); // Update every 15 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-zinc-950 text-zinc-300 py-1.5 px-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 border-b border-white/5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            <span>{visitors} {visitors === 1 ? 'person is' : 'people are'} viewing this site</span>
        </div>
    );
};

export default LiveVisitorCounter;
