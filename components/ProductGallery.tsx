
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
          <h2 className="text-5xl md:text-7xl font-black font-heading tracking-tighter text-white mb-6">
            THE <span className="text-stroke-silver text-transparent">COLLECTION</span>
          </h2>
          <p className="text-zinc-400 max-w-xl text-lg leading-relaxed font-light">
            Precision-engineered artifacts. Choose your canvas.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-zinc-500">
          <span>{products.length} Variants</span>
          <div className="h-px w-12 bg-zinc-800"></div>
          <span>2024 Series</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        {products.map(product => (
          <div
            key={product.id}
            onClick={() => setSelectedProduct(product)}
            className="group cursor-pointer"
          >
            <div className="relative aspect-square bg-zinc-900 overflow-hidden mb-6 border border-white/5 rounded-[2rem]">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out group-hover:duration-500"
              />
              {/* Holographic Reflection Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-overlay"></div>

              <div className="absolute bottom-6 left-6 z-20">
                <div className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-3">
                  <span className="text-xs font-bold text-white uppercase tracking-widest">Configure</span>
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black font-heading silver-gradient mb-2">{product.name}</h3>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-[0.2em]">{product.category}</p>
                  {product.isBestSeller && (
                    <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider bg-yellow-400/10 px-1.5 py-0.5 rounded border border-yellow-400/20 shadow-[0_0_10px_rgba(250,204,21,0.2)]">Best Seller</span>
                  )}
                  {product.originalPrice && (
                    <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider bg-red-500/10 px-1.5 py-0.5 rounded">Sale</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end">
                {product.originalPrice && (
                  <span className="text-xs text-zinc-600 line-through mb-0.5">${product.originalPrice}</span>
                )}
                <span className={`font-mono text-lg ${product.originalPrice ? 'text-red-500' : 'text-zinc-400'}`}>${product.price}</span>
                {product.stock && (
                  <span className="text-[9px] text-zinc-500 font-mono tracking-widest mt-1">
                    Only {product.stock} left
                  </span>
                )}
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
