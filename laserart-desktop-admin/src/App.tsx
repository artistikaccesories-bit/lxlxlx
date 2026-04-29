import { useState } from 'react';
import { useEffect } from 'react';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import LiveVisitorsScreen from './screens/LiveVisitorsScreen';
import CartScreen from './screens/CartScreen';
import OrdersScreen from './screens/OrdersScreen';
import InventoryScreen from './screens/InventoryScreen';
import MarketplaceScreen from './screens/MarketplaceScreen';
import SettingsScreen from './screens/SettingsScreen';
import BottomNav from './components/BottomNav';
import { auth, onAuthStateChanged, signOut } from './utils/firebase';
import './index.css';

type Tab = 'dashboard' | 'live' | 'carts' | 'orders' | 'inventory' | 'marketplace' | 'settings';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (user: any) => {
      setAuthenticated(Boolean(user));
      setAdminEmail(user?.email || '');
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
    setAuthenticated(false);
    setAdminEmail('');
    setActiveTab('dashboard');
  };

  if (authLoading) {
    return <div className="loading-state"><div className="spinner" /><p>Restoring session...</p></div>;
  }

  if (!authenticated) {
    return <LoginScreen onLogin={(email) => { setAuthenticated(true); setAdminEmail(email); }} />;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardScreen />;
      case 'live': return <LiveVisitorsScreen />;
      case 'carts': return <CartScreen />;
      case 'orders': return <OrdersScreen />;
      case 'inventory': return <InventoryScreen />;
      case 'marketplace': return <MarketplaceScreen />;
      case 'settings': return <SettingsScreen onLogout={handleLogout} adminEmail={adminEmail} />;
      default: return <DashboardScreen />;
    }
  };

  return (
    <div className="app">
      <div className="app-bg-glow" />
      <main className="app__main">
        {renderScreen()}
      </main>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}

export default App;
