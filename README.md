# Primex Properties — Fullstack Luxury Real Estate Platform

## Supabase Setup & Configuration

1. Open the Supabase project whose reference is in your environment variables. The browser app and API must use the same project URL and keys.
2. In that project's **SQL Editor**, open `supabase/schema.sql`, run the complete script, and check Table Editor for the created tables.
3. Copy `.env.example` to `.env.local`. Fill in the URL and publishable/anon key from **Project Settings → API Keys**. Set `SUPABASE_SERVICE_ROLE_KEY` to that project's secret/service-role key; keep this key server-side only.
4. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12+ characters), and `ADMIN_FULL_NAME` in `.env.local`, then run `npm run bootstrap:admin` once. It creates or updates that Supabase Auth user and gives the matching `profiles` row the `super_admin` role. Remove the admin password from `.env.local` after setup.
5. Add the app URL, publishable/anon key, service-role key, and any required restore variables under **Vercel → Project → Settings → Environment Variables** for the relevant environments. Do not put secrets in `vercel.json`, `VITE_*` variables, or source control.

The API uses `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; the Vite client uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. These URL values must refer to the same Supabase project. `SUPABASE_SERVICE_ROLE_KEY` is server-only and bypasses Row Level Security.

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```
