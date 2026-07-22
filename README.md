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
## Render backend + Vercel frontend

### 1. Deploy the API on Render

Create a Render Blueprint from this repository; `render.yaml` configures the `veloura-api` service. Set these secret values in Render:

- `MONGODB_URI`: the rotated Atlas connection string
- `CLIENT_URL`: the final Vercel production origin, for example `https://veloura.vercel.app` (no trailing slash)
- `JWT_SECRET`: Render generates this automatically; do not change it after users begin signing in

Render uses `npm ci`, starts `npm start -w backend`, and checks `/api/health`. In Atlas Network Access, allow the Render service to connect. For an initial launch you may temporarily use `0.0.0.0/0`, but a narrower provider-compatible policy is preferable.

### 2. Deploy the frontend on Vercel

Import the same repository and set the Vercel **Root Directory** to `frontend`. The included `frontend/vercel.json` builds Vite and preserves React Router routes on direct refresh.

Add this Vercel environment variable for Production, Preview, and Development as needed:

- `VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api`

The value must include `/api` and must not end with a slash. Redeploy the frontend after changing any `VITE_*` variable because Vite embeds it at build time.

### 3. Complete CORS

Copy the final Vercel production URL into Render's `CLIENT_URL`, then restart/redeploy the Render service. Preview deployments use changing domains and are intentionally not accepted unless their exact origins are added to `CLIENT_URL` as a comma-separated list.

### 4. Bootstrap production data once

In a Render Shell, set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`, then run `npm run seed`. The seed is idempotent: it does not erase an existing menu.
## Cloudinary media storage

Admin menu and promotion forms upload images through the authenticated Render API. The Cloudinary API secret is never sent to Vercel or the browser. Assets are stored under `veloura/menu`, `veloura/promotions`, and `veloura/gallery`, capped at 10 MB, and transformed for automatic format/quality with a maximum 1800 × 1800 size. Replaced and deleted record images are removed from Cloudinary after the database update succeeds.

Set all three `CLOUDINARY_*` values only in Render. Never create `VITE_CLOUDINARY_API_SECRET` or expose the secret in frontend variables.