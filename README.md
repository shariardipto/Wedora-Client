# Wedora — Client

Web client for **Wedora**, a wedding planning platform where customers discover wedding services and request bookings, vendors publish services and manage requests, and admins moderate the platform.

> Status: design system, public pages and authentication are in place. Services, bookings, full dashboards and payments are added in upcoming phases.

## Features So Far

- Wedding-themed design system ("Ivory & Champagne"): Cormorant Garamond + Manrope, wine and champagne-gold palette
- Sticky responsive navbar that switches instantly to a profile dropdown (name, photo, Dashboard, Profile Settings, Logout) after sign-in
- Footer with brand, navigation, category links, contact details and social links
- Home page: hero banner, service categories, Why Choose Wedora, How Wedora Works and a vendor call-to-action
- **Authentication (Better Auth):** email/password and Google sign-in, Customer or Vendor account types, optional profile photo uploaded to ImgBB, password rules (6+ characters, upper- and lowercase)
- **Security:** admin accounts can't be created by sign-up; role, block status and subscription fields can't be set by users; blocked users can't sign in; open-redirect-safe return URLs
- **Protected routes:** sign-in redirect with return path, role-specific dashboards (users are sent back to their own dashboard if they edit the URL), one-time account type choice for Google users
- Profile Settings: name, photo, phone and business name (vendors)
- **Browse Services:** search by name, filter by category and location, sort by price (low→high, high→low), pagination — all kept in the URL so results survive reloads; skeleton loading and empty states
- **Service details** (sign-in required): photo gallery, price, location, description and vendor info; invalid or hidden services show a friendly "Service not found"
- **Home:** Featured Services from the database and live service counts per category
- **Vendor dashboard:** My Services (approval status, rejection reasons, pause/resume, edit, delete), Add/Edit Service with 1–5 photos uploaded to ImgBB, Free-plan usage meter (3 active services)
- **Admin dashboard:** Manage Services — search, filter by status/category, approve, reject with a reason, move back to review, delete
- Role-based dashboard sidebar
- Short-lived JWTs for calling the Wedora API
- Scroll-triggered Motion animations that respect the visitor's reduced-motion setting
- Custom 404, error and loading states

## Technology Stack

| Area       | Choice                                  |
| ---------- | --------------------------------------- |
| Framework  | Next.js 16 (App Router), React 19       |
| Language   | TypeScript                              |
| Auth       | Better Auth (MongoDB adapter, Google, JWT) |
| Forms      | react-hook-form, Zod                    |
| Images     | ImgBB (server-side upload)              |
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
| `npm run seed:admin`| Create or repair the admin account from `ADMIN_*` env values |

### First-time setup

1. Fill in `.env.local` (MongoDB, Better Auth secret, Google OAuth, ImgBB, admin credentials).
2. In the server repository run `npm run db:setup` once to create indexes.
3. Run `npm run seed:admin` to create the admin account (admins can't sign up publicly).

## Environment Variables

See [.env.example](.env.example). Secrets live only in `.env.local` locally and in the Vercel project settings in production — never in Git, and never in `NEXT_PUBLIC_*` variables.

## Credits

- Logo: original Wedora artwork by the project owner (`src/assets/brand`).
- Photography: [Unsplash](https://unsplash.com) contributors, used under the [Unsplash License](https://unsplash.com/license) and self-hosted in `src/assets/images`.
- Fonts: Cormorant Garamond and Manrope via Google Fonts (SIL Open Font License).

## Links

- Live website: _to be added_
- Server repository: _to be added_
