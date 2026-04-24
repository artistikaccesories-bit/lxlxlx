import React, { useState, useEffect } from 'react';
import { db, collection, onSnapshot, query, orderBy } from '../utils/firebase';
import { ShoppingBag, Copy, Check, FileSpreadsheet, Tag } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    handle: string;
    price: number;
    category: string;
    description: string;
    stock?: number;
}

const MarketplaceScreen: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        if (!db) return;
        const q = query(collection(db, 'products'), orderBy('name', 'asc'));
        const unsub = onSnapshot(q, (snapshot) => {
            const items: Product[] = [];
            snapshot.forEach(doc => {
                items.push({ id: doc.id, ...doc.data() } as Product);
            });
            setProducts(items);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const copyAllAsCSV = () => {
        const header = "SKU,Name,Price,Category,Description,Stock\n";
        const rows = products.map(p => 
            `"${p.handle || p.id}","${p.name}",${p.price},"${p.category}","${p.description.replace(/"/g, '""')}",${p.stock || 0}`
        ).join("\n");
        
        navigator.clipboard.writeText(header + rows);
        alert("Product database copied as CSV!");
    };

    return (
        <div className="screen animate-in">
            <div className="screen-header">
                <div>
                    <h1 className="screen-title">Marketplace Helper</h1>
                    <p className="screen-subtitle">Easy export for company Excel sheets</p>
                </div>
                <button className="add-btn" style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)' }} onClick={copyAllAsCSV}>
                    <FileSpreadsheet size={18} />
                    Copy All for Excel
                </button>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner" />
                    <p>Fetching products...</p>
                </div>
            ) : (
                <div className="marketplace-container">
                    <div className="marketplace-table-wrap">
                        <table className="marketplace-table">
                            <thead>
                                <tr>
                                    <th>SKU / Handle</th>
                                    <th>Product Name</th>
                                    <th>Price ($)</th>
                                    <th>Cat.</th>
                                    <th>Description Snippet</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            <code className="sku-tag">{p.handle || p.id}</code>
                                        </td>
                                        <td className="font-bold">{p.name}</td>
                                        <td className="text-green-400 font-mono">${p.price}</td>
                                        <td>{p.category}</td>
                                        <td className="text-zinc-500 max-w-[200px] truncate">{p.description}</td>
                                        <td className="text-right">
                                            <button 
                                                className={`copy-row-btn ${copiedId === p.id ? 'copied' : ''}`}
                                                onClick={() => copyToClipboard(`${p.handle || p.id}\t${p.name}\t${p.price}\t${p.category}\t${p.description}`, p.id)}
                                            >
                                                {copiedId === p.id ? <Check size={14} /> : <Copy size={14} />}
                                                {copiedId === p.id ? 'Copied' : 'Copy Row'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {products.length === 0 && (
                        <div className="empty-state">
                            <ShoppingBag size={48} className="empty-state__icon" />
                            <p className="empty-state__title">No products found</p>
                            <p className="empty-state__sub">Add products in Inventory first.</p>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                .marketplace-container {
                    padding: 1rem 0;
                    overflow-x: auto;
                }
                .marketplace-table-wrap {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    overflow: hidden;
                }
                .marketplace-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.9rem;
                }
                .marketplace-table th {
                    text-align: left;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.6);
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    font-size: 0.75rem;
                }
                .marketplace-table td {
                    padding: 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
                }
                .sku-tag {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 0.8rem;
                }
                .copy-row-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(255, 255, 255, 0.08);
                    border: none;
                    color: white;
                    padding: 0.4rem 0.8rem;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.8rem;
                }
                .copy-row-btn:hover {
                    background: rgba(255, 255, 255, 0.15);
                }
                .copy-row-btn.copied {
                    background: #22c55e;
                }
                .text-right { text-align: right; }
                .font-mono { font-family: monospace; }
                .font-bold { font-weight: 600; }
            `}</style>
        </div>
    );
};

export default MarketplaceScreen;
