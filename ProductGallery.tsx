
import React from 'react';
import { Product } from '../types.ts';

interface ProductGalleryProps {
  onAddToCart: (p: Product) => void;
}

const PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'THE ORIGIN | Mirror Finish', 
    price: 15, 
    category: 'keychain', 
    description: 'The catalyst of our studio. A flawless mirror-finish plate that reflects your ambition. Deep-etched with surgical grade lasers for a mark that outlasts the keys it holds.', 
    image: 'https://images.unsplash.com/photo-1620067905412-dc523316503c?auto=format&fit=crop&q=80&w=600' 
  },
  { 
    id: '2', 
    name: 'THE PHANTOM | Obsidian', 
    price: 18, 
    category: 'keychain', 
    description: 'Subtle. Lethal. Absolute. A tactical matte obsidian coating that absorbs light, leaving only the precision-carved steel exposed. For the modern minimalist.', 
    image: 'https://images.unsplash.com/photo-1626265776296-68937961244f?auto=format&fit=crop&q=80&w=600' 
  },
  { 
    id: '3', 
    name: 'THE LEGACY | Monogram', 
    price: 12, 
    category: 'keychain', 
    description: 'Your signature, immortalized. We take your initials and carve them with industrial force into heavy-gauge steel. A permanent heirloom for the daily grind.', 
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&q=80&w=600' 
  },
  { 
    id: '4', 
    name: 'THE LINK | Tech Node', 
    price: 20, 
    category: 'keychain', 
    description: 'Utility meets high-art. A permanent gateway to your digital identity. Scannable, indestructible, and essential for the connected pioneer.', 
    image: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&q=80&w=600' 
  },
];

const ProductGallery: React.FC<ProductGalleryProps> = ({ onAddToCart }) => {
  return (
    <div className="py-24 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
        <div>
          <h2 className="text-4xl md:text-6xl font-black mb-4 font-heading silver-gradient">THE COLLECTION</h2>
          <p className="text-zinc-600 uppercase tracking-[0.4em] text-[9px] font-black">Industrial Design • Built For Life</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        {PRODUCTS.map(product => (
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
           <h3 className="font-heading font-black text-3xl mb-4 silver-gradient uppercase tracking-tighter leading-none">Portrait <br/>Silhouette</h3>
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
