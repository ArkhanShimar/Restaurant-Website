import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'staff', 'admin'], default: 'customer' },
  phone: String,
  favorites: [{ type: Schema.Types.ObjectId, ref: 'MenuItem' }],
}, { timestamps: true });

const menuItemSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  image: String,
  dietary: [String],
  featured: { type: Boolean, default: false },
  available: { type: Boolean, default: true },
  prepTime: { type: Number, default: 20 },
  variants: [{ name: String, priceDelta: Number }],
  addOns: [{ name: String, price: Number }],
}, { timestamps: true });

const orderLineSchema = new Schema({
  menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem' },
  name: String, price: Number, quantity: Number,
  variant: String, addOns: [{ name: String, price: Number }],
  spiceLevel: String, notes: String,
}, { _id: false });

const orderSchema = new Schema({
  orderNumber: { type: String, unique: true },
  customer: { type: Schema.Types.ObjectId, ref: 'User' },
  customerName: String, phone: String, email: String,
  type: { type: String, enum: ['delivery', 'pickup', 'dine-in'], default: 'pickup' },
  table: String, address: String,
  items: [orderLineSchema],
  subtotal: Number, discount: { type: Number, default: 0 }, tax: Number, deliveryFee: Number, total: Number,
  promoCode: String,
  paymentMethod: { type: String, enum: ['cash', 'card', 'online'], default: 'cash' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  status: { type: String, enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'delivered', 'cancelled'], default: 'pending' },
  source: { type: String, enum: ['web', 'pos', 'chatbot'], default: 'web' },
  notes: String,
}, { timestamps: true });

const promotionSchema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  title: { type: String, required: true }, description: String,
  type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  value: { type: Number, required: true }, minOrder: { type: Number, default: 0 },
  active: { type: Boolean, default: true }, startsAt: Date, endsAt: Date, usageLimit: Number, usageCount: { type: Number, default: 0 },
}, { timestamps: true });

const reservationSchema = new Schema({
  name: { type: String, required: true }, email: String, phone: { type: String, required: true },
  date: { type: Date, required: true }, guests: { type: Number, min: 1, max: 30 },
  occasion: String, requests: String,
  status: { type: String, enum: ['pending', 'confirmed', 'seated', 'completed', 'cancelled'], default: 'pending' },
}, { timestamps: true });

export const User = mongoose.models.User || model('User', userSchema);
export const MenuItem = mongoose.models.MenuItem || model('MenuItem', menuItemSchema);
export const Order = mongoose.models.Order || model('Order', orderSchema);
export const Promotion = mongoose.models.Promotion || model('Promotion', promotionSchema);
export const Reservation = mongoose.models.Reservation || model('Reservation', reservationSchema);

