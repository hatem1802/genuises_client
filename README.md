# Academy of Geniuses — Client

## Setup

```bash
npm install
npm run dev
```

Client runs on `http://localhost:3001` (API stays on `:3000`).

## Environment

Copy `.env.example` to `.env` if needed:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

The API base URL is read from `NEXT_PUBLIC_API_URL` (see `src/lib/env.ts`).
