
import React from 'react';
import { CartItem } from '../types.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  deliveryType: 'none' | 'standard' | 'express';
  setDeliveryType: (type: 'none' | 'standard' | 'express') => void;
  total: number;
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, onClose, items, updateQuantity, deliveryType, setDeliveryType, total, onCheckout 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-zinc-950 border-l border-white/5 h-full flex flex-col animate-in slide-in-from-right duration-500">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-black font-heading tracking-[0.2em] uppercase silver-gradient">Your Order</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-8 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
              <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              <p className="font-black uppercase tracking-[0.3em] text-[10px]">Vault Empty</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-6 glass p-5 rounded-3xl border-white/5">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-zinc-900 flex-shrink-0">
                  <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <h4 className="font-black text-sm silver-gradient uppercase mb-1">{item.name}</h4>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">${item.price}</p>
                  </div>
                  <div className="flex items-center glass rounded-xl px-2 py-1.5 w-fit">
                    <button onClick={() => updateQuantity(item.id, -1)} className="px-3 text-zinc-500 hover:text-white font-bold">-</button>
                    <span className="px-3 text-xs font-black">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="px-3 text-zinc-500 hover:text-white font-bold">+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-8 border-t border-white/5 bg-zinc-950/80 backdrop-blur-2xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
            <div className="mb-8">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4">Delivery Option (Lebanon)</p>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setDeliveryType('none')} className={`p-3 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all ${deliveryType === 'none' ? 'border-white bg-white text-black' : 'border-white/5 text-zinc-500'}`}>Pickup</button>
                <button onClick={() => setDeliveryType('standard')} className={`p-3 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all ${deliveryType === 'standard' ? 'border-white bg-white text-black' : 'border-white/5 text-zinc-500'}`}>Std $4</button>
                <button onClick={() => setDeliveryType('express')} className={`p-3 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all ${deliveryType === 'express' ? 'border-white bg-white text-black' : 'border-white/5 text-zinc-500'}`}>48h $6</button>
              </div>
            </div>
            
            <div className="space-y-3 mb-10 text-[11px] font-bold uppercase tracking-widest">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span>${items.reduce((a, b) => a + (b.price * b.quantity), 0)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Delivery</span>
                <span>${deliveryType === 'standard' ? 4 : deliveryType === 'express' ? 6 : 0}</span>
              </div>
              <div className="flex justify-between text-white font-black text-2xl pt-4 border-t border-white/10 silver-gradient">
                <span>Total</span>
                <span>${total}</span>
              </div>
            </div>

            <button 
              onClick={onCheckout}
              className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-[2rem] hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 silver-glow"
            >
              Order via WhatsApp
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
