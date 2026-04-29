import { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get(`/api/products?search=${search}`)
      .then(res => setProducts(res.data));
  }, [search]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search footwear..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ margin: 16, padding: 8 }}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
