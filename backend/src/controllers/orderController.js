const { supabase } = require('../utils/db');

exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, totalAmount } = req.body;
    const { data: order, error: orderError } = await supabase.from('orders')
      .insert({ user_id: req.user.id, status: 'pending', total_amount: totalAmount, shipping_address: shippingAddress, payment_status: 'pending' })
      .select().single();
    if (orderError) throw orderError;
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
      size: item.size || null
    }));
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { data: orders, error } = await supabase.from('orders').select('*, order_items(*)').eq('user_id', req.user.id).order('created_at', { ascending: false });
    if (error) throw error;
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const { data: order, error } = await supabase.from('orders').select('*, order_items(*)').eq('id', req.params.id).eq('user_id', req.user.id).single();
    if (error || !order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order', error: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;

    const userIds = [...new Set(orders.map(o => o.user_id))];
    const { data: users } = await supabase.from('users').select('id, name, email, role').in('id', userIds);
    const userMap = {};
    (users || []).forEach(u => { userMap[u.id] = u; });

    const enriched = orders.map(o => ({ ...o, user: userMap[o.user_id] || null }));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { data: order, error } = await supabase.from('orders').update({ status }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order', error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    await supabase.from('order_items').delete().eq('order_id', req.params.id);
    const { error } = await supabase.from('orders').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete order', error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};
