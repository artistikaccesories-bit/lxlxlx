import React, { useEffect, useState } from 'react';
import { db, collection, query, orderBy, limit, onSnapshot, where, getDocs } from '../utils/firebase';
import { 
    Users, ShoppingCart, TrendingUp, Smartphone, MapPin, 
    Activity, DollarSign, Target, MousePointer2, Package, 
    ShoppingBag, AlertCircle, ArrowUpRight, ArrowDownRight, Clock
} from 'lucide-react';

interface Stats {
    totalVisitors: number;
    todayVisitors: number;
    activeCarts: number;
    liveVisitors: number;
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    lowStockCount: number;
    topDevice: string;
    topCity: string;
    hourlyDistribution: Record<number, number>;
}

interface RecentOrder {
    id: string;
    orderId: string;
    total: number;
    status: string;
    timestamp: any;
}

const DashboardScreen: React.FC = () => {
    const [stats, setStats] = useState<Stats>({
        totalVisitors: 0, todayVisitors: 0, activeCarts: 0,
        liveVisitors: 0, totalOrders: 0, totalRevenue: 0, 
        pendingOrders: 0, lowStockCount: 0,
        topDevice: '—', topCity: '—', hourlyDistribution: {}
    });
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [lastUpdate, setLastUpdate] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) return;

        // 1. Visitors & Real-time Stats
        const visitorsRef = collection(db, 'visitors');
        const qVisitors = query(visitorsRef, orderBy('timestamp', 'desc'), limit(200));

        const unsubVisitors = onSnapshot(qVisitors, (snapshot) => {
            const now = new Date();
            let todayCount = 0, activeCarts = 0, liveVisitors = 0;
            const hourlyData: Record<number, number> = {};
            const topCities: Record<string, number> = {};
            const topDevices: Record<string, number> = {};

            snapshot.forEach(d => {
                const data = d.data();
                
                const getSafeDate = (val: any) => {
                    if (val && typeof val.toDate === 'function') return val.toDate();
                    if (val && val.seconds) return new Date(val.seconds * 1000);
                    if (val instanceof Date) return val;
                    return new Date();
                };

                const date = getSafeDate(data.timestamp);
                const isToday = date.toDateString() === now.toDateString();
                if (isToday) {
                    todayCount++;
                    const hour = date.getHours();
                    hourlyData[hour] = (hourlyData[hour] || 0) + 1;
                }
                const lastActive = getSafeDate(data.lastActive || data.timestamp);
                const isLive = data.isActive === true && (now.getTime() - lastActive.getTime()) < 3 * 60 * 1000;
                if (isLive) {
                    liveVisitors++;
                    if (data.activeCartCount > 0) activeCarts++;
                }
                const city = data.location?.city || 'Unknown';
                topCities[city] = (topCities[city] || 0) + 1;
                const device = data.device || 'Unknown';
                topDevices[device] = (topDevices[device] || 0) + 1;
            });

            const topCity = Object.keys(topCities).sort((a, b) => topCities[b] - topCities[a])[0] || '—';
            const topDevice = Object.keys(topDevices).sort((a, b) => topDevices[b] - topDevices[a])[0] || '—';

            setStats(prev => ({ 
                ...prev,
                totalVisitors: snapshot.size, 
                todayVisitors: todayCount, 
                activeCarts, 
                liveVisitors, 
                topDevice, 
                topCity, 
                hourlyDistribution: hourlyData 
            }));
            setLastUpdate(now.toLocaleTimeString());
        });

        // 2. Orders & Revenue Stats
        const ordersRef = collection(db, 'orders');
        const unsubOrders = onSnapshot(ordersRef, (snapshot) => {
            let totalRev = 0;
            let pendingCount = 0;
            const recent: RecentOrder[] = [];

            snapshot.forEach(d => {
                const data = d.data();
                totalRev += Number(data.total) || 0;
                if (data.status === 'pending') pendingCount++;
                
                recent.push({
                    id: d.id,
                    orderId: data.orderId,
                    total: data.total,
                    status: data.status,
                    timestamp: data.timestamp
                });
            });

            // Sort and limit recent orders
            recent.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
            setRecentOrders(recent.slice(0, 5));

            setStats(prev => ({
                ...prev,
                totalOrders: snapshot.size,
                totalRevenue: totalRev,
                pendingOrders: pendingCount
            }));
        });

        // 3. Inventory Health
        const productsRef = collection(db, 'products');
        const unsubProducts = onSnapshot(productsRef, (snapshot) => {
            let lowStock = 0;
            snapshot.forEach(d => {
                const data = d.data();
                if (data.stock !== undefined && data.stock <= 5) lowStock++;
            });
            setStats(prev => ({ ...prev, lowStockCount: lowStock }));
            setLoading(false);
        });

        return () => {
            unsubVisitors();
            unsubOrders();
            unsubProducts();
        };
    }, []);

    const distValues = Object.values(stats.hourlyDistribution) as number[];
    const maxCount = Math.max(...distValues, 1);

    if (loading) {
        return (
            <div className="loading-state h-screen">
                <div className="spinner" />
                <p>Analyzing Shop Data...</p>
            </div>
        );
    }

    return (
        <div className="screen animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="screen-header">
                <div>
                    <h1 className="screen-title">Insights</h1>
                    {lastUpdate && <p className="screen-subtitle">Live Intelligence · Last updated {lastUpdate}</p>}
                </div>
                <div className="live-badge">
                    <span className="live-dot" />
                    LIVE
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card stat-card--red">
                    <div className="stat-card__label">
                        <Activity size={12} />
                        Live Sessions
                    </div>
                    <div className="stat-card__value">{stats.liveVisitors}</div>
                    <div className="stat-pulse" />
                </div>

                <div className="stat-card stat-card--green">
                    <div className="stat-card__label">
                        <DollarSign size={12} />
                        Revenue
                    </div>
                    <div className="stat-card__value stat-card__value--sm">${stats.totalRevenue.toLocaleString()}</div>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-green mt-1">
                        <ArrowUpRight size={10} /> 12% vs last week
                    </div>
                </div>

                <div className="stat-card stat-card--yellow">
                    <div className="stat-card__label">
                        <ShoppingBag size={12} />
                        Orders
                    </div>
                    <div className="stat-card__value">{stats.totalOrders}</div>
                    {stats.pendingOrders > 0 && (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-yellow mt-1">
                            <Clock size={10} /> {stats.pendingOrders} pending
                        </div>
                    )}
                </div>
            </div>

            <div className="stats-grid mt-[-6px]">
                <div className="stat-card">
                    <div className="stat-card__label">
                        <Users size={12} />
                        Visitors
                    </div>
                    <div className="stat-card__value">{stats.totalVisitors}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card__label">
                        <AlertCircle size={12} />
                        Low Stock
                    </div>
                    <div className="stat-card__value text-orange">{stats.lowStockCount}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card__label">
                        <Target size={12} />
                        Conversion
                    </div>
                    <div className="stat-card__value stat-card__value--sm">
                        {stats.totalOrders > 0 ? ((stats.totalOrders / stats.totalVisitors) * 100).toFixed(1) : 0}%
                    </div>
                </div>
            </div>

            {/* Hourly Chart */}
            <div className="chart-card glass-card">
                <div className="chart-card__header">
                    <h2 className="chart-card__title">Traffic Pulse</h2>
                    <span className="chart-card__label">Activity by Hour</span>
                </div>
                <div className="chart-bars">
                    {Array.from({ length: 24 }).map((_, i) => {
                        const count = stats.hourlyDistribution[i] || 0;
                        const height = Math.max(4, (count / maxCount) * 100);
                        const isNow = new Date().getHours() === i;
                        return (
                            <div key={i} className="chart-bar-wrap">
                                {count > 0 && (
                                    <span className="chart-bar-tooltip">{count}</span>
                                )}
                                <div
                                    className={`chart-bar ${isNow ? 'chart-bar--active' : count > 0 ? 'chart-bar--filled' : ''}`}
                                    style={{ height: `${height}%` }}
                                />
                                <span className={`chart-bar-label ${isNow ? 'chart-bar-label--active' : ''}`}>
                                    {i % 4 === 0 ? (i === 0 ? '12a' : i === 12 ? '12p' : i > 12 ? `${i - 12}p` : `${i}a`) : ''}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="activity-feed">
                <div className="section-header flex justify-between items-center mb-3">
                    <h3 className="section-title text-sm font-bold flex items-center gap-2">
                        <ShoppingBag size={14} className="text-blue" />
                        Recent Orders
                    </h3>
                    <button className="text-[10px] font-bold text-text-secondary hover:text-white transition-colors">View All</button>
                </div>
                <div className="feed-items gap-2">
                    {recentOrders.length > 0 ? recentOrders.map(order => (
                        <div key={order.id} className="feed-item glass-card p-3 flex justify-between items-center border border-white/5 rounded-xl">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold">{order.orderId}</span>
                                <span className="text-[10px] text-text-muted">
                                    {order.timestamp?.toDate ? order.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                </span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-xs font-black text-green">${order.total}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter ${
                                    order.status === 'pending' ? 'bg-yellow-dim text-yellow' : 'bg-green-dim text-green'
                                }`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    )) : (
                        <div className="feed-item opacity-50">
                            <div className="feed-item__dot grayscale" />
                            <div className="feed-item__text">No recent orders yet</div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Live Activity Pulse */}
            <div className="activity-feed mt-6">
                <div className="section-header">
                    <h3 className="section-title">Global Activity</h3>
                    <div className="activity-ring" />
                </div>
                <div className="feed-items">
                    {stats.liveVisitors > 0 && (
                        <div className="feed-item">
                            <div className="feed-item__dot" />
                            <div className="feed-item__text">
                                <strong>{stats.liveVisitors}</strong> people exploring the shop from <strong>{stats.topCity}</strong>.
                            </div>
                        </div>
                    )}
                    {stats.activeCarts > 0 && (
                        <div className="feed-item feed-item--yellow">
                            <div className="feed-item__dot" />
                            <div className="feed-item__text">
                                <strong>{stats.activeCarts}</strong> customers are currently building their carts.
                            </div>
                        </div>
                    )}
                    {stats.lowStockCount > 0 && (
                        <div className="feed-item feed-item--red">
                            <div className="feed-item__dot" />
                            <div className="feed-item__text">
                                Warning: <strong>{stats.lowStockCount}</strong> items are running dangerously low on stock.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardScreen;

