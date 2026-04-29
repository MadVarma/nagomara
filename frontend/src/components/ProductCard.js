import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);
  return (
    <div style={{ border: '1px solid #ccc', padding: 16, width: 250 }}>
      <img src={product.image} alt={product.name} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
      <h3>{product.name}</h3>
      <p>{product.brand}</p>
      <p>{product.category}</p>
      <p>${product.price}</p>
      <button onClick={() => addToCart(product)}>Add to Cart</button>
    </div>
  );
}
