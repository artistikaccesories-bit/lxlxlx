
import React, { useState } from 'react';
import Navbar from './components/Navbar.tsx';
import Hero from './components/Hero.tsx';
import ProductGallery from './components/ProductGallery.tsx';
import AICustomizer from './components/AICustomizer.tsx';
import Footer from './components/Footer.tsx';
import CartDrawer from './components/CartDrawer.tsx';
import { CartItem, Product } from './types.ts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'products' | 'customize'>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'none' | 'standard' | 'express'>('standard');

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const deliveryCost = deliveryType === 'standard' ? 4 : deliveryType === 'express' ? 6 : 0;
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + (cart.length > 0 ? deliveryCost : 0);

  const handleCheckout = () => {
    const itemsList = cart.map(item => `• ${item.quantity}x ${item.name} ($${item.price * item.quantity})`).join('\n');
    const deliveryInfo = deliveryType === 'express' ? '🚀 Express (48h) - $6' : deliveryType === 'standard' ? '🚚 Standard - $4' : '🏠 Pickup - $0';
    
    const message = `*LASERARTLB - NEW ORDER*\n\n*Items:*\n${itemsList}\n\n*Delivery:* ${deliveryInfo}\n*Total:* $${total}\n\n*Customer Request:* I've finished my cart on the website and would like to finalize my order. Please let me know how to proceed with the custom details!`;
    
    window.open(`https://wa.me/96181388115?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-white selection:text-black">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
      />
      
      <main className="flex-grow">
        {activeTab === 'home' && (
          <>
            <Hero onExplore={() => setActiveTab('products')} />
            <section className="bg-zinc-950 py-12 border-y border-white/5">
              <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="flex flex-col items-center text-center">
                  <span className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.3em] mb-2">Delivery</span>
                  <span className="text-sm font-bold">$4 Std / $6 Express</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.3em] mb-2">Coverage</span>
                  <span className="text-sm font-bold">All Lebanon</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.3em] mb-2">Speed</span>
                  <span className="text-sm font-bold">48h Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.3em] mb-2">Payment</span>
                  <span className="text-sm font-bold">Cash on Delivery</span>
                </div>
              </div>
            </section>
          </>
        )}
        {activeTab === 'products' && <ProductGallery onAddToCart={addToCart} />}
        {activeTab === 'customize' && <AICustomizer />}
      </main>

      <Footer />
      
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart}
        updateQuantity={updateQuantity}
        deliveryType={deliveryType}
        setDeliveryType={setDeliveryType}
        total={total}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default App;
