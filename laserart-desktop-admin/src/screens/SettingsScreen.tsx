import { useState, useEffect } from 'react';

import { LogOut, Shield, Info, ExternalLink, Truck, Save, Loader2, Cloud, DollarSign, Percent, AlertTriangle, Trash2 } from 'lucide-react';
import { db, doc, getDoc, setDoc, collection, getDocs, updateDoc, deleteDoc } from '../utils/firebase';

interface SettingsScreenProps {
    onLogout: () => void | Promise<void>;
    adminEmail: string;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onLogout, adminEmail }) => {
    const [standardDelivery, setStandardDelivery] = useState('4');
    const [expressDelivery, setExpressDelivery] = useState('6');
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState<string | null>(null);
    const [priceAdjustValue, setPriceAdjustValue] = useState('');
    const [adjustMode, setAdjustMode] = useState<'fixed' | 'percent'>('fixed');
    const [isAdjusting, setIsAdjusting] = useState(false);
    const [clearing, setClearing] = useState(false);

    useEffect(() => {
        if (!db) return;
        getDoc(doc(db, 'settings', 'delivery')).then(snap => {
            if (snap.exists()) {
                const data = snap.data();
                setStandardDelivery(data.standard.toString());
                setExpressDelivery(data.express.toString());
            }
        });
    }, []);

    const handleSaveDelivery = async () => {
        if (!db) {
            console.error("Firestore DB not initialized");
            alert("Connection error: Database not ready.");
            return;
        }
        
        const standard = parseFloat(standardDelivery);
        const express = parseFloat(expressDelivery);

        if (isNaN(standard) || isNaN(express)) {
            alert("Please enter valid numbers for delivery prices.");
            return;
        }

        setSaving(true);
        try {
            console.log("Attempting to save delivery settings to 'settings/delivery'...");
            const settingsRef = doc(db, 'settings', 'delivery');
            await setDoc(settingsRef, {
                standard,
                express,
                updatedAt: Timestamp.now()
            }, { merge: true });
            
            console.log("Successfully saved delivery settings");
            alert(`✅ Prices Updated!\n\nStandard: $${standard}\nExpress: $${express}\n\nThe website will reflect this instantly.`);
        } catch (error: any) {
            console.error("Failed to update delivery prices:", error);
            alert(`❌ Sync Error: ${error.message || 'Unknown error'}\n\nPlease check your internet connection and try again.`);
        } finally {

            setSaving(false);
        }
    };

    const handleGlobalPriceAdjust = async (isIncrease: boolean) => {
        if (!db) return;
        const val = parseFloat(priceAdjustValue);
        if (isNaN(val) || val <= 0) {
            alert("Please enter a valid positive number.");
            return;
        }

        const confirmMsg = `Are you SURE? This will ${isIncrease ? 'INCREASE' : 'DECREASE'} all product prices by ${adjustMode === 'fixed' ? '$' : ''}${val}${adjustMode === 'percent' ? '%' : ''}. This cannot be undone automatically.`;
        
        if (!window.confirm(confirmMsg)) return;

        setIsAdjusting(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'products'));
            let updatedCount = 0;

            const promises = querySnapshot.docs.map(async (productDoc) => {
                const currentPrice = productDoc.data().price;
                let newPrice = currentPrice;

                if (adjustMode === 'fixed') {
                    newPrice = isIncrease ? currentPrice + val : currentPrice - val;
                } else {
                    const factor = val / 100;
                    newPrice = isIncrease ? currentPrice * (1 + factor) : currentPrice * (1 - factor);
                }

                // Ensure price doesn't go negative
                newPrice = Math.max(0, parseFloat(newPrice.toFixed(2)));

                await updateDoc(doc(db, 'products', productDoc.id), {
                    price: newPrice,
                    updatedAt: new Date()
                });
                updatedCount++;
            });

            await Promise.all(promises);
            alert(`Success! Updated prices for ${updatedCount} products.`);
            setPriceAdjustValue('');
        } catch (error) {
            console.error(error);
            alert("Error updating bulk prices.");
        } finally {
            setIsAdjusting(false);
        }
    };

    const handleGitSync = async () => {
        if (!window.electron) {
            alert("GitHub Sync is only available in the Desktop App.");
            return;
        }

        if (syncing) return;
        
        if (!window.confirm("Sync all changes to the live website? This includes inventory, delivery settings, and build files.")) {
            return;
        }

        setSyncing(true);
        setSyncStatus("Preparing sync...");
        try {
            // Ensure we save current products to live files too if possible
            // Note: This assumes 'products' is available or fetched. 
            // For now we'll just run the git commands which cover any manual changes.

            const commands = [
                { msg: "Staging changes...", cmd: 'git add .' },
                { msg: "Committing updates...", cmd: 'git commit -m "Admin: Global Sync & Settings Update" || echo "nothing to commit"' },
                { msg: "Merging remote changes...", cmd: 'git pull --rebase origin main || echo "pull failed, trying push anyway"' },
                { msg: "Pushing to GitHub...", cmd: 'git push origin main' },
                { msg: "Building & Deploying (this takes ~2 mins)...", cmd: 'npm run deploy' }
            ];

            for (const item of commands) {
                setSyncStatus(item.msg);
                await window.electron.runGitCommand(item.cmd);
            }

            setSyncStatus("Success! Website is rebuilding.");
            alert("🚀 Successfully pushed updates! The live website is now rebuilding and will update in a few minutes.");
        } catch (error: any) {
            console.error("Sync error:", error);
            setSyncStatus(`Failed: ${error}`);
            alert(`Sync Failed: ${error}\n\nPlease check your internet connection or GitHub credentials.`);
        } finally {
            setSyncing(false);
            setTimeout(() => setSyncStatus(null), 10000);
        }
    };

    const handleClearStats = async (type: 'visitors' | 'orders') => {
        if (!db) return;
        if (!window.confirm(`Are you absolutely sure you want to delete ALL ${type}? This cannot be undone.`)) {
            return;
        }

        setClearing(true);
        try {
            const querySnapshot = await getDocs(collection(db, type));
            const promises = querySnapshot.docs.map(d => deleteDoc(doc(db, type, d.id)));
            await Promise.all(promises);
            alert(`Successfully cleared all ${type}.`);
        } catch (error) {
            console.error(error);
            alert(`Error clearing ${type}.`);
        } finally {
            setClearing(false);
        }
    };

    return (
        <div className="screen">
            <div className="screen-header">
                <div>
                    <h1 className="screen-title">Settings</h1>
                    <p className="screen-subtitle">App configuration</p>
                </div>
            </div>

            <div className="settings-list">
                <div className="settings-section">
                    <p className="settings-section__label">Shop Settings</p>
                    <div className="settings-card">
                        <div className="settings-card__header">
                            <Truck size={18} className="settings-card__icon" />
                            <p className="settings-card__title">Delivery Pricing ($)</p>
                        </div>
                        <div className="settings-card__body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Standard</label>
                                    <input type="number" value={standardDelivery} onChange={e => setStandardDelivery(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Express</label>
                                    <input type="number" value={expressDelivery} onChange={e => setExpressDelivery(e.target.value)} />
                                </div>
                            </div>
                            <button className="save-settings-btn" onClick={handleSaveDelivery} disabled={saving}>
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {saving ? 'Saving...' : 'Update All Delivery Prices'}
                            </button>
                        </div>
                    </div>

                    <div className="settings-card mt-3" style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <div className="settings-card__header">
                            <DollarSign size={18} className="settings-card__icon text-red-500" />
                            <p className="settings-card__title">Global Price Adjustment</p>
                        </div>
                        <div className="settings-card__body">
                            <p className="text-ten text-zinc-400 mb-3 flex items-center gap-2">
                                <AlertTriangle size={12} className="text-orange-500" />
                                WARNING: This modifies ALL products in your catalog instantly.
                            </p>
                            <div className="flex gap-2 mb-3">
                                <div className="flex-1 flex bg-black/40 rounded-lg p-1 border border-white/5">
                                    <button 
                                        className={`flex-1 py-1.5 rounded-md text-ten font-bold transition-all ${adjustMode === 'fixed' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}
                                        onClick={() => setAdjustMode('fixed')}
                                    >
                                        <DollarSign size={10} className="inline mr-1" /> Fixed ($)
                                    </button>
                                    <button 
                                        className={`flex-1 py-1.5 rounded-md text-ten font-bold transition-all ${adjustMode === 'percent' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}
                                        onClick={() => setAdjustMode('percent')}
                                    >
                                        <Percent size={10} className="inline mr-1" /> Percent (%)
                                    </button>
                                </div>
                                <input 
                                    type="number" 
                                    className="w-24 bg-black/40 border border-white/10 rounded-lg px-3 text-xs font-bold"
                                    placeholder={adjustMode === 'fixed' ? "0.00" : "0"}
                                    value={priceAdjustValue}
                                    onChange={e => setPriceAdjustValue(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    className="p-3 rounded-xl bg-red-dim border border-red-500/20 text-red-500 text-ten font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                    onClick={() => handleGlobalPriceAdjust(false)}
                                    disabled={isAdjusting}
                                >
                                    Decrease All
                                </button>
                                <button 
                                    className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-ten font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all disabled:opacity-50"
                                    onClick={() => handleGlobalPriceAdjust(true)}
                                    disabled={isAdjusting}
                                >
                                    {isAdjusting ? 'Processing...' : 'Increase All'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="settings-section">
                    <p className="settings-section__label">Sync & Deployment</p>
                    <div className="settings-card" style={{ border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                        <div className="settings-card__header">
                            <Cloud size={18} className="settings-card__icon" style={{ color: '#8b5cf6' }} />
                            <p className="settings-card__title">GitHub Integration</p>
                        </div>
                        <div className="settings-card__body">
                            <p className="settings-card__desc">Push local changes and product updates to GitHub to trigger website deployment.</p>
                            <button 
                                className="push-live-btn" 
                                onClick={handleGitSync} 
                                disabled={syncing}
                                style={{ width: '100%', marginTop: '0.5rem' }}
                            >
                                {syncing ? <Loader2 size={18} className="animate-spin" /> : <Cloud size={18} />}
                                {syncing ? 'Syncing...' : 'Push Updates to Live Site'}
                            </button>
                            {syncStatus && <p className="sync-status">{syncStatus}</p>}
                        </div>
                    </div>
                </div>

                <div className="settings-section">
                    <p className="settings-section__label">Danger Zone</p>
                    <div className="settings-card" style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <div className="settings-card__header">
                            <AlertTriangle size={18} className="text-red-500" />
                            <p className="settings-card__title">Maintenance & Cleanup</p>
                        </div>
                        <div className="settings-card__body">
                            <p className="text-ten text-zinc-400 mb-4">Reset metrics and historical data. Be careful, this is permanent.</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    className="p-3 rounded-xl bg-red-dim border border-red-500/20 text-red-500 text-ten font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    onClick={() => handleClearStats('visitors')}
                                    disabled={clearing}
                                >
                                    <Trash2 size={12} /> Clear Visitors
                                </button>
                                <button 
                                    className="p-3 rounded-xl bg-red-dim border border-red-500/20 text-red-500 text-ten font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    onClick={() => handleClearStats('orders')}
                                    disabled={clearing}
                                >
                                    <Trash2 size={12} /> Clear Orders
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="settings-section">
                    <p className="settings-section__label">Security</p>
                    <div className="settings-item">
                        <div className="settings-item__left">
                            <Shield size={18} className="settings-item__icon settings-item__icon--blue" />
                            <div>
                                <p className="settings-item__title">Password Protection</p>
                                <p className="settings-item__sub">Firebase Auth session · Signed in as {adminEmail || 'admin'}</p>
                            </div>
                        </div>
                        <span className="settings-item__badge settings-item__badge--green">Active</span>
                    </div>
                </div>

                <div className="settings-section">
                    <p className="settings-section__label">Database</p>
                    <a
                        href="https://console.firebase.google.com/project/laserart-2eca0"
                        target="_blank"
                        rel="noreferrer"
                        className="settings-item settings-item--link"
                    >
                        <div className="settings-item__left">
                            <ExternalLink size={18} className="settings-item__icon settings-item__icon--orange" />
                            <div>
                                <p className="settings-item__title">Firebase Console</p>
                                <p className="settings-item__sub">laserart-2eca0</p>
                            </div>
                        </div>
                        <span className="settings-item__arrow">→</span>
                    </a>
                </div>

                <div className="settings-section">
                    <p className="settings-section__label">About</p>

                    <div className="settings-item">
                        <div className="settings-item__left">
                            <Info size={18} className="settings-item__icon" />
                            <div>
                                <p className="settings-item__title">LaserArt Admin</p>
                                <p className="settings-item__sub">Version 1.0.0 · Built with React + Capacitor</p>
                            </div>
                        </div>
                    </div>
                </div>

                <button className="logout-btn" onClick={onLogout}>
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default SettingsScreen;
