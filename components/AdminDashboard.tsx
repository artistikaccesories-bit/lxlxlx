import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, query, orderBy, limit, onSnapshot, doc, deleteDoc, setDoc } from '../src/utils/firebase';
import { PRODUCTS as STATIC_PRODUCTS } from '../src/data/products';

interface AdminDashboardProps {
    isStandalone?: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isStandalone = false }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Statistics map
    const [stats, setStats] = useState({
        totalVisitors: 0,
        todayVisitors: 0,
        activeCarts: 0,
        todayRevenue: 0,
        liveVisitors: 0,
        topDevice: 'Mobile 📱',
        topCity: 'Beirut',
        hourlyDistribution: {} as Record<number, number>
    });

    const [activeTab, setActiveTab] = useState<'analytics' | 'products'>('analytics');
    const [products, setProducts] = useState<any[]>([]);
    const [newProduct, setNewProduct] = useState({
        id: '',
        name: '',
        price: '',
        description: '',
        image: '',
        category: 'keychain'
    });
    const [isSaving, setIsSaving] = useState(false);

    const [recentVisits, setRecentVisits] = useState<any[]>([]);

    useEffect(() => {
        let unsubscribeVisitors: () => void;
        let unsubscribeProducts: () => void;

        if (db) {
            const visitorsRef = collection(db, "visitors");
            const q = query(visitorsRef, orderBy("timestamp", "desc"), limit(50));

            unsubscribeVisitors = onSnapshot(q, (snapshot) => {
                const history: any[] = [];
                let todayCount = 0;
                let dailyTotalCarts = 0;
                let dailyTotalRevenue = 0;
                let liveVisitorsCount = 0;
                const now = new Date();
                const topCities: Record<string, number> = {};
                const topDevices: Record<string, number> = {};

                const hourlyData: Record<number, number> = {};

                snapshot.forEach(doc => {
                    const data = doc.data();
                    const date = data.timestamp ? data.timestamp.toDate() : new Date();
                    const isToday = date.toDateString() === now.toDateString();
                    if (isToday) {
                        todayCount++;
                        // Accumulate daily total carts
                        dailyTotalCarts += (data.activeCartCount || 0);
                        dailyTotalRevenue += (data.cartTotal || 0);
                    }

                    // Hourly Chart Logic
                    const hour = date.getHours();
                    if (isToday) hourlyData[hour] = (hourlyData[hour] || 0) + 1;

                    // Active Tracker Logic
                    const lastActiveDate = data.lastActive ? data.lastActive.toDate() : date;
                    const isLive = data.isActive === true && (now.getTime() - lastActiveDate.getTime()) < 3 * 60 * 1000;

                    if (isLive) {
                        liveVisitorsCount++;
                    }

                    const city = data.location?.city || 'Unknown';
                    topCities[city] = (topCities[city] || 0) + 1;

                    const device = data.device || 'Unknown';
                    topDevices[device] = (topDevices[device] || 0) + 1;

                    history.push({
                        id: doc.id,
                        time: date.toLocaleString(),
                        device: data.device,
                        location: `${city}, ${data.location?.country || 'Unknown'} (IP: ${data.location?.ip || 'Unknown'})`,
                        pages: data.pagesViewed ? data.pagesViewed.join(', ') : 'Home',
                        cartDetails: data.cartItems && data.cartItems.length > 0 ? data.cartItems.map((item: any) => `${item.quantity}x ${item.name}`).join(', ') : 'Empty',
                        cartTotal: data.cartTotal || 0,
                        duration: data.durationSec ? `${data.durationSec}s` : 'Active'
                    });
                });

                // Determine top city & device
                const mostFrequentCity = Object.keys(topCities).sort((a, b) => topCities[b] - topCities[a])[0] || 'Unknown';
                const mostFrequentDevice = Object.keys(topDevices).sort((a, b) => topDevices[b] - topDevices[a])[0] || 'Unknown';

                setStats({
                    totalVisitors: snapshot.size, // Current batch size
                    todayVisitors: todayCount,
                    activeCarts: dailyTotalCarts,
                    todayRevenue: dailyTotalRevenue,
                    liveVisitors: liveVisitorsCount,
                    topDevice: mostFrequentDevice,
                    topCity: mostFrequentCity,
                    hourlyDistribution: hourlyData
                });

                setRecentVisits(history);
            }, (error) => {
                console.error("Error fetching real-time Firebase data", error);
            });

            // Products sync
            const productsRef = collection(db, "products");
            unsubscribeProducts = onSnapshot(productsRef, (snapshot) => {
                const dynamicProducts: any[] = [];
                snapshot.forEach(doc => {
                    dynamicProducts.push({ ...doc.data(), id: doc.id });
                });
                setProducts(dynamicProducts);
            });

            return () => {
                unsubscribeVisitors();
                unsubscribeProducts();
            };
        } else {
            // Fallback Mock Data if Firebase not configured
            const localGeos = sessionStorage.getItem('website_visitor_geo');
            let location = 'Beirut, Lebanon';
            if (localGeos) {
                const geo = JSON.parse(localGeos);
                location = `${geo.city}, ${geo.country}`;
            }

            const mockHistory = [
                { id: 1, time: 'Just now', device: sessionStorage.getItem('website_visitor_device') || 'Desktop 💻', location: location + ' (IP: 192.168.1.1)', pages: 'Admin Dashboard, Home', duration: '5m', cartTotal: 0, cartDetails: 'Empty' },
                { id: 2, time: '2 hours ago', device: 'Mobile 📱', location: 'Tripoli, Lebanon (IP: 10.0.0.5)', pages: 'Home, Keychains', duration: '2m', cartTotal: 25, cartDetails: '1x CUSTOM PLATE' },
                { id: 3, time: '5 hours ago', device: 'Desktop 💻', location: 'Saida, Lebanon (IP: 8.8.8.8)', pages: 'Custom Preview', duration: '12m', cartTotal: 0, cartDetails: 'Empty' },
                { id: 4, time: 'Yesterday', device: 'Mobile 📱', location: 'Jounieh, Lebanon (IP: Unknown)', pages: 'Home', duration: '1m', cartTotal: 0, cartDetails: 'Empty' },
                { id: 5, time: 'Yesterday', device: 'Tablet 📱', location: 'Zahlé, Lebanon (IP: Unknown)', pages: 'Services, Keychains', duration: '4m', cartTotal: 0, cartDetails: 'Empty' },
            ];
            setRecentVisits(mockHistory);
        }
    }, []);

    const deleteVisit = async (id: string) => {
        if (!db) return;
        if (window.confirm('Delete this visit record?')) {
            try {
                await deleteDoc(doc(db, "visitors", id));
            } catch (err) {
                console.error("Error deleting visit", err);
            }
        }
    };

    const resetDashboard = async () => {
        if (!db) return;
        if (window.confirm('WARNING: This will delete ALL visitor records from the database. Proceed?')) {
            try {
                const visitorsRef = collection(db, "visitors");
                const snapshot = await getDocs(visitorsRef);
                const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, "visitors", d.id)));
                await Promise.all(deletePromises);
                alert('Dashboard reset successfully.');
            } catch (err) {
                console.error("Error resetting dashboard", err);
            }
        }
    };

    const hashPassword = async (pwd: string) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(pwd);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const hash = await hashPassword(password);

        // Secure Login Validation against .env.local
        const validHash1 = import.meta.env.VITE_ADMIN_HASH_1;
        const validHash2 = import.meta.env.VITE_ADMIN_HASH_2;

        if (
            (validHash1 && hash === validHash1) ||
            (validHash2 && hash === validHash2) ||
            (!validHash1 && hash === '1903c1940e2986c00efdd9efc7d13a008b114c7ba6a604bf65ac5a49987b9c37') // Fallback if env missing
        ) {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Invalid password.');
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!db || isSaving) return;

        if (!newProduct.name || !newProduct.price || !newProduct.image || !newProduct.category) {
            alert('Please fill in all required fields (Name, Price, Image URL, Category).');
            return;
        }

        setIsSaving(true);
        try {
            const productId = newProduct.id || `p_${Date.now()}`;
            await setDoc(doc(db, "products", productId), {
                ...newProduct,
                id: productId,
                price: parseFloat(newProduct.price as string),
                timestamp: new Date()
            });

            setNewProduct({
                id: '',
                name: '',
                price: '',
                description: '',
                image: '',
                category: 'keychain'
            });
            alert('Product added successfully!');
        } catch (err) {
            console.error("Error adding product", err);
            alert('Failed to add product.');
        } finally {
            setIsSaving(false);
        }
    };

    const deleteProduct = async (id: string) => {
        if (!db) return;
        if (window.confirm('Delete this product? It will no longer show on the website.')) {
            try {
                await deleteDoc(doc(db, "products", id));
            } catch (err) {
                console.error("Error deleting product", err);
            }
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <form onSubmit={handleLogin} className="bg-zinc-900 border border-white/10 p-8 rounded-2xl w-full max-w-md text-center">
                    <h2 className="text-3xl font-black font-heading tracking-tighter text-white mb-2">Restricted Access</h2>
                    <p className="text-zinc-500 text-sm mb-8">Please enter the admin password</p>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        className="w-full bg-black border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/50 transition-all text-center tracking-widest mb-4"
                        placeholder="PASSWORD"
                    />

                    {error && <p className="text-red-500 text-xs mb-4">{error}</p>}

                    <button type="submit" className="w-full bg-white text-black font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-zinc-200 transition-all">
                        Unlock Dashboard
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-end border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black font-heading tracking-tighter">Admin <span className="text-zinc-500">{activeTab === 'analytics' ? 'Analytics.' : 'Products.'}</span></h1>
                        <p className="text-zinc-400 mt-2">{activeTab === 'analytics' ? 'Live visitor tracking and insights' : 'Manage your store catalog'}</p>
                    </div>
                    <div className="flex gap-3">
                        {activeTab === 'analytics' && (
                            <button onClick={resetDashboard} className="px-4 py-2 border border-red-500/30 text-red-500 rounded-lg text-xs font-bold uppercase hover:bg-red-500 hover:text-white transition-all">
                                Reset Database
                            </button>
                        )}
                        {!isStandalone && (
                            <button onClick={() => {
                                window.location.hash = '';
                                window.location.href = '/';
                            }} className="px-4 py-2 border border-white/20 rounded-lg text-xs font-bold uppercase hover:bg-white hover:text-black transition-all">
                                Exit Admin
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex gap-4 border-b border-white/5 pb-4">
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full transition-all ${activeTab === 'analytics' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full transition-all ${activeTab === 'products' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Manage Products
                    </button>
                </div>

                {activeTab === 'analytics' ? (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                            <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl relative overflow-hidden">
                                <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest mb-1">Live Online</p>
                                <p className="text-3xl font-black font-heading text-red-500">{stats.liveVisitors}</p>
                            </div>
                            <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl">
                                <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest mb-1">Total Visitors</p>
                                <p className="text-3xl font-black font-heading">{stats.totalVisitors}</p>
                            </div>
                            <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl">
                                <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest mb-1">Today</p>
                                <p className="text-3xl font-black font-heading text-green-400">+{stats.todayVisitors}</p>
                            </div>
                            <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl">
                                <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest mb-1">Items in Cart (Today)</p>
                                <p className="text-3xl font-black font-heading text-yellow-500">{stats.activeCarts}</p>
                            </div>
                            <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl">
                                <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest mb-1">Est. Revenue</p>
                                <p className="text-3xl font-black font-heading text-green-400">${stats.todayRevenue}</p>
                            </div>
                            <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl">
                                <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest mb-1">Top Device</p>
                                <p className="text-xl font-bold mt-2">{stats.topDevice}</p>
                            </div>
                            <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl">
                                <p className="text-zinc-500 text-xs uppercase font-bold tracking-widest mb-1">Top City</p>
                                <p className="text-xl font-bold mt-2">{stats.topCity}</p>
                            </div>
                        </div>

                        {/* Traffic Chart */}
                        <div className="bg-zinc-900/30 border border-white/10 p-6 rounded-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">Today's Traffic <span className="text-zinc-500 font-normal">(by hour)</span></h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-white rounded-sm"></div>
                                    <span className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Visitors</span>
                                </div>
                            </div>
                            <div className="h-48 flex items-end gap-[2px] md:gap-2">
                                {Array.from({ length: 24 }).map((_, i) => {
                                    const count = stats.hourlyDistribution[i] || 0;
                                    const distributionValues = Object.values(stats.hourlyDistribution) as number[];
                                    const max = Math.max(...distributionValues, 0) || 1;
                                    const height = (count / max) * 100;
                                    const isCurrentHour = new Date().getHours() === i;

                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                                {count} visitors
                                            </div>
                                            <div
                                                style={{ height: `${Math.max(4, height)}%` }}
                                                className={`w-full rounded-t-sm transition-all duration-500 ${isCurrentHour ? 'bg-white' : count > 0 ? 'bg-white/40 group-hover:bg-white/60' : 'bg-white/5'}`}
                                            ></div>
                                            <span className={`text-[8px] md:text-[9px] font-bold ${isCurrentHour ? 'text-white' : 'text-zinc-600'}`}>
                                                {i === 0 ? '12a' : i === 12 ? '12p' : i > 12 ? `${i - 12}p` : `${i}a`}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recent Visitors Table */}
                        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-white/5">
                                <h3 className="text-xl font-bold">Recent Visits</h3>
                            </div>
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-zinc-500 uppercase bg-black/20">
                                        <tr>
                                            <th className="px-6 py-4">Time</th>
                                            <th className="px-6 py-4">Location & IP</th>
                                            <th className="px-6 py-4">Device</th>
                                            <th className="px-6 py-4">Cart & Pages</th>
                                            <th className="px-6 py-4 font-mono">Duration</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentVisits.map((visit) => (
                                            <tr key={visit.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group/row">
                                                <td className="px-6 py-4 font-medium whitespace-nowrap">{visit.time}</td>
                                                <td className="px-6 py-4 text-zinc-300">
                                                    <div>{visit.location.split(' (IP:')[0]}</div>
                                                    <div className="text-[10px] text-zinc-500 font-mono">IP: {visit.location.split(' (IP: ')[1]?.replace(')', '') || 'Unknown'}</div>
                                                </td>
                                                <td className="px-6 py-4 text-zinc-300">{visit.device}</td>
                                                <td className="px-6 py-4 text-zinc-400 text-xs">
                                                    {visit.cartTotal > 0 && (
                                                        <div className="mb-1">
                                                            <span className="text-green-400 font-bold">${visit.cartTotal} in Cart:</span> {visit.cartDetails}
                                                        </div>
                                                    )}
                                                    <div className="opacity-50">Views: {visit.pages}</div>
                                                </td>
                                                <td className="px-6 py-4 font-mono">{visit.duration}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => deleteVisit(visit.id)}
                                                        className="opacity-0 group-hover/row:opacity-100 p-2 text-zinc-500 hover:text-red-500 transition-all"
                                                        title="Delete Record"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-white/5">
                                {recentVisits.map((visit) => (
                                    <div key={visit.id} className="p-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{visit.time}</span>
                                                <span className="text-sm font-bold text-white mt-1">{visit.location.split(' (IP:')[0]}</span>
                                                <span className="text-[10px] text-zinc-500 font-mono mt-0.5">IP: {visit.location.split(' (IP: ')[1]?.replace(')', '') || 'Unknown'}</span>
                                            </div>
                                            <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-mono">{visit.duration}</span>
                                            <button
                                                onClick={() => deleteVisit(visit.id)}
                                                className="p-1 px-2 bg-red-500/10 text-red-500 rounded text-[10px] font-bold uppercase"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                                            <span className="p-1 bg-white/5 rounded flex-shrink-0">{visit.device}</span>
                                            <div className="flex-1 flex flex-col gap-1 min-w-0">
                                                {visit.cartTotal > 0 && (
                                                    <span className="text-green-400 text-[10px] font-bold truncate">${visit.cartTotal} - {visit.cartDetails}</span>
                                                )}
                                                <span className="truncate opacity-50">Views: {visit.pages}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Add Product Form */}
                        <div className="bg-zinc-900/30 border border-white/10 p-8 rounded-3xl">
                            <h3 className="text-xl font-bold mb-6">Add New Product</h3>
                            <form onSubmit={handleAddProduct} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-zinc-500">Product Name *</label>
                                        <input
                                            type="text"
                                            value={newProduct.name}
                                            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm"
                                            placeholder="e.g. CUSTOM PLATE"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-zinc-500">Price ($) *</label>
                                        <input
                                            type="number"
                                            value={newProduct.price}
                                            onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm"
                                            placeholder="10"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500">Image URL (path or link) *</label>
                                    <input
                                        type="text"
                                        value={newProduct.image}
                                        onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm"
                                        placeholder="/images/product.jpg"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-zinc-500">Category *</label>
                                        <select
                                            value={newProduct.category}
                                            onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm"
                                        >
                                            <option value="keychain">Keychain</option>
                                            <option value="tag">Tag</option>
                                            <option value="tool">Tool</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold text-zinc-500">Custom ID (Optional)</label>
                                        <input
                                            type="text"
                                            value={newProduct.id}
                                            onChange={e => setNewProduct({ ...newProduct, id: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm"
                                            placeholder="lebanon-plate-style"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500">Description</label>
                                    <textarea
                                        value={newProduct.description}
                                        onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm h-32 resize-none"
                                        placeholder="Precision laser engraved..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full bg-white text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50"
                                >
                                    {isSaving ? 'Creating...' : 'Create Product'}
                                </button>
                            </form>
                        </div>

                        {/* Product List */}
                        <div className="bg-zinc-900/30 border border-white/10 rounded-3xl p-8">
                            <h3 className="text-xl font-bold mb-6">Current Catalog</h3>
                            <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                                {products.length === 0 && (
                                    <p className="text-zinc-500 text-sm text-center py-20">No dynamic products found. Add one to see it here.</p>
                                )}
                                {products.map(p => (
                                    <div key={p.id} className="flex items-center gap-4 p-4 bg-black/50 border border-white/5 rounded-2xl group/product">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
                                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-sm">{p.name}</h4>
                                            <p className="text-zinc-500 text-[10px] uppercase tracking-widest">${p.price} • {p.category}</p>
                                        </div>
                                        <button
                                            onClick={() => deleteProduct(p.id)}
                                            className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                                            title="Delete Product"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}

                                <div className="mt-8 pt-8 border-t border-white/5">
                                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-4">Static Products (From Code)</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {STATIC_PRODUCTS.slice(0, 6).map(p => (
                                            <div key={p.id} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg opacity-50 grayscale">
                                                <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
                                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                                </div>
                                                <span className="text-[10px] truncate">{p.name}</span>
                                            </div>
                                        ))}
                                        <div className="col-span-2 text-center text-[10px] text-zinc-600 mt-2">
                                            + {STATIC_PRODUCTS.length - 6} more static items
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
