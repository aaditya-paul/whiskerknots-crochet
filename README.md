# Whiskerknots Crochet

https://whiskerknots-crochet.vercel.app/

A small Next.js e-commerce / brochure site for Whiskerknots — a handmade crochet shop specializing in amigurumi, wearables, and home decor. This repository is a modern rewrite using Next.js App Router, Tailwind CSS, and a server-side AI chat assistant.

**Status:** Development

--

**Tech stack**

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- TypeScript
- lucide-react (icons)

**Features**

- Persistent `Navbar` and `Footer` via the app layout
- Shop, About, Contact pages scaffolded
- Floating AI chat assistant (server-side API proxy to Gemini)
- Custom brand colors and fonts (Quicksand, Comfortaa)

**Project structure (key files)**

- `app/layout.tsx` — root layout including `Navbar`, `Footer`, and `ChatAssistant`
- `app/page.tsx` — home page
- `components/` — UI components (Navbar, Footer, ChatAssistant, ProductCard, etc.)
- `app/globals.css` — Tailwind import and CSS variables for brand colors and fonts
- `app/api/chat/route.ts` — server-side API route that proxies to the Gemini API (keeps API key on server)

**Local setup**

1. Install dependencies

   ```bash
   npm install
   ```

2. Add environment variables

   Create a `.env.local` file at the project root with:

   ```env
   GEMINI_API_KEY=your_server_side_api_key_here
   ```

   Note: The Gemini API key must remain server-side. Do NOT prefix it with `NEXT_PUBLIC_`.

3. Run the dev server

   ```bash
   npm run dev
   ```

4. Build for production

   ```bash
   npm run build
   npm run start
   ```

**Styling & fonts**

- Global CSS is managed in `app/globals.css` and Tailwind is configured for v4. Brand colors are exposed as CSS variables with the `--color-` prefix so Tailwind utilities like `bg-cozy-cream` and `text-earthy-brown` work correctly.
- The app loads Quicksand and Comfortaa via `next/font/google` in `app/layout.tsx`. The fonts are exposed as CSS variables and applied to the `body`.

**Chat assistant**

- `ChatAssistant` is a client component that POSTs messages to `/api/chat`.
- The server route (`app/api/chat/route.ts`) uses the `@google/genai` SDK and the `GEMINI_API_KEY` environment variable to stream responses back to the client.

**Security notes**

- Keep `GEMINI_API_KEY` secret and do not commit `.env.local`.

**Troubleshooting**

- If you see "API key is missing" in the client, ensure you restarted the dev server after creating `.env.local` and that requests go to `/api/chat` (the client no longer reads `process.env.GEMINI_API_KEY`).
- If Tailwind color utilities don't apply, ensure the CSS variables in `app/globals.css` use the `--color-` prefix (this repo already configures them as
  🧶
