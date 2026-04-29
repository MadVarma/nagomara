import { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const { token } = useContext(AuthContext);

  const addToCart = (product) => {
    const cartKey = product.id + (product.selectedSize || '');
    setCart(prev => {
      const exists = prev.find(item => item.cartKey === cartKey);
      if (exists) return prev.map(item => item.cartKey === cartKey ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1, cartKey }];
    });
  };

  const removeFromCart = (cartKey) => setCart(prev => prev.filter(item => item.cartKey !== cartKey));

  const updateQty = (cartKey, qty) => {
    if (qty < 1) return removeFromCart(cartKey);
    setCart(prev => prev.map(item => item.cartKey === cartKey ? { ...item, quantity: qty } : item));
  };

  const clearCart = () => setCart([]);

  const checkout = async (shippingAddress) => {
    const t = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    if (!t) return { success: false, message: 'Login required' };
    try {
      await axios.post('/api/orders', {
        items: cart.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price, size: item.selectedSize || null })),
        shippingAddress: shippingAddress || 'Default Address',
        totalAmount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      }, { headers: { Authorization: `Bearer ${t}` } });
      clearCart();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Checkout failed' };
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, checkout, total }}>
      {children}
    </CartContext.Provider>
  );
}

