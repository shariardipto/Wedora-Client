# Wedora — Client

Web client for **Wedora**, a wedding planning platform where customers discover wedding services and request bookings, vendors publish services and manage requests, and admins moderate the platform.

> Status: project foundation. Features, screenshots, live links and deployment notes are added as they are built.

## Technology Stack

| Area      | Choice                                  |
| --------- | --------------------------------------- |
| Framework | Next.js 16 (App Router), React 19       |
| Language  | TypeScript                              |
| Styling   | Tailwind CSS 4                          |
| Testing   | Vitest                                  |
| Hosting   | Vercel                                  |

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

## Links

- Live website: _to be added_
- Server repository: _to be added_
