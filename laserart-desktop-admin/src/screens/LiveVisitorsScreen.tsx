import React, { useEffect, useState } from 'react';
import { db, collection, query, orderBy, limit, onSnapshot, where } from '../utils/firebase';
import { Wifi, Smartphone, Monitor, Tablet, MapPin } from 'lucide-react';
import { COLLECTIONS, toSafeDate } from '../utils/firestoreData';

interface LiveVisitor {
    id: string;
    device: string;
    location: string;
    pages: string;
    duration: string;
    cartCount: number;
    lastActive: string;
    ip?: string;
}

const DeviceIcon = ({ device }: { device: string }) => {
    const d = (device || '').toLowerCase();
    if (d.includes('mobile')) return <Smartphone size={14} />;
    if (d.includes('tablet')) return <Tablet size={14} />;
    return <Monitor size={14} />;
};

const LiveVisitorsScreen: React.FC = () => {
    const [visitors, setVisitors] = useState<LiveVisitor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) return;

        // Fetch all visitors from the last 24 hours for history
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const q = query(
            collection(db, COLLECTIONS.visitors), 
            where('lastActive', '>=', dayAgo),
            orderBy('lastActive', 'desc'), 
            limit(100)
        );

        const unsub = onSnapshot(q, snapshot => {
            updateVisitors(snapshot);
        }, (err) => {
            console.error("Visitors List Error:", err);
        });


        // Force refresh every 10s to update "Online now" vs "X ago" status
        const interval = setInterval(() => {
            // Re-processing the same snapshot data triggers a re-render with new "now" time
            setVisitors(prev => [...prev]);
        }, 10000);

        return () => {
            unsub();
            clearInterval(interval);
        };
    }, []);

    const updateVisitors = (snapshot: any) => {
        const now = new Date();
        const items: LiveVisitor[] = [];

        snapshot.forEach((d: any) => {
            const data = d.data();
            const lastActiveDate = toSafeDate(data.lastActive);
            const diffMs = now.getTime() - lastActiveDate.getTime();
            
            const isRecentlyActive = diffMs < 1 * 60 * 1000;
            const isLive = isRecentlyActive;

            const diffSec = Math.floor(diffMs / 1000);
            let lastActiveStr = 'Just now';
            if (diffSec > 5) {
                lastActiveStr = diffSec < 60 ? `${diffSec}s ago` : 
                               diffSec < 3600 ? `${Math.floor(diffSec / 60)}m ago` : 
                               `${Math.floor(diffSec / 3600)}h ago`;
            }
            
            items.push({
                id: d.id,
                device: data.device || 'Unknown',
                location: `${data.location?.city || 'Unknown'}, ${data.location?.country || '??'}`,
                pages: data.pagesViewed ? data.pagesViewed.join(' → ') : 'Home',
                duration: data.durationSec ? `${Math.floor(data.durationSec / 60)}m ${data.durationSec % 60}s` : 'Active',
                cartCount: data.activeCartCount || 0,
                lastActive: isLive ? 'Online now' : lastActiveStr,
                ip: data.ip || undefined,
            });
        });

        setVisitors(items);
        setLoading(false);
    };


    const liveCount = visitors.filter(v => v.lastActive === 'Online now').length;

    return (
        <div className="screen">
            <div className="screen-header">
                <div>
                    <h1 className="screen-title">Visitors</h1>
                    <p className="screen-subtitle">{liveCount} live · {visitors.length} total today</p>
                </div>
                <div className="live-badge">
                    <span className="live-dot" />
                    HISTORY
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner" />
                    <p>Fetching traffic logs...</p>
                </div>
            ) : visitors.length === 0 ? (
                <div className="empty-state">
                    <Wifi size={40} className="empty-state__icon" />
                    <p className="empty-state__title">No activity recorded</p>
                    <p className="empty-state__sub">Traffic will appear here when customers visit</p>
                </div>
            ) : (
                <div className="visitor-list">
                    {visitors.map(v => (
                        <div key={v.id} className={`visitor-card ${v.lastActive === 'Online now' ? 'border-l-2 border-green' : 'opacity-80'}`}>
                            <div className="visitor-card__header">
                                <div className="visitor-card__device">
                                    <DeviceIcon device={v.device} />
                                    <span>{v.device}</span>
                                </div>
                                <div className="visitor-status">
                                    {v.lastActive === 'Online now' && <span className="live-dot live-dot--sm" />}
                                    <span className={`visitor-status__time ${v.lastActive === 'Online now' ? 'text-green font-bold' : ''}`}>{v.lastActive}</span>
                                </div>
                            </div>

                            <div className="visitor-card__location">
                                <MapPin size={12} />
                                <span>{v.location}</span>
                            </div>

                            <div className="visitor-card__pages">
                                <span className="visitor-card__label">Path:</span>
                                <span className="visitor-card__pages-text truncate block">{v.pages}</span>
                            </div>

                            <div className="visitor-card__footer">
                                <span className="visitor-card__duration">⏱ {v.duration}</span>
                                {v.cartCount > 0 && (
                                    <span className="visitor-card__cart">
                                        🛒 {v.cartCount} item{v.cartCount > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LiveVisitorsScreen;
