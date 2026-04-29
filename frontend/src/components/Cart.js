import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

export default function Cart() {
  const { cart, removeFromCart, clearCart, checkout } = useContext(CartContext);
  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <h2>Your Cart</h2>
      {cart.length === 0 ? <p>Cart is empty.</p> : (
        <>
          <ul>
            {cart.map(item => (
              <li key={item.id}>
                {item.name} (${item.price}) x {item.quantity}
                <button onClick={() => removeFromCart(item.id)}>Remove</button>
              </li>
            ))}
          </ul>
          <button onClick={clearCart}>Clear Cart</button>
          <button onClick={checkout}>Checkout</button>
        </>
      )}
    </div>
  );
}
