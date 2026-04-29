const { supabase } = require('../utils/db');

exports.getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = supabase.from('products').select('*');
    if (search) query = query.ilike('name', `%${search}%`);
    if (category) query = query.eq('category', category);
    const { data: products, error } = await query;
    if (error) throw error;
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const { data: product, error } = await supabase.from('products').select('*').eq('id', req.params.id).single();
    if (error || !product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product', error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, image, images, brand, category, stock, sizes } = req.body;
    const primaryImage = (images && images[0]) || image || '';
    const { data: product, error } = await supabase.from('products')
      .insert({ name, description, price, image: primaryImage, images: images || [], brand, category, stock, sizes: sizes || [] })
      .select().single();
    if (error) throw error;
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create product', error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const body = { ...req.body };
    // Keep image in sync with first of images array
    if (Array.isArray(body.images) && body.images.length > 0) body.image = body.images[0];
    const { data: product, error } = await supabase.from('products')
      .update(body)
      .eq('id', req.params.id)
      .select().single();
    if (error || !product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product', error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    // Remove order_items referencing this product first (FK constraint)
    await supabase.from('order_items').delete().eq('product_id', req.params.id);
    const { error } = await supabase.from('products').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
};
