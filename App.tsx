
import React, { useState } from 'react';
import Navbar from './components/Navbar.tsx';
import Hero from './components/Hero.tsx';
import ProductGallery from './components/ProductGallery.tsx';
import Footer from './components/Footer.tsx';
import CartDrawer from './components/CartDrawer.tsx';
import AboutUs from './components/AboutUs.tsx';
import Services from './components/Services.tsx';
import ComingSoon from './components/ComingSoon.tsx';
import { Product, CartItem } from './types.ts';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'customize'>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'standard' | 'express'>('standard');

  // Google Analytics Tracking
  React.useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', 'G-FCJ59GJJLB', {
        page_path: `/${activeTab}`,
        page_title: activeTab === 'home' ? 'Home' : 'Customize',
      });
    }
  }, [activeTab]);

  const addToCart = (product: Product, engravingText: string, backText: string | undefined, isDoubleSided: boolean, isGiftBox: boolean) => {
    setCart(prev => {
      const existing = prev.find(item =>
        item.id === product.id &&
        item.frontText === engravingText &&
        item.backText === backText &&
        item.isDoubleSided === isDoubleSided &&
        item.isGiftBox === isGiftBox
      );
      if (existing) {
        return prev.map(item => item.internalId === existing.internalId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, {
        ...product,
        internalId: Date.now().toString() + Math.random().toString(),
        quantity: 1,
        frontText: engravingText,
        backText,
        isDoubleSided,
        isGiftBox
      }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.internalId === id) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.internalId !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + ((item.price + (item.isDoubleSided ? 5 : 0) + (item.isGiftBox ? 2 : 0)) * item.quantity), 0);
  const total = subtotal + (deliveryType === 'express' ? 6 : deliveryType === 'standard' ? 4 : 0);

  const handleCheckout = () => {
    const itemsList = cart.map(item => {
      const extras = [];
      if (item.isDoubleSided) extras.push('Double Sided (+$5)');
      if (item.isGiftBox) extras.push('Gift Box (+$2)');
      if (item.frontText) extras.push(`Front: "${item.frontText}"`);
      if (item.backText) extras.push(`Back: "${item.backText}"`);

      const extraStr = extras.length > 0 ? ` [${extras.join(', ')}]` : '';
      const unitPrice = item.price + (item.isDoubleSided ? 5 : 0) + (item.isGiftBox ? 2 : 0);
      return `• ${item.quantity}x ${item.name}${extraStr} - $${unitPrice * item.quantity}`;
    }).join('\n');

    const deliveryInfo = deliveryType === 'express' ? '🚀 Express (48h) - $6' : deliveryType === 'standard' ? '🚚 Standard - $4' : '🏠 Pickup - $0';

    const message = `*LASERARTLB - NEW ORDER*\n\n*Items:*\n${itemsList}\n\n*Delivery:* ${deliveryInfo}\n*Total:* $${total}\n\n*Customer Request:* I've confirmed my order via the website.`;

    window.open(`https://wa.me/96181388115?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} cartCount={cart.reduce((a, b) => a + b.quantity, 0)} onCartClick={() => setIsCartOpen(true)} />

      {activeTab === 'home' && (
        <main>
          <Hero onExplore={() => setActiveTab('customize')} />
          <AboutUs />
          <Services />
          <ComingSoon />
          <ProductGallery onAddToCart={addToCart} />
        </main>
      )}

      {activeTab === 'customize' && (
        <main>
          <ProductGallery onAddToCart={addToCart} />
        </main>
      )}

      <Footer />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        total={total}
        subtotal={subtotal}
        deliveryType={deliveryType}
        setDeliveryType={setDeliveryType}
        onCheckout={handleCheckout}
      />
    </div>
  );
}

export default App;
