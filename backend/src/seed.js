import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from './config.js';
import { User, MenuItem, Promotion } from './models.js';

const dishes = [
  { name: 'Wagyu Ember', slug: 'wagyu-ember', category: 'Mains', price: 12800, featured: true, description: 'A5 wagyu, smoked aubergine, black garlic jus and garden herbs.', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=85', dietary: ['Gluten-free'], prepTime: 28, variants: [{ name: 'Medium rare', priceDelta: 0 }, { name: 'Medium', priceDelta: 0 }], addOns: [{ name: 'Truffle mash', price: 1200 }, { name: 'Charred greens', price: 850 }] },
  { name: 'Ocean Pearl', slug: 'ocean-pearl', category: 'Mains', price: 7600, featured: true, description: 'Butter-poached lobster, coconut bisque, citrus oil and pearl couscous.', image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=85', dietary: [], prepTime: 24, variants: [], addOns: [{ name: 'Extra lobster', price: 3200 }] },
  { name: 'Truffle Forest', slug: 'truffle-forest', category: 'Mains', price: 4900, featured: true, description: 'Wild mushroom risotto, aged parmesan, winter truffle and crisp sage.', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=1200&q=85', dietary: ['Vegetarian', 'Gluten-free'], prepTime: 20, variants: [{ name: 'Classic', priceDelta: 0 }, { name: 'Vegan', priceDelta: 0 }], addOns: [{ name: 'Fresh truffle', price: 1600 }] },
  { name: 'Tuna Crudo', slug: 'tuna-crudo', category: 'Starters', price: 3800, description: 'Yellowfin tuna, ponzu, avocado, chilli and sesame lace.', image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=1200&q=85', dietary: ['Gluten-free'], prepTime: 12, variants: [], addOns: [] },
  { name: 'Burrata Garden', slug: 'burrata-garden', category: 'Starters', price: 3200, description: 'Puglian burrata, heirloom tomato, basil oil and olive soil.', image: 'https://images.unsplash.com/photo-1625943555419-56a2cb596640?auto=format&fit=crop&w=1200&q=85', dietary: ['Vegetarian', 'Gluten-free'], prepTime: 10, variants: [], addOns: [] },
  { name: 'Midnight Cacao', slug: 'midnight-cacao', category: 'Desserts', price: 2800, featured: true, description: 'Dark chocolate sphere, salted caramel and smoked vanilla.', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=85', dietary: ['Vegetarian'], prepTime: 15, variants: [], addOns: [{ name: 'Gold leaf', price: 650 }] },
  { name: 'Jasmine Cloud', slug: 'jasmine-cloud', category: 'Desserts', price: 2400, description: 'Jasmine mousse, lychee, rose and almond snow.', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1200&q=85', dietary: ['Vegetarian'], prepTime: 12, variants: [], addOns: [] },
  { name: 'Saffron No. 7', slug: 'saffron-no-7', category: 'Drinks', price: 1900, description: 'Saffron, passionfruit, lime and clarified coconut.', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=85', dietary: ['Vegan', 'Gluten-free'], prepTime: 6, variants: [{ name: 'Zero proof', priceDelta: 0 }, { name: 'With gin', priceDelta: 900 }], addOns: [] },
];

await mongoose.connect(config.mongoUri);
await MenuItem.deleteMany({}); await MenuItem.insertMany(dishes);
for (const account of [
  { name: 'Veloura Admin', email: 'admin@veloura.lk', password: 'VelouraAdmin123!', role: 'admin' },
  { name: 'Kitchen Staff', email: 'staff@veloura.lk', password: 'VelouraStaff123!', role: 'staff' },
]) await User.findOneAndUpdate({ email: account.email }, { ...account, password: await bcrypt.hash(account.password, 12) }, { upsert: true });
await Promotion.findOneAndUpdate({ code: 'VELVET15' }, { code: 'VELVET15', title: 'The Velvet Welcome', description: '15% from your first online experience.', type: 'percentage', value: 15, minOrder: 5000, active: true }, { upsert: true });
console.log('Seed complete'); await mongoose.disconnect();
