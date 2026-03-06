
import React, { useState } from 'react';
import { initGA, logPageView } from './src/utils/analytics';
import { sendDiscordMessage, sendDiscordMessageBeacon } from './src/utils/discord';
import { db, collection, addDoc, Timestamp, doc, updateDoc } from './src/utils/firebase';
import Navbar from './components/Navbar.tsx';
import Hero from './components/Hero.tsx';
import ProductGallery, { ProductCard } from './components/ProductGallery.tsx';
import Footer from './components/Footer.tsx';
import CartDrawer from './components/CartDrawer.tsx';
import AboutUs from './components/AboutUs.tsx';
import Services from './components/Services.tsx';
import CustomPreview from './components/CustomPreview.tsx';
import SocialProof from './components/SocialProof.tsx';
import TrustBadges from './components/TrustBadges.tsx';
import Countdown from './components/Countdown.tsx';
import LiveVisitorCounter from './components/LiveVisitorCounter.tsx';
import ExitIntentPopup from './components/ExitIntentPopup.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';

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
  const [isAdminView, setIsAdminView] = useState(false);

  // Foolproof fallback to check admin route constantly just in case events fail
  React.useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      if (hash === '#admin' || path === '/admin') {
        if (!isAdminView) setIsAdminView(true);
      } else {
        if (isAdminView) setIsAdminView(false);
      }
    };

    // Check immediately
    checkHash();

    // Check periodically for tricky browser caching/anchor bugs
    const interval = setInterval(checkHash, 500);
    return () => clearInterval(interval);
  }, [isAdminView]);


  // Initialize GA
  React.useEffect(() => {
    initGA();
  }, []);

  // Discord tracking
  React.useEffect(() => {
    const sessionKey = 'website_session_start';
    let entryTime = sessionStorage.getItem(sessionKey);

    if (!entryTime) {
      entryTime = Date.now().toString();
      sessionStorage.setItem(sessionKey, entryTime);

      // Fetch Geolocation and store it for the exit message
      fetch('https://get.geojs.io/v1/ip/geo.json')
        .then(res => res.json())
        .then(data => {
          sessionStorage.setItem('website_visitor_geo', JSON.stringify({
            country: data.country,
            city: data.city,
            ip: data.ip,
            organization: data.organization_name || 'Unknown ISP',
            region: data.region || 'Unknown Region'
          }));
        })
        .catch(() => console.warn('Geo fetch failed'));

      // Store detailed device info
      const ua = navigator.userAgent;
      let deviceName = 'Unknown Device';

      if (/windows phone/i.test(ua)) {
        deviceName = 'Windows Phone 📱';
      } else if (/android/i.test(ua)) {
        // Try to extract Android model
        const match = ua.match(/Android\s+[0-9\.]+(?:;\s+([^;]+))?/);
        deviceName = match && match[1] ? `Android (${match[1]}) 📱` : 'Android 📱';
      } else if (/ipad|iphone|ipod/i.test(ua)) {
        // For iOS, user-agent doesn't expose exact model (e.g., iPhone 13 vs 14)
        deviceName = /ipad/i.test(ua) ? 'iPad 📱' : 'iPhone 📱';
      } else if (/mac/i.test(ua)) {
        deviceName = 'Mac 💻';
      } else if (/win/i.test(ua)) {
        deviceName = 'Windows PC 💻';
      } else if (/linux/i.test(ua)) {
        deviceName = 'Linux PC 💻';
      } else {
        deviceName = /Mobile/.test(ua) ? 'Mobile 📱' : 'Desktop 💻';
      }

      // Capture advanced details: Referrer and Screen Size
      const referrer = document.referrer ? new URL(document.referrer).hostname : 'Direct Entry';
      const screenSize = `${window.screen.width}x${window.screen.height}`;
      const browserLanguage = navigator.language || 'Unknown';

      sessionStorage.setItem('website_visitor_device', deviceName);
      sessionStorage.setItem('website_visitor_referrer', referrer);
      sessionStorage.setItem('website_visitor_screen', screenSize);
      sessionStorage.setItem('website_visitor_language', browserLanguage);

      // Save initial visit to Firebase if configured
      if (db) {
        addDoc(collection(db, "visitors"), {
          sessionKey: entryTime,
          timestamp: Timestamp.now(),
          lastActive: Timestamp.now(),
          activeCartCount: 0,
          device: deviceName,
          referrer: referrer,
          screenSize: screenSize,
          language: browserLanguage,
          location: sessionStorage.getItem('website_visitor_geo') ? JSON.parse(sessionStorage.getItem('website_visitor_geo')!) : { city: 'Unknown', country: 'Unknown', region: 'Unknown' },
          pagesViewed: ['Home'],
          durationSec: 0,
          isActive: true
        }).then(docRef => {
          sessionStorage.setItem('firebase_doc_id', docRef.id);
        }).catch(err => console.error("Firebase write err", err));

        // Ping firebase every 1 minute to keep session alive and visible to Dashboard
        const pingInterval = setInterval(() => {
          const docId = sessionStorage.getItem('firebase_doc_id');
          if (docId && db) {
            updateDoc(doc(db, "visitors", docId), {
              lastActive: Timestamp.now()
            }).catch(() => { });
          }
        }, 60000);

        // Cleanup interval on page unload
        window.addEventListener('beforeunload', () => clearInterval(pingInterval));
      }
    }

    let lastSent = 0;
    const sendExitNotification = () => {
      const now = Date.now();
      if (now - lastSent < 2000) return; // Prevent duplicate rapid sends
      lastSent = now;

      // Anti-spam 18h limit per device
      const lastWebhookSentStr = localStorage.getItem('last_webhook_sent');
      if (lastWebhookSentStr) {
        const lastWebhookSent = parseInt(lastWebhookSentStr, 10);
        const hoursSinceLastSent = (now - lastWebhookSent) / (1000 * 60 * 60);
        if (hoursSinceLastSent < 18) {
          return; // Skip if sent within last 18 hours
        }
      }

      const start = parseInt(sessionStorage.getItem(sessionKey) || Date.now().toString());
      const durationSec = Math.floor((Date.now() - start) / 1000);

      // If they literally just opened and immediately closed (0-2 seconds), maybe don't spam, or just send a quick one.
      // We'll send it anyway as requested.

      let durationStr = `${durationSec} seconds`;
      if (durationSec > 60) {
        durationStr = `${Math.floor(durationSec / 60)} m ${durationSec % 60} s`;
      }

      const viewedItems = JSON.parse(sessionStorage.getItem('website_viewed_items') || '[]');
      const itemsList = viewedItems.length > 0 ? viewedItems.join(', ') : 'None';

      const geo = JSON.parse(sessionStorage.getItem('website_visitor_geo') || '{"country":"Unknown","city":"Unknown","region":"Unknown","organization":"Unknown"}');
      const device = sessionStorage.getItem('website_visitor_device') || 'Unknown';
      const referrer = sessionStorage.getItem('website_visitor_referrer') || 'Unknown';
      const screenSize = sessionStorage.getItem('website_visitor_screen') || 'Unknown';

      const countryStr = typeof geo.country === 'string' ? geo.country.toLowerCase() : 'unknown';
      const isLebanon = countryStr.includes('lebanon') || countryStr === 'lb';

      // If not from Lebanon, only send if they spent more than 10 seconds or clicked around
      const isSignificantVisit = durationSec > 10 || viewedItems.length > 0;

      if (!isLebanon && !isSignificantVisit) {
        return; // Skip spam from foreign bots/quick bounces
      }

      // Only ping @everyone for Lebanon visitors or significant visitors
      const mention = isLebanon ? '@everyone ' : '';

      const message = `${mention}👋 **Visitor Session Ended**
🌍 **Location:** ${geo.city}, ${geo.region}, ${geo.country}
🏢 **Network:** ${geo.organization}
💻 **Device:** ${device} (Screen: ${screenSize})
🔍 **Source:** ${referrer}
⏱️ **Duration:** ${durationStr}
👀 **Viewed Items/Pages:** ${itemsList}`;

      // Use beacon for guaranteed delivery on page exit/tab close
      sendDiscordMessageBeacon(message);

      // Record successful send
      localStorage.setItem('last_webhook_sent', now.toString());

      // Update Firebase on exit if applicable
      if (db) {
        const docId = sessionStorage.getItem('firebase_doc_id');
        if (docId) {
          // Usually we'd updateDoc but addDoc for an "exit" event is also fine if we track history.
          // A simple fire-and-forget exit log to make stats easier for the dashboard:
          addDoc(collection(db, "exits"), {
            sessionKey: start.toString(),
            timestamp: Timestamp.now(),
            durationSec: durationSec,
            pagesCount: viewedItems.length
          }).catch(e => console.error(e));
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendExitNotification();
      }
    };

    const handlePageHide = () => {
      sendExitNotification();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);
    };
  }, []);

  // Handle initial URL and browser back/forward buttons
  React.useEffect(() => {
    const handleNavigationEvent = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;

      if (path === '/admin' || hash === '#admin') {
        setIsAdminView(true);
        // Do not return here so the rest of the states can reset properly if needed
      } else {
        setIsAdminView(false);
      }

      // Existing PopState logic
      if (window.history.state) {
        if (window.history.state.tab) {
          setActiveTab(window.history.state.tab);
        } else {
          setActiveTab('home');
        }

        if (window.history.state.productHandle) {
          const product = products.find(p => p.handle === window.history.state.productHandle);
          if (product) setSelectedProduct(product);
        } else {
          setSelectedProduct(null);
        }
      } else {
        // Fallback checks
        if (path.startsWith('/product/')) {
          const handle = path.split('/product/')[1];
          const product = products.find(p => p.handle === handle);
          if (product) {
            setSelectedProduct(product);
            if (product.category === 'keychain') setActiveTab('keychains');
            else if (product.category === 'tag') setActiveTab('keychains');
            else if (product.category === 'tool') setActiveTab('keychains');
            else setActiveTab('keychains');
          }
        } else {
          const tab = path.substring(1) as any;
          if (['keychains', 'customize'].includes(tab)) {
            setActiveTab(tab);
          } else {
            setActiveTab('home');
          }
          setSelectedProduct(null);
        }
      }
    };

    const checkUrlForRoute = () => {
      handleNavigationEvent();
    };

    // Run on mount
    checkUrlForRoute();

    window.addEventListener('popstate', checkUrlForRoute);
    window.addEventListener('hashchange', checkUrlForRoute);
    return () => {
      window.removeEventListener('popstate', checkUrlForRoute);
      window.removeEventListener('hashchange', checkUrlForRoute);
    };
  }, [products]);

  // Track page views
  React.useEffect(() => {
    logPageView();
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Track cart changes and send Discord pings / Firebase updates
  const previousCartLength = React.useRef(0);
  React.useEffect(() => {
    if (cart.length !== previousCartLength.current) {
      const isAddition = cart.length > previousCartLength.current;
      previousCartLength.current = cart.length;

      // Update Firebase
      const docId = sessionStorage.getItem('firebase_doc_id');
      if (docId && db) {
        try {
          updateDoc(doc(db, "visitors", docId), {
            activeCartCount: cart.length,
            lastActive: Timestamp.now()
          }).catch(() => { });
        } catch (e) { }
      }

      // Discord alert
      if (isAddition && cart.length > 0) {
        // Debounce it slightly so we don't spam if they double click
        const addedItem = cart[cart.length - 1];
        sendDiscordMessage(`🛒 **Cart Update:** Someone just added a ${addedItem.name} to their cart! (${cart.length} total items in active cart)`);
      }
    }
  }, [cart]);


  // Update URL function
  const handleTabChange = (tab: 'home' | 'keychains' | 'customize') => {
    setActiveTab(tab);
    setSelectedProduct(null);

    // Track category visited
    const viewedItems = JSON.parse(sessionStorage.getItem('website_viewed_items') || '[]');
    const tabName = tab === 'home' ? 'Home Page' : tab === 'keychains' ? 'Keychains Gallery' : 'Customize Gallery';
    if (!viewedItems.includes(tabName)) {
      viewedItems.push(tabName);
      sessionStorage.setItem('website_viewed_items', JSON.stringify(viewedItems));
    }

    window.history.pushState({ tab }, '', tab === 'home' ? '/' : `/${tab}`);
  };

  const handleProductSelect = (product: Product | null) => {
    setSelectedProduct(product);
    if (product) {
      // Track viewed item
      const viewedItems = JSON.parse(sessionStorage.getItem('website_viewed_items') || '[]');
      if (!viewedItems.includes(product.name)) {
        viewedItems.push(product.name);
        sessionStorage.setItem('website_viewed_items', JSON.stringify(viewedItems));
      }

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

  const navigateToSearch = () => {
    handleTabChange('keychains');
    setTimeout(() => {
      const searchInput = document.querySelector('input[placeholder="Search products..."]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
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

  if (isAdminView) {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black relative">
      <LiveVisitorCounter />
      <Countdown />
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onToggleSearch={navigateToSearch}
      />

      {activeTab === 'home' && (
        <main>
          <Hero onExplore={() => {
            const element = document.getElementById('gallery-selector');
            if (element) element.scrollIntoView({ behavior: 'smooth' });
          }} />

          <CustomPreview />

          <section className="py-20 px-4 max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-black font-heading text-white mb-4">BEST <span className="text-zinc-500">SELLERS</span></h2>
              <p className="text-zinc-400">Our most loved customized pieces.</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {products.filter(p => p.isBestSeller).map(product => (
                <ProductCard key={product.id} product={product} onClick={() => {
                  handleTabChange('keychains');
                  setTimeout(() => handleProductSelect(product), 50);
                }} />
              ))}
            </div>
          </section>

          <SocialProof />

          <GallerySelector onSelectCategory={handleGallerySelection} />
          <TrustBadges />
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

      {/* Exit Intent Pop-up */}
      <ExitIntentPopup cartItemsCount={cart.reduce((total, item) => total + item.quantity, 0)} />
    </div>
  );
}

export default App;
