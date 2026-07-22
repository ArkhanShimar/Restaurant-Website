import 'dotenv/config';

const production = process.env.NODE_ENV === 'production';
const splitList = value => String(value || '').split(',').map(item => item.trim()).filter(Boolean);

if (production && !process.env.MONGODB_URI) throw new Error('MONGODB_URI is required in production');
if (production && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) throw new Error('JWT_SECRET must be at least 32 characters in production');

export const config = {
  env: process.env.NODE_ENV || 'development',
  production,
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/veloura',
  jwtSecret: process.env.JWT_SECRET || 'development-only-secret-change-me',
  clientUrls: splitList(process.env.CLIENT_URL || 'http://localhost:5173'),
  serviceChargeRate: Math.max(0, Number(process.env.SERVICE_CHARGE_RATE ?? 0.1)),
  deliveryFee: Math.max(0, Number(process.env.DELIVERY_FEE ?? 450)),
};