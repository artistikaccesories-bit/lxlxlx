import React, { useState, useEffect } from 'react';
import { db, collection, query, onSnapshot, Timestamp, orderBy, limit } from '../src/utils/firebase';

const LiveVisitorCounter: React.FC = () => {
    const [visitors, setVisitors] = useState(1);

    useEffect(() => {
        if (!db) {
            // Fallback for mock mode
            setVisitors(Math.floor(Math.random() * 4) + 2);
            const interval = setInterval(() => {
                setVisitors(prev => {
                    const change = Math.random() > 0.5 ? 1 : -1;
                    let next = prev + change;
                    if (next < 1) next = 1;
                    if (next > 5) next = 5;
                    return next;
                });
            }, 15000);
            return () => clearInterval(interval);
        }

        const visitorsRef = collection(db, "visitors");
        // Only fetch visitors active in the last 10 minutes to save bandwidth/cost
        const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
        const q = query(visitorsRef, orderBy("lastActive", "desc"), limit(20)); // Just get the 20 most recent

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const now = Date.now();
            let liveCount = 0;
            snapshot.forEach(doc => {
                const data = doc.data();
                const lastActive = data.lastActive ? data.lastActive.toDate().getTime() : 0;
                // Active if seen in the last 5 minutes
                if (now - lastActive < 5 * 60 * 1000) {
                    liveCount++;
                }
            });
            setVisitors(Math.max(1, liveCount));
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="bg-zinc-950 text-zinc-300 py-1.5 px-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 border-b border-white/5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            <span>{visitors} {visitors === 1 ? 'person is' : 'people are'} viewing this site</span>
        </div>
    );
};

export default LiveVisitorCounter;
