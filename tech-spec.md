# Tech Spec — Content Board

> Technical architecture, stack decisions, and justifications for the Content Board app.
> Companion to `content-board-spec.md` (features/UX) and `content/video-list.md` (video production plans).

---

## Architecture Overview

Content Board is a **fully serverless, client-side single-page application**. There is no backend server. The React app runs in the browser and communicates directly with managed cloud services for auth, database, and hosting.

```
User's Browser (Desktop / Mobile PWA)
    │
    ├── React SPA (static files from Firebase Hosting CDN)
    │       │
    │       ├── Firebase Auth SDK ──→ Google Auth servers
    │       │
    │       └── Firestore SDK ──→ Cloud Firestore (managed NoSQL)
    │               │
    │               └── Security Rules (server-side enforcement)
    │
    ├── Service Worker (vite-plugin-pwa / Workbox)
    │       └── Cache: app shell + Firestore offline persistence
    │
    └── Custom Domain: content.jitangupta.com
            └── Cloudflare DNS (proxy) → Firebase Hosting CDN
```

### Why Serverless?

No servers to provision, manage, patch, or scale. Firebase Hosting serves static files from a CDN. Firestore is a managed database — Google handles replication, backups, and scaling. Auth is managed. You pay per-use (reads, writes, bandwidth), not per-hour. For a single-user app, the free tier covers everything.

If server-side logic is ever needed (sending emails, scheduled jobs, external API calls), Firebase Cloud Functions can be added without changing the architecture. But v1 doesn't need it.

---

## Services & Infrastructure

| Service | Purpose | Provider |
|---------|---------|----------|
| Source Control | Code versioning, collaboration, PR workflow | GitHub |
| CI/CD | Automated lint, test, build, deploy, code review | GitHub Actions |
| Hosting | Static file CDN for the React SPA | Firebase Hosting |
| Database | NoSQL document store with real-time sync | Cloud Firestore |
| Authentication | Google sign-in, token management | Firebase Auth |
| DNS + Security | DDoS protection, WAF, SSL, analytics | Cloudflare (free tier) |
| Error Tracking | Unhandled exceptions, stack traces, error context | Sentry (free tier) |
| Uptime Monitoring | Site availability checks every 5 min | UptimeRobot (free tier) |
| PWA | Installable app, offline support, caching | vite-plugin-pwa (Workbox) |

### Why GitHub + GitHub Actions (not GitLab, Bitbucket, Jenkins)?

GitHub is the standard for open-source and portfolio projects. The audience for the YouTube videos expects GitHub. GitHub Actions is integrated — no external CI server (Jenkins), no separate account (CircleCI, Travis CI). The workflows you build become content for Video 7 (Claude in CI/CD).

Alternatives considered: GitLab CI is comparable but less common in the React ecosystem. Jenkins is self-hosted and overkill. CircleCI/Travis are external services adding another account to manage.

### Why Firebase (not Supabase, AWS, self-hosted)?

Firebase gives you Auth + Database + Hosting as one integrated ecosystem. One CLI (`firebase`), one console, one billing account, one deploy command. The SDK is designed for direct client-side access — no API layer needed. The alternatives:

- **Supabase** — excellent PostgreSQL-based alternative with real-time, auth, and Row Level Security. You'd choose this if you needed SQL queries, complex joins, or multi-tenant permissions. Content Board doesn't need any of these. Supabase also doesn't have a hosting product — you'd need Vercel or Netlify alongside it, managing two platforms.
- **AWS (Amplify + DynamoDB + Cognito)** — more powerful, more complex, worse DX. Amplify tries to do what Firebase does but with more configuration. Cognito is notoriously hard to configure compared to Firebase Auth.
- **Self-hosted (VPS + PostgreSQL + Express)** — maximum control, maximum ops burden. You'd manage a server, database backups, SSL certs, security patches, and scaling. For a single-user content app, this is paying with time for no benefit.

### Why Cloudflare in Front of Firebase Hosting?

Firebase Hosting already provides CDN and free SSL. Cloudflare adds: DDoS protection (free tier includes it), a Web Application Firewall (basic rules on free tier), bot detection, and traffic analytics without tracking code. The setup cost is just changing your DNS nameservers to Cloudflare — 10 minutes of work for a meaningful security layer.

Alternative: skip Cloudflare, use Firebase Hosting directly. Fine for most cases, but you lose the free DDoS protection and WAF. Since this project is also teaching security (video content), having Cloudflare in the stack is valuable.

---

## Frontend Tech Stack

| Choice | Selected | Version |
|--------|----------|---------|
| Framework | React | 18+ |
| Build Tool | Vite | 5+ |
| Language | TypeScript (strict mode) | 5+ |
| Routing | React Router | v6 |
| Styling | Tailwind CSS | 3+ |
| Component Library | shadcn/ui (Radix UI primitives) | latest |
| State Management | React Context + useReducer | built-in |
| PWA | vite-plugin-pwa | latest |
| Drag & Drop | @dnd-kit | latest |
| Testing | Vitest + React Testing Library | latest |
| Linting | ESLint + Prettier | latest |

### Why React + Vite (not Next.js, Vue, Svelte)?

**React** — known to the developer, known to the audience, largest ecosystem of libraries and patterns. Component-based architecture maps well to the 4-tab detail panel, sidebar, and modular feature structure.

**Vite over Create React App** — CRA is deprecated (last release 2022, no longer maintained). Vite provides fast dev server (ESM-based, no bundling during dev), fast production builds (Rollup), native TypeScript support, and a plugin ecosystem (vite-plugin-pwa).

**Vite over Next.js** — Content Board is a single-user app behind auth. There are no public pages to index, no SEO requirements, no need for server-side rendering. Next.js would add: server components complexity, API routes you don't need, Node.js runtime requirement for hosting (incompatible with static Firebase Hosting), and deployment complexity. Next.js is the right choice when you need SSR, ISR, or API routes — none apply here.

**React over Vue/Svelte** — developer familiarity and audience relevance. Vue and Svelte are fully capable, but switching frameworks adds learning overhead while building and recording videos simultaneously. The YouTube audience skews React.

### Why TypeScript Strict Mode?

TypeScript catches bugs at compile time. Strict mode (`"strict": true` in tsconfig) enables all strict type-checking options: `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, etc. For production engineering (the video series theme), this is non-negotiable.

This also feeds Video 4 (Guardrails) — the CLAUDE.md will enforce strict types, and Claude's output quality improves significantly when constrained by TypeScript.

### Why React Router v6?

Enables deep-linking to content items (e.g., `content.jitangupta.com/video/claude-guardrails`). Even in a single-page layout, URL routing lets you bookmark specific content items, share links, and use browser back/forward navigation. v6 is the current stable version with data loaders and nested routes.

### Why Tailwind CSS (not CSS Modules, Styled Components, MUI)?

- **AI compatibility** — Claude writes Tailwind well. During AI-assisted development (Video 5), styling output is immediately usable without context-switching to separate CSS files
- **No CSS file management** — in a 4-tab detail panel with drag-and-drop sidebar and collapsible groups, separate CSS files per component becomes many files to manage
- **Responsive design** — mobile PWA view is trivial with responsive utilities (`md:flex-row`, `sm:hidden`)
- **shadcn/ui pairing** — complex components (dropdowns, dialogs, tabs, tooltips) from shadcn/ui are built on Tailwind, so the styling system is unified

CSS Modules are a solid alternative with zero runtime cost and predictable scoping — you'd choose them if bundle size were critical or if the team preferred co-located CSS. Styled Components add runtime overhead and are falling out of favor. MUI is opinionated about Material Design and has a large bundle.

### Why React Context + useReducer (not Redux, Zustand)?

Firestore is the source of truth, not React state. The `onSnapshot` real-time listeners push data into React state whenever Firestore changes. This means "state management" is mostly "where do I put the data Firestore sends me" — Context handles this adequately.

For a single-user app with one screen (sidebar + detail panel), the complex state coordination problems that Redux or Zustand solve don't exist. If Context re-renders become a performance issue, Zustand is a 5-minute migration — it's the escape hatch, not the starting point.

Redux Toolkit is the choice for large apps with complex async flows, middleware needs, and devtools requirements. Zustand is the choice when you want global state without Provider boilerplate. Neither is needed here.

### Why @dnd-kit (not react-beautiful-dnd, react-dnd)?

`react-beautiful-dnd` was the default for years but Atlassian has stopped maintaining it (archived repo). `react-dnd` is powerful but low-level — you write a lot of boilerplate. `@dnd-kit` is modern, accessible (keyboard + screen reader support), performant (no DOM measurements during drag), and actively maintained.

### Why Vitest + React Testing Library (not Jest, Cypress)?

**Vitest** — uses the same Vite config and transform pipeline. No separate Jest config for TypeScript, Tailwind, path aliases. Significantly faster than Jest for Vite projects.

**React Testing Library** — tests components the way users interact with them (find by text, click, assert). Encourages accessible markup. The standard for React component testing.

**Firestore Emulator** — for integration tests, the Firebase Emulator Suite runs Firestore locally so you can test security rules and data operations without hitting production.

**Cypress/Playwright** — end-to-end testing in a real browser. Valuable for critical flows (login → create → status change) but heavier to set up and run. Added later if needed, not in v1 test suite.

---

## PWA Configuration

### Why PWA?

Content Board needs mobile access for capturing video ideas on the go. Options: native iOS/Android app (expensive to build, two codebases), React Native (separate project, different tooling), or PWA (same codebase, installable on phones, works offline).

PWA gives you: home screen icon, full-screen launch (no browser chrome), offline access, and push notifications (future). All from the same React codebase. `vite-plugin-pwa` handles service worker generation and the web manifest.

### Cache Strategy

- **App shell** (HTML, CSS, JS): precached by service worker on install. The app loads instantly on repeat visits even without internet.
- **Firestore data**: handled by Firestore's own offline persistence (`enablePersistence()`). Data is cached in IndexedDB automatically. When online, Firestore syncs. When offline, reads serve from cache, writes queue and sync when reconnected.
- **Images/assets**: cache-first with network fallback for static assets.

### Install Experience

Custom "Add to Home Screen" prompt using the `beforeinstallprompt` event. On mobile, the app installs like a native app with a home screen icon and splash screen.

---

## Custom Domain Setup

**Domain:** `content.jitangupta.com`

### DNS Configuration (via Cloudflare)

```
Type    Name      Content                 Proxy
CNAME   content   <firebase-hosting-url>  Proxied (orange cloud)
```

### SSL

- Cloudflare provides edge SSL (browser ↔ Cloudflare)
- Firebase Hosting provides origin SSL (Cloudflare ↔ Firebase)
- Full (strict) SSL mode in Cloudflare settings

### Deployment Flow

```
git push to main
    → GitHub Actions triggers
    → Build (vite build)
    → Deploy (firebase deploy --only hosting)
    → Live at content.jitangupta.com (via Cloudflare CDN → Firebase CDN)
```

---

## Security Architecture

### Threat Model

| Attack Vector | Risk | Mitigation |
|--------------|------|------------|
| Firestore direct access | Someone uses public Firebase config to read/write data | Firestore Security Rules — only authenticated owner email can read/write |
| XSS (Cross-Site Scripting) | Injected script steals auth token, modifies data | React auto-escapes HTML, Content Security Policy headers, no `dangerouslySetInnerHTML` |
| Auth token theft | Stolen Firebase token allows impersonation | Tokens are short-lived (1 hour), CSP prevents XSS (primary theft vector) |
| DDoS / billing abuse | Spam requests to Firestore using public config | Firestore rejects unauth requests fast, Firebase App Check validates app origin, Cloudflare DDoS protection |
| Dependency supply chain | Malicious npm package exfiltrates data | `npm audit` in CI, Claude reviewing dependency changes in PRs, lock file in version control |

### Security Controls

**Must-have (v1):**
- Firestore Security Rules — strict email-based auth check
- Content Security Policy headers — configured in `firebase.json`
- `npm audit` — GitHub Actions step on every PR
- Lock file (`package-lock.json`) — committed to git

**Should-have (v1 or shortly after):**
- Firebase App Check — validates requests come from your legitimate app, not scripts
- Cloudflare WAF — free tier DDoS + bot protection

**Not needed (and why):**
- CAPTCHA — single-user app, no public forms
- Rate limiting middleware — no server, Firestore handles this
- CSRF tokens — no server-side sessions to protect
- SQL injection protection — Firestore is NoSQL with parameterized operations by design

### Firebase Config: Not a Secret

The Firebase client config (API key, project ID, auth domain) is **not secret**. It ships in the client JavaScript bundle and is visible in browser dev tools. This is by design — Google intended it to be public. Security comes from Firestore Security Rules and Firebase Auth, not from hiding the config.

Common misconception: beginners try to hide the API key with environment variables. This doesn't work — the value still ends up in the built bundle. The API key is a project identifier, not an auth credential.

---

## Secrets Management

### What's Secret vs What's Not

| Item | Secret? | Where It Goes | Why |
|------|---------|---------------|-----|
| Firebase API key | No | `src/services/firebase.ts` (in code) | Public project identifier, security comes from rules |
| Firebase project ID | No | `src/services/firebase.ts` + `.firebaserc` | Public identifier |
| Firebase auth domain | No | `src/services/firebase.ts` | Public identifier |
| Firebase service account JSON | **Yes** | GitHub Secrets (`FIREBASE_SERVICE_ACCOUNT`) | Admin access to Firebase project — used by CI/CD for deployment |
| Future external API keys | **Yes** | GitHub Secrets or runtime env vars | Would grant access to paid services |

### Environment Files

```
.env.example          # Template showing required vars (committed to git)
.env.local            # Local dev overrides (in .gitignore, never committed)
.env.production       # Production values (only if different from defaults)
```

For v1, there may not even be a `.env.local` — the Firebase config is the same for dev and prod (single Firebase project). Environment files become relevant when you add staging environments or external services.

### GitHub Secrets (for CI/CD)

```
FIREBASE_SERVICE_ACCOUNT    # JSON key for firebase deploy
```

This is the only secret needed. GitHub Actions uses it to authenticate with Firebase for deployment. It never appears in logs (GitHub masks secrets automatically).

---

## Project Structure

```
content-board/
├── .claude/                        # Claude Code configuration
│   ├── CLAUDE.md                   # Guardrails + coding standards
│   ├── commands/                   # Custom slash commands (Video 8)
│   │   └── deploy-check.md
│   └── settings.json               # Claude Code settings
├── .github/
│   └── workflows/
│       ├── ci.yml                  # PR: lint, type-check, test
│       ├── deploy.yml              # Merge to main: build + firebase deploy
│       └── claude-review.yml       # PR: Claude automated code review (Video 7)
├── public/
│   ├── favicon.ico
│   ├── icons/                      # PWA icons (192x192, 512x512)
│   └── manifest.json               # Web app manifest (or generated by vite-plugin-pwa)
├── src/
│   ├── components/                 # Reusable UI components
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── PhaseGroup.tsx      # Collapsible phase section
│   │   │   ├── ContentItem.tsx     # Single item in sidebar
│   │   │   └── SidebarFilter.tsx
│   │   ├── DetailPanel/
│   │   │   ├── DetailPanel.tsx
│   │   │   ├── TabNavigation.tsx
│   │   │   └── tabs/
│   │   │       ├── ContentTab.tsx
│   │   │       ├── ProductionTab.tsx
│   │   │       ├── LearnTab.tsx
│   │   │       └── FeedbackTab.tsx
│   │   ├── Navbar/
│   │   │   └── Navbar.tsx
│   │   └── common/                 # Shared primitives
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── ChipInput.tsx
│   │       ├── StatusBadge.tsx
│   │       └── ConfirmDialog.tsx
│   ├── features/                   # Feature-specific logic
│   │   ├── auth/
│   │   │   ├── AuthProvider.tsx    # Auth context + provider
│   │   │   ├── LoginPage.tsx
│   │   │   └── useAuth.ts
│   │   ├── content/
│   │   │   ├── ContentProvider.tsx # Content state context
│   │   │   ├── useContent.ts
│   │   │   └── useContentFilters.ts
│   │   ├── production/
│   │   │   ├── DemoItemList.tsx
│   │   │   ├── TalkingPointList.tsx
│   │   │   └── useProduction.ts
│   │   ├── learn/
│   │   │   ├── LearningList.tsx
│   │   │   └── useLearnings.ts
│   │   └── feedback/
│   │       ├── FeedbackList.tsx
│   │       └── useFeedback.ts
│   ├── services/                   # Firebase service layer (NO direct Firestore calls from components)
│   │   ├── firebase.ts             # Firebase init + config
│   │   ├── firestore.ts            # Firestore CRUD operations
│   │   └── auth.ts                 # Auth operations
│   ├── hooks/                      # Shared custom hooks
│   │   ├── useFirestoreListener.ts # Generic real-time listener hook
│   │   └── useDragAndDrop.ts
│   ├── types/                      # TypeScript interfaces
│   │   ├── content.ts              # Content, DemoItem, TalkingPoint, Phase, Status
│   │   └── common.ts              # Shared types
│   ├── utils/                      # Pure helper functions
│   │   ├── statusHelpers.ts        # Phase/status mapping, transitions
│   │   └── dateHelpers.ts
│   ├── App.tsx                     # Root component with routing
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Tailwind imports
├── firebase.json                   # Hosting config + CSP headers
├── firestore.rules                 # Firestore security rules
├── .firebaserc                     # Firebase project alias
├── package.json
├── tsconfig.json                   # TypeScript strict config
├── vite.config.ts                  # Vite + PWA plugin config
├── tailwind.config.ts
├── vitest.config.ts
├── eslint.config.js
├── .prettierrc
├── .gitignore
└── .env.example                    # Template for env vars
```

### Key Architectural Rules

1. **Service layer is mandatory** — React components never import from `firebase/firestore` directly. All Firestore operations go through `src/services/firestore.ts`. This makes the code testable (mock the service layer), swappable (replace Firestore with Supabase without touching components), and auditable (one place to see all database operations).

2. **Feature-based organization** — each tab/feature is self-contained in `src/features/`. A feature owns its components, hooks, and logic. Cross-feature code goes in `src/components/common/` or `src/hooks/`.

3. **Types directory is the contract** — all TypeScript interfaces live in `src/types/`. When you change the data model, you change it here first, and TypeScript errors guide you to every file that needs updating.

4. **No business logic in components** — components handle rendering and user interaction. Business logic (status transitions, validation, data transformation) lives in hooks and utils.

---

## CI/CD Pipeline

### On Pull Request (`ci.yml`)

```
Trigger: PR opened or updated against main

Steps:
1. Checkout code
2. Install dependencies (npm ci)
3. Lint (eslint)
4. Type check (tsc --noEmit)
5. Test (vitest run)
6. Build (vite build) — verify it compiles
7. npm audit — check for vulnerable dependencies
```

### On Merge to Main (`deploy.yml`)

```
Trigger: Push to main branch

Steps:
1. Checkout code
2. Install dependencies
3. Build (vite build)
4. Deploy to Firebase Hosting (firebase deploy --only hosting)
5. Deploy Firestore rules (firebase deploy --only firestore:rules)
```

### Claude Code Review (`claude-review.yml`) — Video 7

```
Trigger: PR opened or @claude mentioned in PR comment

Steps:
1. Claude reviews changed files
2. Posts review comments on the PR
3. Checks for: type safety, error handling, security rule coverage, test coverage
```

---

## Performance Budget

For a single-user app, performance isn't critical, but good habits:

| Metric | Target | Why |
|--------|--------|-----|
| Initial bundle (gzipped) | < 150KB | Fast first load on mobile |
| Largest Contentful Paint | < 2s | Feels instant |
| Time to Interactive | < 3s | Usable quickly on mobile PWA |
| Firestore reads per session | < 50 | Stay well within free tier |

Vite's tree-shaking + Firebase v9 modular imports + Tailwind's purge keep the bundle small by default.

---

## Dependencies (initial)

### Production

```
react, react-dom               # UI framework
react-router-dom               # Client-side routing
firebase                       # Auth + Firestore + Hosting SDK
@sentry/react                  # Error tracking
@dnd-kit/core, @dnd-kit/sortable  # Drag and drop
tailwindcss                    # Utility-first CSS
```

### Development

```
typescript                     # Type system
vite                           # Build tool
vite-plugin-pwa                # PWA service worker + manifest
vitest                         # Test runner
@testing-library/react         # Component testing
eslint, prettier               # Code quality
```

### Explicitly Not Using

| Library | Why Not |
|---------|---------|
| axios | `fetch` is built into browsers, Firebase SDK handles its own HTTP |
| moment.js / dayjs | `Intl.DateTimeFormat` and native Date are sufficient for timestamp display |
| lodash | Modern JS (spread, Object.entries, Array methods) covers the use cases |
| redux / zustand | Firestore is the source of truth, Context is sufficient |
| styled-components | Tailwind handles styling without runtime CSS-in-JS overhead |
| next.js | No SSR needed, adds server complexity for zero benefit |

---

## Observability

Content Board is a single-user app. Full observability stacks (Datadog, Grafana, ELK) are overkill. The goal is simple: know when something breaks, have enough context to fix it.

### Error Tracking — Sentry (free tier)

**Why Sentry:** Industry standard for frontend error tracking. Captures unhandled exceptions with full stack traces (via source maps), breadcrumbs (what happened before the crash), browser/device context, and error grouping. Free tier: 5K errors/month — far more than a single-user app needs.

**What it captures:**
- Unhandled JavaScript exceptions (React error boundaries)
- Failed Firestore operations (network errors, permission denied)
- Failed auth flows
- PWA service worker errors
- Console errors (optional)

**What it does NOT do:** Analytics, performance dashboards, user session tracking. It's strictly error logs with context.

**Alternatives considered:**
- Firebase Crashlytics — primarily for mobile, weak web support
- Custom error logging to Firestore — you'd be building your own Sentry, poorly
- LogRocket — session replay is overkill for one user

**Setup:** ~10 lines in `main.tsx`. Sentry DSN is public (like Firebase API key) — security comes from Sentry's project-level access control, not from hiding the DSN.

**Sentry DSN handling:** The DSN goes in the codebase directly (not in `.env`). It is not a secret. It identifies your Sentry project the same way Firebase's apiKey identifies your Firebase project.

### Uptime Monitoring — UptimeRobot (free tier)

Pings `content.jitangupta.com` every 5 minutes. Emails you if the site is down. Set and forget. Firebase Hosting rarely goes down, but when it does, you want to know.

### Performance Regression — Lighthouse CI (in GitHub Actions)

Runs Lighthouse in the CI pipeline on every PR. Catches bundle size bloat, accessibility regressions, and performance degradation before they reach production. Not a runtime monitor — a pre-deploy gate.

### What We're NOT Doing (and Why)

| Tool | Why Not |
|------|---------|
| Firebase Analytics / GA4 | Single user — no audience behavior to analyze |
| Firebase Performance Monitoring | Sentry covers errors, Lighthouse CI covers perf regressions. Adding Firebase Performance adds SDK weight for minimal value in a single-user app |
| LogRocket / FullStory | Session replay for one user is pointless |
| Datadog / New Relic | Enterprise tools for multi-service architectures |
| Custom metrics / dashboards | No traffic to monitor, no SLAs to meet |

---

## Open Technical Decisions

1. **Full-text search (v1):** Firestore doesn't support it natively. For v1 with ~50-100 items, client-side filtering (filter the array in memory) is fine. If scale demands it later: Algolia (best Firestore integration), Typesense (open-source), or Meilisearch.

2. **Backup strategy:** Firestore automatic daily backups (requires Blaze plan) or manual JSON export via a Cloud Function on a schedule. For v1, manual export from Firebase console is acceptable.

3. **Staging environment:** Single Firebase project for v1. If needed later, create a second Firebase project (`content-board-staging`) and use `.env` files to switch.

---

*Document created: February 21, 2026*
*Last updated: February 21, 2026*
