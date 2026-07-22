import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { User, MenuItem, Order, Promotion, Reservation } from './models.js';
import { auth, optionalAuth, permit, asyncHandler } from './middleware.js';

const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'veloura-api' }));

app.post('/api/auth/register', asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password || password.length < 8) return res.status(400).json({ message: 'Name, email, and an 8+ character password are required' });
  const user = await User.create({ name, email, phone, password: await bcrypt.hash(password, 12) });
  res.status(201).json({ token: jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: '7d' }), user: { id: user.id, name, email, role: user.role } });
}));

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email?.toLowerCase() }).select('+password');
  if (!user || !await bcrypt.compare(req.body.password || '', user.password)) return res.status(401).json({ message: 'Invalid email or password' });
  res.json({ token: jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: '7d' }), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}));

app.get('/api/menu', asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.category && req.query.category !== 'All') query.category = req.query.category;
  if (req.query.available !== 'all') query.available = true;
  if (req.query.search) query.$text = { $search: req.query.search };
  res.json(await MenuItem.find(query).sort({ featured: -1, category: 1, name: 1 }));
}));
app.post('/api/menu', auth, permit('admin'), asyncHandler(async (req, res) => res.status(201).json(await MenuItem.create(req.body))));
app.patch('/api/menu/:id', auth, permit('admin'), asyncHandler(async (req, res) => res.json(await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }))));
app.delete('/api/menu/:id', auth, permit('admin'), asyncHandler(async (req, res) => { await MenuItem.findByIdAndDelete(req.params.id); res.status(204).end(); }));

app.get('/api/promotions', asyncHandler(async (_req, res) => { const now = new Date(); res.json(await Promotion.find({ active: true, $and: [{ $or: [{ startsAt: null }, { startsAt: { $lte: now } }] }, { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] }], $expr: { $or: [{ $not: ['$usageLimit'] }, { $lt: ['$usageCount', '$usageLimit'] }] } }).sort({ createdAt: -1 })); }));
app.post('/api/promotions', auth, permit('admin'), asyncHandler(async (req, res) => res.status(201).json(await Promotion.create(req.body))));
app.get('/api/admin/promotions', auth, permit('admin'), asyncHandler(async (_req, res) => res.json(await Promotion.find().sort({ createdAt: -1 }))));
app.patch('/api/promotions/:id', auth, permit('admin'), asyncHandler(async (req, res) => res.json(await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }))));
app.delete('/api/promotions/:id', auth, permit('admin'), asyncHandler(async (req, res) => { await Promotion.findByIdAndDelete(req.params.id); res.status(204).end(); }));
app.post('/api/promotions/validate', asyncHandler(async (req, res) => {
  const promo = await Promotion.findOne({ code: req.body.code?.toUpperCase(), active: true });
  const now = new Date();
  if (!promo || promo.startsAt > now || promo.endsAt < now || (promo.usageLimit && promo.usageCount >= promo.usageLimit) || req.body.subtotal < promo.minOrder) return res.status(400).json({ message: 'This offer is not valid for this order' });
  const discount = promo.type === 'percentage' ? req.body.subtotal * promo.value / 100 : promo.value;
  res.json({ promotion: promo, discount: Math.min(discount, req.body.subtotal) });
}));

const diningTables = [{ id: '1', capacity: 2 }, { id: '2', capacity: 2 }, { id: '3', capacity: 4 }, { id: '4', capacity: 4 }, { id: '5', capacity: 6 }, { id: '6', capacity: 8 }, { id: '7', capacity: 10 }];
app.get('/api/tables/availability', asyncHandler(async (req, res) => {
  const date = new Date(String(req.query.date));
  const guests = Math.max(1, Number(req.query.guests) || 1);
  if (Number.isNaN(date.getTime())) return res.status(400).json({ message: 'A valid date and time is required' });
  const windowStart = new Date(date.getTime() - 90 * 60 * 1000);
  const windowEnd = new Date(date.getTime() + 90 * 60 * 1000);
  const occupied = await Order.distinct('table', { type: 'dine-in', scheduledFor: { $gte: windowStart, $lte: windowEnd }, status: { $nin: ['cancelled', 'served'] } });
  const suitable = diningTables.filter(table => table.capacity >= guests);
  res.json({ available: suitable.filter(table => !occupied.includes(table.id)).map(table => table.id), requestedFor: date, guests });
}));
app.post('/api/orders', optionalAuth, asyncHandler(async (req, res) => {
  if (!Array.isArray(req.body.items) || !req.body.items.length) return res.status(400).json({ message: 'Your order is empty' });
  const ids = req.body.items.map(item => item.menuItem);
  const menu = await MenuItem.find({ _id: { $in: ids }, available: true });
  const byId = new Map(menu.map(item => [item.id, item]));
  let subtotal = 0;
  const items = req.body.items.map(line => {
    const dish = byId.get(String(line.menuItem));
    if (!dish) throw Object.assign(new Error('One or more dishes are unavailable'), { status: 400 });
    const variant = dish.variants.find(v => v.name === line.variant);
    const allowedAddOns = (line.addOns || []).map(a => dish.addOns.find(x => x.name === a.name)).filter(Boolean);
    const price = dish.price + (variant?.priceDelta || 0) + allowedAddOns.reduce((s, a) => s + a.price, 0);
    const quantity = Math.max(1, Math.min(20, Number(line.quantity) || 1)); subtotal += price * quantity;
    return { menuItem: dish.id, name: dish.name, price, quantity, variant: variant?.name, addOns: allowedAddOns, spiceLevel: line.spiceLevel, notes: line.notes };
  });
  let discount = 0;
  if (req.body.promoCode) {
    const promo = await Promotion.findOne({ code: req.body.promoCode.toUpperCase(), active: true });
    const now = new Date(); const valid = promo && subtotal >= promo.minOrder && (!promo.startsAt || promo.startsAt <= now) && (!promo.endsAt || promo.endsAt >= now) && (!promo.usageLimit || promo.usageCount < promo.usageLimit); if (!valid) return res.status(400).json({ message: 'This promotion is no longer valid' }); discount = Math.min(subtotal, promo.type === 'percentage' ? subtotal * promo.value / 100 : promo.value); promo.usageCount++; await promo.save();
  }
  const tax = (subtotal - discount) * 0.1;
  const deliveryFee = req.body.type === 'delivery' ? 450 : 0;
  if (req.body.type === 'dine-in') {
    const scheduledFor = new Date(req.body.scheduledFor);
    const table = diningTables.find(item => item.id === req.body.table);
    if (!table || Number(req.body.guests || 1) > table.capacity || Number.isNaN(scheduledFor.getTime())) return res.status(400).json({ message: 'Please select an available table, date, and time' });
    const windowStart = new Date(scheduledFor.getTime() - 90 * 60 * 1000);
    const windowEnd = new Date(scheduledFor.getTime() + 90 * 60 * 1000);
    const conflict = await Order.exists({ type: 'dine-in', table: table.id, scheduledFor: { $gte: windowStart, $lte: windowEnd }, status: { $nin: ['cancelled', 'served'] } });
    if (conflict) return res.status(409).json({ message: 'That table was just reserved. Please check availability again.' });
  }
  const orderNumber = `VL-${Date.now().toString().slice(-9)}`;
  const order = await Order.create({ ...req.body, items, customer: req.user?.id, subtotal, discount, tax, deliveryFee, total: subtotal - discount + tax + deliveryFee, orderNumber });
  res.status(201).json(order);
}));
app.get('/api/orders/mine', auth, asyncHandler(async (req, res) => res.json(await Order.find({ customer: req.user.id }).sort({ createdAt: -1 }))));
app.get('/api/orders', auth, permit('admin', 'staff'), asyncHandler(async (req, res) => res.json(await Order.find(req.query.status ? { status: req.query.status } : {}).sort({ createdAt: -1 }).limit(200))));
app.patch('/api/orders/:id/status', auth, permit('admin', 'staff'), asyncHandler(async (req, res) => res.json(await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true }))));

app.post('/api/reservations', asyncHandler(async (req, res) => res.status(201).json(await Reservation.create(req.body))));
app.get('/api/reservations', auth, permit('admin', 'staff'), asyncHandler(async (_req, res) => res.json(await Reservation.find().sort({ date: 1 }))));
app.patch('/api/reservations/:id', auth, permit('admin', 'staff'), asyncHandler(async (req, res) => res.json(await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true }))));

app.post('/api/chat', asyncHandler(async (req, res) => {
  const text = String(req.body.message || '').toLowerCase();
  const menu = await MenuItem.find({ available: true });
  let reply = 'I can help you discover dishes, find vegetarian options, check prices, or guide you through an order. Try “recommend something spicy”.';
  let suggestions = [];
  const terms = text.split(/\W+/).filter(w => w.length > 2);
  if (/hello|hi|hey/.test(text)) reply = 'Welcome to Veloura. I’m your digital concierge. What are you in the mood for tonight?';
  if (/vegetarian|vegan|gluten/.test(text)) {
    const diet = /vegan/.test(text) ? 'Vegan' : /gluten/.test(text) ? 'Gluten-free' : 'Vegetarian';
    suggestions = menu.filter(i => i.dietary.includes(diet)).slice(0, 3);
    reply = suggestions.length ? `I found ${suggestions.length} beautiful ${diet.toLowerCase()} choices for you.` : `Our team can tailor several dishes for ${diet.toLowerCase()} dining—please add a note to your order.`;
  } else if (/recommend|popular|best|spicy|dessert|sweet|seafood|drink/.test(text)) {
    suggestions = menu.filter(i => i.featured || terms.some(t => `${i.name} ${i.category} ${i.description}`.toLowerCase().includes(t))).slice(0, 3);
    reply = suggestions.length ? 'These are exceptional choices from tonight’s menu. Tap one to add it to your order.' : reply;
  } else if (/hour|open|close/.test(text)) reply = 'We welcome guests daily from 12:00 PM to 11:30 PM. The kitchen accepts final orders at 10:45 PM.';
  else if (/reserve|table|booking/.test(text)) reply = 'I’d be delighted to help. Use “Reserve a table” and choose your date, time, party size, and occasion.';
  else if (/delivery|pickup/.test(text)) reply = 'Choose delivery or pickup during checkout. Delivery fees and the final total are calculated before confirmation.';
  else {
    suggestions = menu.filter(i => terms.some(t => `${i.name} ${i.category} ${i.description}`.toLowerCase().includes(t))).slice(0, 3);
    if (suggestions.length) reply = 'Here’s what I discovered on our menu.';
  }
  res.json({ reply, suggestions });
}));

app.get('/api/admin/stats', auth, permit('admin', 'staff'), asyncHandler(async (_req, res) => {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const [ordersToday, activeOrders, reservations, revenue] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: start } }), Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] } }),
    Reservation.countDocuments({ date: { $gte: start } }), Order.aggregate([{ $match: { createdAt: { $gte: start }, status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
  ]);
  res.json({ ordersToday, activeOrders, reservations, revenue: revenue[0]?.total || 0 });
}));

app.use((err, _req, res, _next) => { console.error(err); res.status(err.status || 500).json({ message: err.code === 11000 ? 'That value already exists' : err.message || 'Unexpected server error' }); });

mongoose.connect(config.mongoUri).then(() => app.listen(config.port, () => console.log(`Veloura API on :${config.port}`))).catch(err => { console.error('Database connection failed:', err.message); process.exit(1); });

