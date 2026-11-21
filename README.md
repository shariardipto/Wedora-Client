# Wedora — Client

Web client for **Wedora**, a wedding planning platform where customers discover wedding services and request bookings, vendors publish services and manage requests, and admins moderate the platform.

> Status: design system and public pages are in place. Authentication, services, bookings, dashboards and payments are added in upcoming phases.

## Features So Far

- Wedding-themed design system ("Ivory & Champagne"): Cormorant Garamond + Manrope, wine and champagne-gold palette
- Sticky responsive navbar with active-link state and a mobile slide-in menu
- Footer with brand, navigation, category links, contact details and social links
- Home page: hero banner, service categories, Why Choose Wedora, How Wedora Works and a vendor call-to-action
- Scroll-triggered Motion animations that respect the visitor's reduced-motion setting
- Custom 404, error and loading states

## Technology Stack

| Area       | Choice                                  |
| ---------- | --------------------------------------- |
| Framework  | Next.js 16 (App Router), React 19       |
| Language   | TypeScript                              |
| Styling    | Tailwind CSS 4, shadcn/ui (Radix)       |
| Animation  | Motion                                  |
| Icons      | lucide-react                            |
| Toasts     | Sonner                                  |
| Testing    | Vitest                                  |
| Hosting    | Vercel                                  |

## Run Locally

Requirements: Node.js 24 and npm. The [Wedora server](#links) should be running for data-driven pages.

```bash
npm ci --include=dev
cp .env.example .env.local   # then fill in the values you need
npm run dev                  # http://localhost:3000
```

## Scripts

| Command             | Purpose                                   |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Start the development server              |
| `npm run build`     | Create a production build                 |
| `npm start`         | Serve the production build                |
| `npm run lint`      | ESLint (zero warnings allowed)            |
| `npm run typecheck` | Generate route types and type-check       |
| `npm test`          | Run unit tests                            |

## Environment Variables

See [.env.example](.env.example). Secrets live only in `.env.local` locally and in the Vercel project settings in production — never in Git, and never in `NEXT_PUBLIC_*` variables.

## Credits

- Photography: [Unsplash](https://unsplash.com) contributors, used under the [Unsplash License](https://unsplash.com/license) and self-hosted in `src/assets/images`.
- Fonts: Cormorant Garamond and Manrope via Google Fonts (SIL Open Font License).

## Links

- Live website: _to be added_
- Server repository: _to be added_
