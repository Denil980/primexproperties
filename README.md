# React + TypeScript + Vite

## Supabase setup

1. Open the Supabase project whose reference is in your environment variables. The browser app and API must use the same project URL and keys.
2. In that project's **SQL Editor**, open `supabase/schema.sql`, run the complete script, and check Table Editor for the created tables.
3. Copy `.env.example` to `.env.local`. Fill in the URL and publishable/anon key from **Project Settings → API Keys**. Set `SUPABASE_SERVICE_ROLE_KEY` to that project's secret/service-role key; keep this key server-side only.
4. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12+ characters), and `ADMIN_FULL_NAME` in `.env.local`, then run `npm run bootstrap:admin` once. It creates or updates that Supabase Auth user and gives the matching `profiles` row the `super_admin` role. Remove the admin password from `.env.local` after setup.
5. Add the app URL, publishable/anon key, service-role key, and any required restore variables under **Vercel → Project → Settings → Environment Variables** for the relevant environments. Do not put secrets in `vercel.json`, `VITE_*` variables, or source control.

The API uses `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; the Vite client uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. These URL values must refer to the same Supabase project. `SUPABASE_SERVICE_ROLE_KEY` is server-only and bypasses Row Level Security.

The service-role key previously committed in `vercel.json` must be rotated in Supabase, then replaced in local and Vercel environment settings. Removing it from the current file does not erase it from earlier Git commits, so rotate it before deploying.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
