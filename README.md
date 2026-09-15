# Academy of Geniuses — Client

React + Vite + TanStack (Query & Router) + Zod + Tailwind.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Client runs on `http://localhost:3001` (API stays on `:3000`).

## Environment

```
VITE_API_URL=http://localhost:3000
```

Validated with Zod in `src/lib/env.ts`.

## Structure

```
src/
  main.tsx          # entry
  App.tsx           # providers + router
  index.css         # Tailwind + base styles
  router.tsx        # TanStack Router
  pages/            # route pages
  lib/              # api, env, utils
  providers/        # React Query, etc.
```
