
import React, { useState } from 'react';
import { Product } from '../types.ts';
import ProductModal from './ProductModal.tsx';
// import { PRODUCTS } from '../src/data/products.ts'; // dynamic now

interface ProductGalleryProps {
  products: Product[];
  onAddToCart: (p: Product, frontText: string, backText: string | undefined, isDoubleSided: boolean, isGiftBox: boolean) => void;
  onBack?: () => void;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ products, onAddToCart, onBack }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div id="product-gallery" className="py-24 px-4 max-w-7xl mx-auto relative">
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

      <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8 relative z-10">
        <div>
          <h2 className="text-4xl md:text-7xl font-black font-heading tracking-tighter text-white mb-6 leading-none">
            THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500">COLLECTION</span>
          </h2>
          <p className="text-zinc-400 max-w-xl text-lg leading-relaxed font-light">
            Precision-engineered artifacts. Choose your canvas.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-zinc-500">
          <span className="text-white">{products.length} Variants</span>
          <div className="h-px w-12 bg-zinc-800"></div>
          <span>2024 Series</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 relative z-10">
        {products.map(product => (
          <div
            key={product.id}
            onClick={() => setSelectedProduct(product)}
            className="group cursor-pointer relative"
          >
            <div className="absolute -inset-0.5 bg-white rounded-[2rem] opacity-0 group-hover:opacity-10 blur transition duration-500"></div>
            <div className="relative aspect-square bg-zinc-900/50 backdrop-blur-sm overflow-hidden mb-6 border border-white/5 rounded-[2rem] transition-all duration-500 group-hover:border-white/20">
              <div className="absolute inset-0 bg-gradient-to-t from-deep-black/80 to-transparent z-10 opacity-60"></div>

              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              <div className="absolute bottom-6 left-6 z-20 w-[calc(100%-3rem)]">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-xs font-bold text-white uppercase tracking-widest block mb-2">{product.category}</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/10 group-hover:bg-white group-hover:text-black transition-all duration-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-start px-2">
              <div>
                <h3 className="text-lg md:text-2xl font-black font-heading text-white mb-2 group-hover:text-zinc-300 transition-all duration-300">{product.name}</h3>
                <div className="flex items-center gap-2">
                  {product.isBestSeller && (
                    <span className="text-[9px] text-black font-bold uppercase tracking-wider bg-white px-2 py-1 rounded-sm">Best Seller</span>
                  )}
                  {product.originalPrice && (
                    <span className="text-[9px] text-white font-bold uppercase tracking-wider bg-zinc-800 px-2 py-1 rounded-sm border border-white/20">Sale</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end">
                {product.originalPrice && (
                  <span className="text-xs text-zinc-600 line-through mb-0.5">${product.originalPrice}</span>
                )}
                <span className={`font-mono text-xl font-bold ${product.originalPrice ? 'text-white' : 'text-zinc-300 group-hover:text-white transition-colors'}`}>${product.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={onAddToCart}
        />
      )}
    </div>
  );
};

export default ProductGallery;
