# Content Board

Personal YouTube content management app for tracking ideas from draft to publication. Built with [Claude Code](https://docs.anthropic.com/en/docs/claude-code) — demonstrating that AI-assisted development can produce software with the same architecture, type safety, and engineering discipline as a traditional codebase.

![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue) ![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth%20%2B%20Hosting-orange) ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4) ![PWA](https://img.shields.io/badge/PWA-installable-brightgreen)

## Watch the Build Process

This project is part of a video series on building production-grade software with AI:

1. [Engineering Claude Code for Production — Beyond Prompting](https://www.youtube.com/watch?v=7JVA1LjRNAw) — how `CLAUDE.md`, custom commands, and skills files turn Claude Code into a disciplined engineering partner
2. [AI Code Review: 5 Checks Before You Merge](https://www.youtube.com/watch?v=mP4igQr2R0E) — the review workflow used in this project's CI pipeline
3. [Run 3 AI Agents at Once — Git Worktree Workflow](https://www.youtube.com/watch?v=yJWw4HAEqG0) — parallelizing development with Claude Code agents in isolated worktrees

## What It Does

Content Board tracks YouTube video ideas through a 9-stage lifecycle grouped into 3 phases:

```
Pre-Production:  Draft → Technically Ready → Shooting Script Ready → Ready to Record
Production:      Recorded → Edited
Post-Production: Published → Extracted Shorts → Lifetime Value Ends
```

**Key features:**

- **Content lifecycle tracking** — move videos through stages with one-click status transitions
- **Four-tab detail panel** — Content, Production, Learn, Feedback tabs per video
- **Production planning** — demo items, talking points, shooting script outlines, thumbnail ideas
- **Learning capture** — record what you learned from each video, link learnings to future content
- **Feedback collection** — tag feedback by source (self, peer, family, comment)
- **Drag-and-drop reordering** — prioritize content within Pre-Production
- **Search and filter** — find content by title, tags, status, or phase
- **Dark/light theme** — system-aware with manual toggle
- **PWA** — installable on desktop and mobile, works offline
- **Single-user, serverless** — Google sign-in, Firestore rules lock data to your account

> **Personal use by design.** This app is not multi-tenant. Firestore security rules restrict all reads and writes to a single email address that you configure. Only the Google account matching that email can access data — everyone else is denied at the database level.

## Built With Claude Code

This project was built with [Claude Code](https://docs.anthropic.com/en/docs/claude-code) as an AI-assisted engineering workflow — not throwaway prototyping, but structured development with strict TypeScript, enforced architecture rules, service layer boundaries, and proper test coverage. The `.claude/` directory is included in this repo so you can see (and reuse) the full workflow:

- **`CLAUDE.md`** — project-level instructions that guide Claude's behavior (architecture rules, coding standards, what NOT to do)
- **`.claude/commands/`** — custom slash commands for deployment checks, code review, and security audits
- **`.claude/skills/`** — reusable knowledge files teaching Claude project-specific patterns (auto-save, Firestore, status transitions, UI patterns)
- **`.claude/settings.json`** — hooks for auto-formatting on every file edit

If you use Claude Code, you can fork this repo and tell Claude to "make this yours" — it will read the `CLAUDE.md` and `.claude/` files and understand the entire project's architecture, conventions, and patterns. The commands and skills work out of the box: run `/deploy-check` before shipping, `/review` for code review, or `/security-check` to audit for vulnerabilities.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript (strict) |
| Styling | Tailwind CSS 4 + shadcn/ui (Radix) |
| Database | Cloud Firestore (real-time sync) |
| Auth | Firebase Auth (Google sign-in) |
| Hosting | Firebase Hosting |
| PWA | vite-plugin-pwa + Workbox |
| Drag & Drop | @dnd-kit |
| Error Tracking | Sentry |
| CI/CD | GitHub Actions |
| Testing | Vitest + React Testing Library |

## Make It Yours

Fork this repo and set up your own instance in a few steps.

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project
2. Enable **Authentication** → Sign-in method → **Google**
3. Create a **Cloud Firestore** database (start in production mode)
4. Set up **Firebase Hosting**

If you're new to Firebase, this guide covers the full setup: [Get started with Firebase for web](https://firebase.google.com/docs/web/setup)

### 2. Configure Environment

Copy the example env file and fill in your Firebase config values (found in Firebase Console → Project Settings → Your apps → Web app):

```bash
cp .env.example .env.development
```

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. Update Firestore Security Rules

Edit `firestore.rules` and replace the placeholder email with your Google account:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /contents/{contentId} {
      allow read, write: if request.auth != null
        && request.auth.token.email == 'your-email@gmail.com';
    }
  }
}
```

### 4. Update Firebase Project

Edit `.firebaserc` and replace the placeholder with your Firebase project ID:

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

### 5. Install and Run

```bash
npm install
npm run dev
```

### 6. Seed Sample Data (Optional)

Load 5 sample content items across different lifecycle stages to see the app in action:

1. Generate a Firebase Admin SDK service account key:
   Firebase Console → Project Settings → Service accounts → **Generate new private key**
2. Save it as `seed/serviceAccountKey.json` (this file is gitignored)
3. Run the seed script:

```bash
npx tsx seed/import.ts
```

This creates sample videos in Draft, Technically Ready, Shooting Script Ready, Recorded, and Published stages — with demo items, talking points, learnings, and feedback attached.

### 7. Deploy

Install the Firebase CLI and deploy:

```bash
npm install -g firebase-tools
firebase login
firebase deploy
```

For CI/CD deployment via GitHub Actions, add these as repository secrets:

| Secret | Value |
|--------|-------|
| `VITE_FIREBASE_API_KEY` | Your Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | your-project.firebaseapp.com |
| `VITE_FIREBASE_PROJECT_ID` | Your project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | your-project.firebasestorage.app |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your sender ID |
| `VITE_FIREBASE_APP_ID` | Your app ID |
| `FIREBASE_SERVICE_ACCOUNT` | Service account JSON (see [Firebase GitHub Action docs](https://github.com/FirebaseExtended/action-hosting-deploy)) |

## Project Structure

```
src/
├── components/          # Shared UI components
│   ├── common/          # StatusBadge, ChipInput, FormActions
│   ├── DetailPanel/     # Detail panel with tabbed interface
│   │   └── tabs/        # ContentTab, ProductionTab, LearnTab, FeedbackTab
│   ├── Navbar/
│   ├── Sidebar/         # Phase groups, search, filters, drag-and-drop
│   └── ui/              # shadcn/ui primitives
├── features/            # Feature modules
│   ├── auth/            # AuthProvider, AuthGuard, LoginPage
│   ├── content/         # ContentProvider, contentReducer, useContent
│   ├── feedback/        # FeedbackList, GlobalFeedbackPage
│   ├── learn/           # LearningList, GlobalLearningsPage
│   └── production/      # DemoItemList, TalkingPointList
├── hooks/               # Shared hooks (useDragAndDrop, useFormDraft, useTheme)
├── services/            # Firebase, Firestore, Sentry, Auth
├── types/               # TypeScript interfaces
└── utils/               # Status helpers, relative time
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run format` | Format code with Prettier |
| `npm run preview` | Preview production build locally |

## License

MIT
