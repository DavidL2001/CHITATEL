# CHITATEL – a calm daily reading tracker

Log what you read, keep a daily reading streak and watch your progress over time. Built mobile-first with Next.js (App Router), MongoDB and SCSS modules. Every user only ever sees their own data.

- **Sessions**: start a timer (it lives on the server, so it survives closing the app or switching devices), pause/resume, then finish with the page you reached and a note. Or log a session by hand, for any past day.
- **Streaks and goals**: current and longest streak based on your _local_ date, a daily pages or minutes goal with a progress ring, a yearly book goal, and milestone toasts (7/30/100/365-day streaks; 1st/10th/25th/50th book).
- **Calendar**: a month view on phones, a GitHub-style year heatmap on wider screens. Tap a day to see its sessions and notes.
- **Books**: search Open Library or add manually, progress, pace and estimated finish date, a reading journal, quotes, rating and review.
- **Stats**: pages per week, books per month, totals, each chart with a text summary and data table.
- **Settings**: goals, timezone, dark/light theme, JSON export, sign out, delete account.

## Tech

|            |                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| Framework  | Next.js 16 (App Router, Server Components, Server Actions), React 19, TypeScript                       |
| Data       | MongoDB Atlas + Mongoose (connection cached for serverless)                                            |
| Auth       | Auth.js (NextAuth v5) with Google and GitHub, MongoDB adapter, database sessions. No passwords stored. |
| Validation | Zod on every Server Action                                                                             |
| Charts     | chart.js + react-chartjs-2 (colours and font sizes read from CSS tokens)                               |
| Styling    | SCSS modules plus global partials in `src/styles`                                                      |
| Tooling    | ESLint (Next + jsx-a11y strict, zero warnings), Prettier, Vitest                                       |

## Local development

Requirements: Node.js 20.9 or newer, and a MongoDB database (Atlas, or a local `mongod`).

```bash
cp .env.example .env.local   # then fill in the values (see below)
npm install
npm run dev                  # http://localhost:3000
```

Useful scripts:

```bash
npm run lint      # ESLint, zero warnings allowed
npm run test      # unit tests (Vitest)
npm run build     # production build
npm run typecheck # tsc --noEmit
```

### Environment variables

| Name                                   | What it is                                                                                                       |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `MONGODB_URI`                          | MongoDB connection string, including the database name, e.g. `…mongodb.net/chitatel?retryWrites=true&w=majority` |
| `AUTH_SECRET`                          | Random secret for Auth.js. Generate with `npx auth secret` or `openssl rand -base64 33`                          |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Google OAuth client                                                                                              |
| `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` | GitHub OAuth app                                                                                                 |

Never commit real secrets. `.env.local` is git-ignored.

## Deployment (Vercel + MongoDB Atlas)

### 1. MongoDB Atlas

1. Create a free account at <https://www.mongodb.com/cloud/atlas> and create a free **M0** cluster.
2. **Database Access** → _Add New Database User_ → username + password (password auth), role _Read and write to any database_.
3. **Network Access** → _Add IP Address_ → **Allow access from anywhere (`0.0.0.0/0`)**. This is needed because Vercel's serverless functions use dynamic IP addresses.
4. **Database** → _Connect_ → _Drivers_ → copy the connection string. Replace `<password>` and add a database name before the `?`, e.g. `mongodb+srv://chitatel:PASSWORD@cluster0.abcde.mongodb.net/chitatel?retryWrites=true&w=majority`. This is your `MONGODB_URI`.

The collections and indexes are created automatically on first use.

### 2. OAuth apps

The callback path is `/api/auth/callback/<provider>`. Register both your local and production URLs.

**Google** (<https://console.cloud.google.com/apis/credentials>)

1. Configure the _OAuth consent screen_ (External, add your email as a test user while in testing).
2. _Create credentials_ → _OAuth client ID_ → _Web application_.
3. Authorised JavaScript origins: `http://localhost:3000` and `https://YOUR-APP.vercel.app`.
4. Authorised redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://YOUR-APP.vercel.app/api/auth/callback/google`
5. Copy the client ID and secret into `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.

**GitHub** (<https://github.com/settings/developers> → _OAuth Apps_)

A GitHub OAuth app has a single callback URL, so create **two apps**: one for local development and one for production.

- Local: homepage `http://localhost:3000`, callback `http://localhost:3000/api/auth/callback/github`
- Production: homepage `https://YOUR-APP.vercel.app`, callback `https://YOUR-APP.vercel.app/api/auth/callback/github`

Generate a client secret for each. Use the local pair in `.env.local` and the production pair in Vercel.

### 3. Vercel

1. Push the repository to GitHub.
2. In Vercel: _Add New…_ → _Project_ → import the repository. The framework is detected as Next.js; keep the defaults.
3. Under _Environment Variables_ add `MONGODB_URI`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` (production values).
4. _Deploy_. If you later use a custom domain, add its callback URLs to the OAuth apps too.

## Project structure

```
src/
  app/                 Routes. (app) requires sign-in; (tabs) shows the bottom nav, (focus) hides it
  components/          Small reusable UI: Button, IconButton, TextField, NumberField, Stepper,
                       TextArea, SelectField, ChoiceGroup, Card, Modal, ConfirmDialog, Banner,
                       Tabs, ProgressBar, ProgressRing, BookCover, PageHeader, BottomNav,
                       StickyActionBar, EmptyState, Toast, PageContainer
  features/            Components composed for one area: books, sessions, calendar, stats, today, settings
  hooks/               useFormAction (Server Action + toast + focus on first error)
  lib/                 Pure, unit-tested logic: dates (timezone-aware), streak, pace, stats,
                       heatmap, milestones, Open Library mapping, export, formatting
  server/              db connection, Mongoose models, read-only data access, Server Actions, Zod schemas
  constants/           Routes, limits, default goals, milestone thresholds, labels
  styles/              _colors (the only hex values), _themes, _variables, _mixins, globals
```

### How the rules are enforced

- **Privacy**: every query in `src/server/data.ts` and every Server Action filters on the signed-in user's id. Ids from the client are validated and always combined with `userId`, so a guessed id returns "not found".
- **Local dates**: sessions store the reading day as `YYYY-MM-DD` in the user's timezone (detected from the browser on first sign-in, editable in Settings). A session started at 23:30 in Stockholm counts for that day. All date arithmetic works on those strings, so DST and the server's timezone can't shift a day.
- **Milestones** are computed from data at the moment a session or book changes. Nothing extra is stored.
- **Tokens only**: components use spacing, size and colour tokens. Charts read colours and font sizes from CSS custom properties at runtime and re-read them when the theme changes. The PWA manifest and generated icons can't read CSS, so `src/constants/brand.ts` mirrors two palette colours; a unit test fails if they drift.

## Accessibility

Targets WCAG 2.1 AA:

- semantic landmarks, one `h1` per page, and a skip link;
- visible labels, with errors linked through `aria-describedby` and focused on submit;
- native `<dialog>` modals (focus trapped, Escape closes, focus returns to the trigger);
- focus moves to the `h1` after navigation;
- a polite live region for toasts, while the timer uses `role="timer"` so it isn't announced every second;
- heatmap days have text labels and the legend uses text plus a shape for "goal met";
- the year heatmap is a single-tab-stop ARIA grid with arrow-key navigation;
- colours were checked for 4.5:1 (text) and 3:1 (UI) in both themes, and reduced motion is respected.

## PWA

`app/manifest.ts` and generated icons make the app installable ("Add to Home Screen"). The service worker in `public/sw.js` only caches immutable build assets and icons. Pages, Server Actions and `/api` responses are never cached.
