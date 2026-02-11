
import React, { useState } from 'react';
import { initGA, logPageView } from './src/utils/analytics';
import Navbar from './components/Navbar.tsx';
import Hero from './components/Hero.tsx';
import ProductGallery from './components/ProductGallery.tsx';
import Footer from './components/Footer.tsx';
import CartDrawer from './components/CartDrawer.tsx';
import AboutUs from './components/AboutUs.tsx';
import Services from './components/Services.tsx';

import GallerySelector from './components/GallerySelector.tsx';
import CarSilhouettes from './components/CarSilhouettes.tsx';
import PortraitSilhouettes from './components/PortraitSilhouettes.tsx';
import { Product, CartItem } from './types.ts';
import { PRODUCTS as STATIC_PRODUCTS } from './src/data/products.ts';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'keychains' | 'car-silhouettes' | 'portraits' | 'customize'>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'standard' | 'express'>('standard');
  const [products, setProducts] = useState<Product[]>(STATIC_PRODUCTS);

  // Initialize GA
  React.useEffect(() => {
    initGA();
  }, []);

  // Track page views
  React.useEffect(() => {
    logPageView();
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Handle browser back/forward buttons
  React.useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
      } else {
        setActiveTab('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL function
  const handleTabChange = (tab: 'home' | 'keychains' | 'car-silhouettes' | 'portraits' | 'customize') => {
    setActiveTab(tab);
    window.history.pushState({ tab }, '', tab === 'home' ? '/' : `/${tab}`);
  };

  const handleGallerySelection = (category: 'keychains' | 'cars' | 'portraits') => {
    if (category === 'keychains') {
      handleTabChange('keychains');
    } else if (category === 'cars') {
      handleTabChange('car-silhouettes');
    } else if (category === 'portraits') {
      handleTabChange('portraits');
    }
  };

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
      <Navbar activeTab={activeTab} setActiveTab={handleTabChange} cartCount={cart.reduce((a, b) => a + b.quantity, 0)} onCartClick={() => setIsCartOpen(true)} />

      {activeTab === 'home' && (
        <main>
          <Hero onExplore={() => {
            const element = document.getElementById('gallery-selector');
            if (element) element.scrollIntoView({ behavior: 'smooth' });
          }} />
          <GallerySelector onSelectCategory={handleGallerySelection} />
          <AboutUs />
          <Services />
        </main>
      )}

      {activeTab === 'keychains' && (
        <main>
          <ProductGallery products={products} onAddToCart={addToCart} onBack={() => handleTabChange('home')} />
        </main>
      )}

      {activeTab === 'portraits' && (
        <main>
          <PortraitSilhouettes onBack={() => handleTabChange('home')} />
        </main>
      )}

      {activeTab === 'customize' && (
        <main>
          <ProductGallery products={products} onAddToCart={addToCart} onBack={() => handleTabChange('home')} />
        </main>
      )}

      {activeTab === 'car-silhouettes' && (
        <main>
          <CarSilhouettes onBack={() => handleTabChange('home')} />
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
