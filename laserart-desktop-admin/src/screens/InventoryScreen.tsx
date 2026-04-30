import React, { useState, useEffect } from 'react';
import { db, storage, collection, addDoc, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from '../utils/firebase';
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
    const [uploadProgress, setUploadProgress] = useState(0);
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
        const loadLocalProducts = async () => {
            if (!window.electron) {
                setLoading(false);
                return;
            }

            try {
                const raw = await window.electron.readDataFile('src/data/products.json');
                if (raw) {
                    const items = JSON.parse(raw);
                    setProducts(items);
                }
            } catch (err) {
                console.error("Failed to load local products:", err);
            } finally {
                setLoading(false);
            }
        };

        loadLocalProducts();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);
            const oversized = selectedFiles.find(f => f.size > 5 * 1024 * 1024);
            if (oversized) {
                alert(`File "${oversized.name}" is too large. Max size is 5MB.`);
                e.target.value = '';
                return;
            }
            setFiles(e.target.files);
            const urls = selectedFiles.map(file => URL.createObjectURL(file));
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
        
        if (!editingProduct && (!files || files.length === 0)) {
            alert("Please select at least one image.");
            return;
        }

        try {
            let imageUrls = editingProduct?.images || (editingProduct?.image ? [editingProduct.image] : []);
            let mainImage = editingProduct?.image || '';

            const parsedPrice = parseFloat(price);
            const parsedStock = parseInt(stock);

            if (isNaN(parsedPrice) || parsedPrice < 0) throw new Error('Please enter a valid price.');
            if (isNaN(parsedStock)) throw new Error('Please enter a valid stock number.');

            const normalizedHandle = slugifyHandle(name.trim());
            
            if (window.electron) {
                setUploading(true);
                setUploadProgress(10);

                // 1. Save images locally
                let localImageUrls = [...imageUrls];
                if (files && files.length > 0) {
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        const reader = new FileReader();
                        const base64Promise = new Promise<string>((resolve) => {
                            reader.onload = () => resolve(reader.result?.toString().split(',')[1] || '');
                            reader.readAsDataURL(file);
                        });
                        const base64 = await base64Promise;
                        const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
                        const localPath = await window.electron.saveImageFile(fileName, base64);
                        if (i === 0) mainImage = localPath;
                        localImageUrls.push(localPath);
                        setUploadProgress(20 + ((i + 1) / files.length) * 40);
                    }
                }

                const productData = {
                    name: name.trim(),
                    price: parsedPrice,
                    category,
                    description: description.trim(),
                    image: mainImage,
                    images: localImageUrls,
                    stock: parsedStock,
                    isBestSeller,
                    isProductOfTheWeek,
                    updatedAt: new Date().toISOString(),
                    handle: normalizedHandle
                };

                const updatedProducts = editingProduct 
                    ? products.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p)
                    : [{ id: Date.now().toString(), ...productData, createdAt: new Date().toISOString() }, ...products];

                await window.electron.saveDataFile('src/data/products.json', JSON.stringify(updatedProducts, null, 2));
                setProducts(updatedProducts as ProductDoc[]);
                setUploadProgress(100);
                alert("Product saved! Ready for GitHub Sync.");
            }
            setShowModal(false);
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!window.confirm("Delete this product permanently?")) return;
        try {
            const updatedProducts = products.filter(p => p.id !== id);
            if (window.electron) {
                await window.electron.saveDataFile('src/data/products.json', JSON.stringify(updatedProducts, null, 2));
                setProducts(updatedProducts as ProductDoc[]);
            }
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
            <div className="screen-header items-center">
                <div>
                    <h1 className="screen-title tracking-tight">Inventory</h1>
                    <p className="screen-subtitle font-medium opacity-60">{products.length} Items in Catalog</p>
                </div>
                <div className="flex gap-2">
                    <button className="add-btn flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl font-bold text-sm hover:scale-105 transition-all" onClick={openAddModal}>
                        <Plus size={16} /> Add New
                    </button>
                    {window.electron && (
                        <button 
                            className={`push-live-btn flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${isSyncing ? 'bg-surface-2 text-text-muted opacity-50' : 'bg-red text-white hover:bg-red/80 shadow-lg shadow-red/20'}`}
                            onClick={async () => {
                                if (isSyncing) return;
                                if (window.confirm("Sync all changes to GitHub? This will update the live website.")) {
                                    setIsSyncing(true);
                                    try {
                                        const commands = [
                                            'git add .',
                                            'git commit -m "Admin: Inventory Sync" || echo "nothing to commit"',
                                            'git pull --rebase origin main || echo "pull failed, trying push anyway"',
                                            'git push origin main'
                                        ];
                                        
                                        for (const cmd of commands) {
                                            await window.electron.runGitCommand(cmd);
                                        }
                                        
                                        alert("🚀 GitHub Sync Successful! Changes are being deployed.");
                                    } catch (e) { 
                                        console.error("Sync error:", e);
                                        alert("Sync error (Check internet/GitHub access): " + e); 
                                    } finally {
                                        setIsSyncing(false);
                                    }
                                }
                            }}
                        >
                            {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <Cloud size={16} />} 
                            {isSyncing ? 'Syncing...' : 'Sync Live'}
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
                            <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
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
                                    <div className="file-input-wrap">
                                        {previewImages.length > 0 ? (
                                            <div className="w-full h-full group relative">
                                                <img src={previewImages[0]} className="w-full h-full object-cover" style={{ display: 'block' }} />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                                                    <label htmlFor="file-input" className="cursor-pointer bg-white text-black px-4 py-2 rounded-full font-bold text-xs">Change Image</label>
                                                </div>
                                                {uploading && (
                                                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2">
                                                        <Loader2 className="animate-spin text-white" size={32} />
                                                        <span className="text-white text-[10px] font-black">{uploadProgress}%</span>
                                                        <div className="w-2/3 h-1 bg-white/20 rounded-full overflow-hidden">
                                                            <div className="h-full bg-green transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                <input type="file" multiple accept="image/*" onChange={handleFileChange} id="file-input" className="hidden-input" />
                                                <label htmlFor="file-input" className="file-input-label">
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
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-ten font-black uppercase tracking-wider transition-all border ${
                                        isBestSeller ? 'bg-yellow text-black border-yellow' : 'bg-transparent text-text-muted border-border'
                                    }`}
                                    onClick={() => setIsBestSeller(!isBestSeller)}
                                >
                                    <Check size={12} className={isBestSeller ? 'opacity-100' : 'opacity-0'} />
                                    Best Seller
                                </button>
                                <button 
                                    type="button" 
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-ten font-black uppercase tracking-wider transition-all border ${
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
