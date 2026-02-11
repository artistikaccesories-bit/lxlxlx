
import React from 'react';
import { Product } from '../types.ts';

interface ProductGalleryProps {
  products: Product[];
  onAddToCart: (p: Product) => void;
  onBack?: () => void;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ products, onAddToCart, onBack }) => {
  return (
    <div className="py-24 px-4 max-w-7xl mx-auto relative">
      {onBack && (
        <button
          onClick={onBack}
          className="md:hidden fixed top-28 left-4 z-50 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors bg-black/50 backdrop-blur-md px-3 py-2 rounded-full border border-white/10"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-xs font-bold uppercase tracking-widest">Back</span>
        </button>
      )}

      <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
        <div>
          <h2 className="text-4xl md:text-6xl font-black mb-4 font-heading silver-gradient">THE COLLECTION</h2>
          <p className="text-zinc-600 uppercase tracking-[0.4em] text-[9px] font-black">Industrial Design • Built For Life</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        {products.map(product => (
          <div key={product.id} className="group relative glass rounded-[3rem] overflow-hidden hover:border-white/20 transition-all duration-700">
            <div className="aspect-[4/5] overflow-hidden bg-zinc-950 relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute top-8 right-8 px-4 py-1.5 glass rounded-full text-[10px] font-black tracking-widest uppercase">
                ${product.price}
              </div>
            </div>
            <div className="p-10">
              <h3 className="font-heading font-black text-2xl mb-3 silver-gradient">{product.name}</h3>
              <p className="text-sm text-zinc-500 mb-10 leading-relaxed line-clamp-2">{product.description}</p>

              <button
                onClick={() => onAddToCart(product)}
                className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 group/btn"
              >
                Add to Cart
                <svg className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>
          </div>
        ))}

        {/* Person Silhouette Service */}
        <div className="group relative glass rounded-[3rem] overflow-hidden bg-gradient-to-br from-white/5 to-transparent border-white/5 p-12 text-center flex flex-col justify-center min-h-[450px]">
          <div className="w-20 h-20 rounded-full glass flex items-center justify-center mb-8 mx-auto group-hover:silver-glow transition-all duration-500">
            <svg className="w-10 h-10 text-white opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <h3 className="font-heading font-black text-3xl mb-4 silver-gradient uppercase tracking-tighter leading-none">Portrait <br />Silhouette</h3>
          <p className="text-sm text-zinc-600 leading-relaxed mb-10 italic">"Immortalize your legacy. A photograph becomes an indestructible surgical steel masterpiece."</p>
          <button
            onClick={() => window.open('https://wa.me/96181388115?text=Hello! I am inquiring about a custom Portrait Silhouette.', '_blank')}
            className="px-10 py-4 glass text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-white hover:text-black transition-all"
          >
            Send Photo
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductGallery;
