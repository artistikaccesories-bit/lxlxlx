import React, { useState, useEffect } from 'react';
import { db, storage, collection, addDoc, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc, ref, uploadBytes, getDownloadURL } from '../utils/firebase';
import { auth } from '../utils/firebase';
import { COLLECTIONS, normalizeProductDoc, slugifyHandle } from '../utils/firestoreData';
import type { ProductDoc } from '../types/firestore';
import { 
    Package, Plus, Trash2, Loader2, X, Edit2, Search, 
    Cloud, Image as ImageIcon, Database, Save, RefreshCw,
    ExternalLink, Eye, LayoutGrid, List, Check, AlertCircle
} from 'lucide-react';
import { DEFAULT_PRODUCTS } from '../data/defaultProducts';

const InventoryScreen: React.FC = () => {
    const [products, setProducts] = useState<ProductDoc[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductDoc | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Form state
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('keychain');
    const [description, setDescription] = useState('');
    const [stock, setStock] = useState('10');
    const [isBestSeller, setIsBestSeller] = useState(false);
    const [isProductOfTheWeek, setIsProductOfTheWeek] = useState(false);
    const [files, setFiles] = useState<FileList | null>(null);
    const [previewImages, setPreviewImages] = useState<string[]>([]);

    useEffect(() => {
        if (!db) return;
        const q = query(collection(db, COLLECTIONS.products), orderBy('updatedAt', 'desc'));
        const unsub = onSnapshot(q, async (snapshot) => {
            const items: ProductDoc[] = [];
            snapshot.forEach((productDoc) => {
                items.push(normalizeProductDoc(productDoc.id, productDoc.data()));
            });
            
            // Auto-populate if completely empty
            if (items.length === 0 && !snapshot.metadata.hasPendingWrites) {
                try {
                    for (const p of DEFAULT_PRODUCTS) {
                        await addDoc(collection(db, COLLECTIONS.products), {
                            ...p,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                    }
                } catch (e) {
                    console.error("Failed to auto-populate", e);
                }
            } else {
                setProducts(items);
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(e.target.files);
            const urls = Array.from(e.target.files).map(file => URL.createObjectURL(file));
            setPreviewImages(urls);
        }
    };

    const openEditModal = (product: ProductDoc) => {
        setEditingProduct(product);
        setName(product.name);
        setPrice(product.price.toString());
        setCategory(product.category);
        setDescription(product.description);
        setStock(product.stock?.toString() || '10');
        setIsBestSeller(product.isBestSeller || false);
        setIsProductOfTheWeek(product.isProductOfTheWeek || false);
        setFiles(null);
        setPreviewImages(product.images || [product.image]);
        setShowModal(true);
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setName('');
        setPrice('');
        setCategory('keychain');
        setDescription('');
        setStock('10');
        setIsBestSeller(false);
        setIsProductOfTheWeek(false);
        setFiles(null);
        setPreviewImages([]);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!db || !storage) {
            alert("Database or Storage not initialized.");
            return;
        }

        if (!editingProduct && (!files || files.length === 0)) {
            alert("Please select at least one image.");
            return;
        }

        setUploading(true);

        try {
            let imageUrls = editingProduct?.images || (editingProduct?.image ? [editingProduct.image] : []);
            let mainImage = editingProduct?.image || '';

            if (files && files.length > 0) {
                const uploadPromises = Array.from(files).map(async (file) => {
                    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
                    const uploadResult = await uploadBytes(storageRef, file);
                    return await getDownloadURL(uploadResult.ref);
                });

                const newUrls = await Promise.all(uploadPromises);
                imageUrls = [...newUrls]; 
                mainImage = imageUrls[0];
            }

            const parsedPrice = parseFloat(price);
            const parsedStock = parseInt(stock);

            if (isNaN(parsedPrice) || parsedPrice < 0) {
                throw new Error('Please enter a valid price.');
            }
            if (isNaN(parsedStock)) {
                throw new Error('Please enter a valid stock number.');
            }

            const normalizedHandle = slugifyHandle(name.trim());
            const productData = {
                name: name.trim(),
                price: parsedPrice,
                category,
                description: description.trim(),
                image: mainImage,
                images: imageUrls,
                stock: parsedStock,
                isBestSeller,
                isProductOfTheWeek,
                updatedAt: new Date(),
                handle: normalizedHandle
            };

            if (!productData.name || !productData.description || !productData.handle) {
                throw new Error('Please fill all required product fields.');
            }

            if (!productData.image) {
                throw new Error('Please upload at least one image.');
            }

            if (editingProduct) {
                await updateDoc(doc(db, COLLECTIONS.products, editingProduct.id), productData);
                await addDoc(collection(db, COLLECTIONS.inventoryEvents), {
                    type: 'updated',
                    productId: editingProduct.id,
                    productName: productData.name,
                    adminEmail: auth?.currentUser?.email || 'unknown@admin',
                    at: new Date()
                });
            } else {
                const created = await addDoc(collection(db, COLLECTIONS.products), {
                    ...productData,
                    createdAt: new Date()
                });
                await addDoc(collection(db, COLLECTIONS.inventoryEvents), {
                    type: 'created',
                    productId: created.id,
                    productName: productData.name,
                    adminEmail: auth?.currentUser?.email || 'unknown@admin',
                    at: new Date()
                });
            }
            
            setShowModal(false);
        } catch (error: any) {
            console.error("Error saving product:", error);
            alert(`Error: ${error.message}`);
        } finally {
            setUploading(false);
            setFiles(null);
            setPreviewImages([]);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!db || !window.confirm("Delete this product permanently?")) return;
        try {
            const removed = products.find((p) => p.id === id);
            await deleteDoc(doc(db, COLLECTIONS.products, id));
            await addDoc(collection(db, COLLECTIONS.inventoryEvents), {
                type: 'deleted',
                productId: id,
                productName: removed?.name || 'Unknown',
                adminEmail: auth?.currentUser?.email || 'unknown@admin',
                at: new Date()
            });
        } catch (error) {
            console.error(error);
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="screen animate-in fade-in">
            <div className="screen-header">
                <div>
                    <h1 className="screen-title">Inventory</h1>
                    <p className="screen-subtitle">{products.length} products total</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="add-btn" onClick={openAddModal}>
                        <Plus size={18} /> Add
                    </button>
                    {(window as any).electron && (
                        <button 
                            className={`push-live-btn ${isSyncing ? 'opacity-50 pointer-events-none' : ''}`}
                            onClick={async () => {
                                if (isSyncing) return;
                                if (window.confirm("Sync inventory to the live website? This takes ~2 mins to build.")) {
                                    setIsSyncing(true);
                                    try {
                                        if (window.electron.saveDataFile) {
                                            await window.electron.saveDataFile('public/data/products_live.json', products);
                                            await window.electron.saveDataFile('src/data/products_live.json', products);
                                        }
                                        const commands = [
                                            'git add .',
                                            'git commit -m "Admin: Inventory Sync" || echo "nothing to commit"',
                                            'git push',
                                            'npm run deploy'
                                        ];
                                        
                                        for (const cmd of commands) {
                                            console.log(`Executing: ${cmd}`);
                                            await window.electron.runGitCommand(cmd);
                                        }
                                        
                                        alert("🚀 Sync successful! Site is rebuilding and deploying.");
                                    } catch (e) { 
                                        console.error("Sync error:", e);
                                        alert("Sync error: " + e); 
                                    } finally {
                                        setIsSyncing(false);
                                    }
                                }
                            }}
                        >
                            {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <Cloud size={18} />} 
                            {isSyncing ? 'Syncing...' : 'Sync'}
                        </button>
                    )}
                </div>
            </div>

            <div className="flex gap-2 mb-4">
                <div className="search-bar flex-1 m-0">
                    <Search size={18} className="search-bar__icon" />
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        className="search-bar__input"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex bg-surface border border-border rounded-xl p-1">
                    <button 
                        className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-surface-2 text-white' : 'text-text-muted'}`}
                        onClick={() => setViewMode('grid')}
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button 
                        className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-surface-2 text-white' : 'text-text-muted'}`}
                        onClick={() => setViewMode('list')}
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner" />
                    <p>Loading Catalog...</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="empty-state">
                    <Package size={48} className="empty-state__icon" />
                    <p className="empty-state__title">No matches found</p>
                    <p className="empty-state__sub">Try a different search or add a new product.</p>
                </div>
            ) : (
                <div className={viewMode === 'grid' ? 'product-list' : 'flex flex-col gap-3'}>
                    {filteredProducts.map(p => (
                        <div key={p.id} className={`product-item glass-card ${viewMode === 'list' ? 'flex-row items-center p-3 gap-4 h-auto' : ''}`}>
                            <div className={`product-item__img-container ${viewMode === 'list' ? 'w-16 h-16 rounded-lg' : ''}`}>
                                <img src={p.image} alt={p.name} className="product-item__img" />
                                <div className="absolute top-2 left-2 flex flex-col gap-1">
                                    {p.isBestSeller && <span className="bg-yellow text-black text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Best Seller</span>}
                                    {p.isProductOfTheWeek && <span className="bg-purple-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Week's Pick</span>}
                                </div>
                                {(!p.stock || p.stock === 0) && <span className="stock-out-badge">Out of Stock</span>}
                            </div>
                            <div className="product-item__info flex-1">
                                <div className="product-item__top">
                                    <h3 className="product-item__name text-sm">{p.name}</h3>
                                    <span className="product-item__price">${p.price}</span>
                                </div>
                                <div className="product-item__meta">
                                    <span className={`stock-indicator ${p.stock && p.stock > 5 ? 'in-stock' : 'low-stock'}`}>
                                        {p.stock || 0} unit{p.stock !== 1 ? 's' : ''}
                                    </span>
                                    <span className="dot" />
                                    <span className="product-item__cat">{p.category}</span>
                                </div>
                            </div>
                            <div className="product-item__actions">
                                <button className="product-item__btn edit" onClick={() => openEditModal(p)}>
                                    <Edit2 size={14} />
                                </button>
                                <button className="product-item__btn delete" onClick={() => handleDeleteProduct(p.id)}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content max-w-lg">
                        <div className="modal-header">
                            <h2 className="modal-title font-black uppercase tracking-widest">{editingProduct ? 'Update Piece' : 'New Piece'}</h2>
                            <button className="p-2 hover:bg-white/10 rounded-full" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-4">
                                    <div className="form-group">
                                        <label>Display Name</label>
                                        <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Laser Cut Keychain" />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Price ($)</label>
                                            <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required placeholder="10.00" />
                                        </div>
                                        <div className="form-group">
                                            <label>Units</label>
                                            <input type="number" value={stock} onChange={e => setStock(e.target.value)} required placeholder="10" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Category</label>
                                        <select value={category} onChange={e => setCategory(e.target.value)}>
                                            <option value="keychain">Keychain</option>
                                            <option value="tag">Tag</option>
                                            <option value="accessory">Accessory</option>
                                            <option value="home-decor">Home Decor</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label>Visuals</label>
                                    <div className="file-input-wrap aspect-square relative">
                                        {previewImages.length > 0 ? (
                                            <div className="w-full h-full rounded-xl overflow-hidden group border border-border">
                                                <img src={previewImages[0]} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                                                    <label htmlFor="file-input" className="cursor-pointer bg-white text-black px-4 py-2 rounded-full font-bold text-xs transform translate-y-2 group-hover:translate-y-0 transition-transform">Change Image</label>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <input type="file" multiple accept="image/*" onChange={handleFileChange} id="file-input" className="hidden-input" />
                                                <label htmlFor="file-input" className="file-input-label h-full border-dashed">
                                                    <ImageIcon size={32} className="mb-2 opacity-30" />
                                                    <span className="text-xs font-bold opacity-50">Upload Photo</span>
                                                </label>
                                            </>
                                        )}
                                        <input type="file" multiple accept="image/*" onChange={handleFileChange} id="file-input-hidden" className="hidden-input" />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group mt-2">
                                <label>Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} required placeholder="Detailed product specifications..." rows={3} />
                            </div>

                            <div className="flex items-center gap-3 py-2">
                                <button 
                                    type="button" 
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                                        isBestSeller ? 'bg-yellow text-black border-yellow' : 'bg-transparent text-text-muted border-border'
                                    }`}
                                    onClick={() => setIsBestSeller(!isBestSeller)}
                                >
                                    <Check size={12} className={isBestSeller ? 'opacity-100' : 'opacity-0'} />
                                    Best Seller
                                </button>
                                <button 
                                    type="button" 
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                                        isProductOfTheWeek ? 'bg-purple-600 text-white border-purple-600' : 'bg-transparent text-text-muted border-border'
                                    }`}
                                    onClick={() => setIsProductOfTheWeek(!isProductOfTheWeek)}
                                >
                                    <Check size={12} className={isProductOfTheWeek ? 'opacity-100' : 'opacity-0'} />
                                    Product of the Week
                                </button>
                            </div>

                            <button type="submit" className="submit-btn h-14 text-base font-black uppercase tracking-widest mt-2" disabled={uploading}>
                                {uploading ? <><Loader2 size={20} className="animate-spin" /> Working...</> : (editingProduct ? 'Commit Changes' : 'Launch Product')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryScreen;
