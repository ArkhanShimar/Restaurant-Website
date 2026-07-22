# Veloura — Luxury Restaurant Platform

A full-stack MERN restaurant platform with a cinematic storefront, ordering, reservations, promotions, a menu-aware rules-based concierge, POS, kitchen display, billing records, and role-based operations.

## Local development

1. Copy `backend/.env.example` to `backend/.env` and add a development MongoDB URI and JWT secret.
2. Run `npm install`.
3. Run `npm run seed` once to create sample menu data and development accounts.
4. Run `npm run dev`.

Frontend: `http://localhost:5173`
API: `http://localhost:5000`

Development seed accounts:

- Admin: `admin@veloura.lk` / `VelouraAdmin123!`
- Staff: `staff@veloura.lk` / `VelouraStaff123!`

These defaults are disabled for production seeding.

## Production deployment (single service)

The recommended configuration builds React and lets Express serve `frontend/dist`, keeping the website and `/api` on one origin.

- Build command: `npm install && npm run build`
- Start command: `npm start`
- Health check: `/api/health`
- Required environment variables:
  - `NODE_ENV=production`
  - `MONGODB_URI=<rotated production Atlas URI>`
  - `JWT_SECRET=<random value of at least 32 characters>`
  - `CLIENT_URL=https://your-domain.com`
- Optional business variables:
  - `SERVICE_CHARGE_RATE=0.10`
  - `DELIVERY_FEE=450`

Run `npm run seed` only once after setting `SEED_ADMIN_EMAIL` and a unique 12+ character `SEED_ADMIN_PASSWORD`. Seeding is idempotent and no longer deletes an existing menu.

For separate frontend and API hosts, set `VITE_API_URL=https://api.your-domain.com/api` during the frontend build and list allowed frontend origins in the backend `CLIENT_URL` variable, separated by commas.

## What is database-managed

Menu dishes, prices, variants, add-ons, availability, promotions, orders, billing statuses, reservations, enquiries, users, and operational records are stored in MongoDB and managed through the operations dashboard.

## Intentional code/config content

Brand copy, editorial imagery, restaurant address/contact details, service hours, and the initial table layout remain site configuration. The service charge and delivery fee are environment-configurable. Change the contact/brand content before launch if this is not the final Veloura business information.

## External integrations not included

- Billing records are operational payment tracking; card charging requires a real payment provider.
- The concierge is a free deterministic menu assistant, not a hosted AI model.
- Email/SMS/WhatsApp notifications require provider credentials and implementation.
- Unsplash images and Google Fonts are externally hosted; replace them with owned production assets if required.

## Security checklist

- Rotate any database password ever shared in chat or committed elsewhere.
- Create a least-privilege production MongoDB user and restrict Atlas network access.
- Never commit `.env` files; use the hosting platform’s secret manager.
- Use unique production seed credentials, then avoid rerunning seed unless intentionally updating bootstrap data.
- Enable provider-level HTTPS, backups, monitoring, and request/rate protection before accepting public traffic.