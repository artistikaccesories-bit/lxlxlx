
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
import { Product, CartItem } from './types.ts';
import { PRODUCTS as STATIC_PRODUCTS } from './src/data/products.ts';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'keychains' | 'customize'>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'standard' | 'express'>('standard');
  const [products, setProducts] = useState<Product[]>(STATIC_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);


  // Initialize GA
  React.useEffect(() => {
    initGA();
  }, []);

  // Handle initial URL and browser back/forward buttons
  React.useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        if (event.state.img) {
          // Handle product modal state if it exists 
          // (assuming we start adding product info to state, 
          // but for now let's rely on handle lookup if we want robust linking)
        }

        if (event.state.tab) {
          setActiveTab(event.state.tab);
        } else {
          setActiveTab('home');
        }

        if (event.state.productHandle) {
          const product = products.find(p => p.handle === event.state.productHandle);
          if (product) setSelectedProduct(product);
        } else {
          setSelectedProduct(null);
        }
      } else {
        // No state (e.g. initial load or external link), check URL
        checkUrlForRoute();
      }
    };

    const checkUrlForRoute = () => {
      const path = window.location.pathname;
      if (path.startsWith('/product/')) {
        const handle = path.split('/product/')[1];
        const product = products.find(p => p.handle === handle);
        if (product) {
          setSelectedProduct(product);
          // Map category to tab
          if (product.category === 'keychain') setActiveTab('keychains');
          else if (product.category === 'tag') setActiveTab('keychains'); // Assuming tags are in keychains for now or generic
          else if (product.category === 'tool') setActiveTab('keychains');
          else setActiveTab('keychains'); // Default fallback
        }
      } else {
        // Handle other routes if necessary
        const tab = path.substring(1) as any;
        if (['keychains', 'customize'].includes(tab)) {
          setActiveTab(tab);
        } else {
          setActiveTab('home');
        }
        setSelectedProduct(null);
      }
    }

    // Run on mount
    checkUrlForRoute();

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products]);

  // Track page views
  React.useEffect(() => {
    logPageView();
    window.scrollTo(0, 0);
  }, [activeTab]);


  // Update URL function
  const handleTabChange = (tab: 'home' | 'keychains' | 'customize') => {
    setActiveTab(tab);
    setSelectedProduct(null);
    window.history.pushState({ tab }, '', tab === 'home' ? '/' : `/${tab}`);
  };

  const handleProductSelect = (product: Product | null) => {
    setSelectedProduct(product);
    if (product) {
      // When opening a product, push a new history state
      window.history.pushState(
        { tab: activeTab, productHandle: product.handle },
        '',
        `/product/${product.handle || product.id}`
      );
    } else {
      // When closing, go back to the tab URL
      // We pushState here to avoid actually going "back" if we want to preserve history stack, 
      // OR we could use back(). 
      // Using pushState is safer for avoiding exiting the app.
      window.history.pushState(
        { tab: activeTab },
        '',
        activeTab === 'home' ? '/' : `/${activeTab}`
      );
    }
  };



  const handleGallerySelection = (category: 'keychains' | 'mom-special') => {
    if (category === 'keychains') {
      handleTabChange('keychains');
    } else if (category === 'mom-special') {
      handleTabChange('keychains');
      const momProduct = products.find(p => p.handle === 'mom-keychain-special' || p.id === '13');
      if (momProduct) {
        handleProductSelect(momProduct);
      }
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
          <ProductGallery
            products={products}
            onAddToCart={addToCart}
            onBack={() => handleTabChange('home')}
            selectedProduct={selectedProduct}
            onSelectProduct={handleProductSelect}
          />
        </main>
      )}

      {activeTab === 'customize' && (
        <main>
          <ProductGallery
            products={products}
            onAddToCart={addToCart}
            onBack={() => handleTabChange('home')}
            selectedProduct={selectedProduct}
            onSelectProduct={handleProductSelect}
          />
        </main>
      )}

      <Footer
        onNavigate={handleTabChange}
        onServicesClick={() => {
          handleTabChange('home');
          setTimeout(() => {
            const element = document.getElementById('services');
            if (element) element.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
      />

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
