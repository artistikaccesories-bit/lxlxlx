import React from 'react';
import { LayoutDashboard, Wifi, ShoppingCart, ShoppingBag, Package, Settings, Table } from 'lucide-react';

type Tab = 'dashboard' | 'live' | 'orders' | 'inventory' | 'marketplace' | 'settings';


interface BottomNavProps {
    active: Tab;
    onChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; Icon: any }[] = [
    { id: 'dashboard', label: 'Home', Icon: LayoutDashboard },
    { id: 'live', label: 'Live', Icon: Wifi },

    { id: 'orders', label: 'Orders', Icon: ShoppingBag },
    { id: 'inventory', label: 'Inventory', Icon: Package },
    { id: 'marketplace', label: 'Market', Icon: Table },
    { id: 'settings', label: 'Settings', Icon: Settings },
];

const BottomNav: React.FC<BottomNavProps> = ({ active, onChange }) => {
    return (
        <nav className="bottom-nav">
            {tabs.map(({ id, label, Icon }) => (
                <button
                    key={id}
                    className={`bottom-nav__item ${active === id ? 'bottom-nav__item--active' : ''}`}
                    onClick={() => onChange(id)}
                >
                    <Icon size={20} />
                    <span>{label}</span>
                    {id === 'live' && (
                        <span className="bottom-nav__live-dot" />
                    )}
                </button>
            ))}
        </nav>
    );
};

export default BottomNav;
