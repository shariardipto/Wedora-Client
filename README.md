# Wedora — Client

Web client for **Wedora**, a wedding planning platform where customers discover wedding services and request bookings, vendors publish services and manage requests, and admins moderate the platform.

> Status: public pages, authentication, services, bookings, dashboards and Stripe payments are in place. Deployment follows.

## Features

- Wedding-themed design system ("Ivory & Champagne"): Cormorant Garamond + Manrope, wine and champagne-gold palette
- Sticky responsive navbar that switches instantly to a profile dropdown (name, photo, Dashboard, Profile Settings, Logout) after sign-in
- Footer with brand, navigation, category links, contact details and social links
- Home page: hero banner, service categories, Why Choose Wedora, How Wedora Works and a vendor call-to-action
- **Authentication (Better Auth):** email/password and Google sign-in, Customer or Vendor account types, password rules (6+ characters, upper- and lowercase); profile photos are uploaded to ImgBB from Profile Settings after sign-in, and the dashboard prompts users who haven't added one
- **Security:** admin accounts can't be created by sign-up; role, block status and subscription fields can't be set by users; blocked users can't sign in; open-redirect-safe return URLs
- **Protected routes:** sign-in redirect with return path, role-specific dashboards (users are sent back to their own dashboard if they edit the URL), one-time account type choice for Google users
- Profile Settings: name, photo, phone and business name (vendors)
- **Browse Services:** search by name, filter by category and location, sort by price (low→high, high→low), pagination — all kept in the URL so results survive reloads; skeleton loading and empty states
- **Service details** (sign-in required): photo gallery, price, location, description and vendor info; invalid or hidden services show a friendly "Service not found"
- **Home:** Featured Services from the database and live service counts per category
- **Vendor dashboard:** My Services (approval status, rejection reasons, pause/resume, edit, delete), Add/Edit Service with 1–5 photos uploaded to ImgBB, Free-plan usage meter (3 active services)
- **Admin dashboard:** Manage Services — search, filter by status/category, approve, reject with a reason, move back to review, delete
- **Booking requests:** customers request a date from the service details page (event date, location, message); duplicates for the same date are refused
- **My Bookings (customers):** status tabs with counts, booking details, cancel pending requests
- **Booking Requests (vendors):** customer contact details and message, accept or reject each pending request once
- **Dashboard overviews with statistics:** customers (total, pending, accepted, rejected requests + recent requests), vendors (total and active services, pending requests, accepted bookings, current plan + requests waiting), admins (users, vendors, customers, services, pending services, transactions + review queue)
- **Admin Manage Users:** search by name or email, filter by role and status, view details and activity, block (signs the user out immediately) and unblock; admin accounts are protected
- **Vendor Subscription (Stripe):** Free vs Premium plans ($29/month), Upgrade to Premium redirects to Stripe Checkout, cancel at period end or keep the subscription, payment history; test-mode card hint
- **Payment pages:** `/payment/success` checks the payment status every 2 s for up to 30 s and only displays it. Premium is switched on by the server's verified Stripe webhook, never by the page. `/payment/cancel` confirms that nothing was charged
- **Admin Transactions:** read-only payment ledger with vendor info, search, status filter, pagination and revenue totals
- Role-based dashboard sidebar
- Short-lived JWTs for calling the Wedora API
- **"Golden Hour" premium UI:**
  - WebGL hero (Three.js + React Three Fiber): interlocked gold and rose-gold rings with a solitaire that follow the cursor and turn with scroll, drifting rose petals and twinkling gold dust.
  - GSAP SplitText headline reveals.
  - Lenis smooth scrolling synced with GSAP ScrollTrigger.
  - Scroll-reactive category marquee and parallax photos.
  - 3D tilt cards with glare, magnetic buttons, an aurora vendor band and CSS petals on sign-in and payment success.
  - Floating glass navbar that turns dark over dark sections and light over ivory ones. It has an orbiting gold edge-light, a sliding hover indicator and a gold reading-progress line, and tucks away while you scroll down. Phones get a full-screen menu with large serif links.
  - Everything is skipped for reduced motion, and the 3D scene only loads when WebGL is available.
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
| Animation  | Motion, GSAP (ScrollTrigger, SplitText), Lenis |
| 3D         | Three.js, React Three Fiber             |
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
| `npm run seed:demo` | Add demo vendors, services and bookings (idempotent; `-- --reset` removes them) |

### First-time setup

1. Fill in `.env.local` (MongoDB, Better Auth secret, Google OAuth, ImgBB, admin credentials).
2. In the server repository run `npm run db:setup` once to create indexes.
3. Run `npm run seed:admin` to create the admin account (admins can't sign up publicly).
4. Optional: `npm run seed:demo` adds 6 demo vendors with 11 approved services (one or more per category), 2 services waiting for review and a demo customer with booking requests. Photos are copied to ImgBB. Demo records are marked `isDemo` and can be removed with `npm run seed:demo -- --reset`.

## Environment Variables

See [.env.example](.env.example). Secrets live only in `.env.local` locally and in the Vercel project settings in production — never in Git, and never in `NEXT_PUBLIC_*` variables.

## Credits

- Logo: original Wedora artwork by the project owner (`src/assets/brand`).
- Photography: [Unsplash](https://unsplash.com) contributors, used under the [Unsplash License](https://unsplash.com/license). Site images are self-hosted in `src/assets/images`; demo listing photos are copied to ImgBB by the seed script.
- Fonts: Cormorant Garamond and Manrope via Google Fonts (SIL Open Font License).

## Links

- Live website: _to be added_
- Server repository: _to be added_
