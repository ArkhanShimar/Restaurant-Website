# Veloura — Luxury Restaurant Platform

A full-stack MERN restaurant experience combining a cinematic storefront with ordering, reservations, promotions, a free menu-aware concierge chatbot, POS, kitchen display system, and admin operations.

## Quick start

1. Copy `.env.example` to `backend/.env` and set `MONGODB_URI` and `JWT_SECRET`.
2. Run `npm install`.
3. Run `npm run seed` to create demo menu data and the first admin.
4. Run `npm run dev`.

The storefront runs at `http://localhost:5173`; the API runs at `http://localhost:5000`.

Demo seed accounts:

- Admin: `admin@veloura.lk` / `VelouraAdmin123!`
- Staff: `staff@veloura.lk` / `VelouraStaff123!`

Change these immediately in any deployed environment.

## Features

- Luxury responsive storefront with motion, parallax, menu discovery and cart
- Food variants, add-ons, spice level, dietary labels and customer notes
- Checkout, favorites, reservations, promotions and contact/map/social sections
- No-cost deterministic concierge chatbot backed by live menu data
- JWT authentication with admin/staff/customer roles
- Admin overview, catalog and promotion controls
- POS order entry and real-time-style Kitchen Display System polling
- Order state workflow: pending → confirmed → preparing → ready → served/delivered

## Security

Never commit a MongoDB connection string. Restrict Atlas network access, use a least-privilege database user, rotate exposed passwords, and provide secrets through the deployment platform.
