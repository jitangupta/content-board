# Content Board — Claude Code Guidelines

## Project

Personal YouTube content management app. Single-user, serverless, client-side only.
Docs: `../content-board-spec.md` (features), `../tech-spec.md` (architecture).

## Stack

- React 18+ with Vite, TypeScript strict mode
- React Router v6
- Tailwind CSS + shadcn/ui
- Firebase: Auth (Google sign-in), Cloud Firestore, Hosting
- PWA via vite-plugin-pwa
- @dnd-kit for drag-and-drop
- Vitest + React Testing Library

## Architecture Rules

### Service Layer is Mandatory

Components NEVER import from `firebase/firestore`, `firebase/auth`, or any Firebase module directly. All Firebase operations go through `src/services/`. This is non-negotiable.

```
WRONG:  import { doc, setDoc } from 'firebase/firestore'  // in a component
RIGHT:  import { updateContent } from '@/services/firestore'  // in a component
```

### No Business Logic in Components

Components handle rendering and user interaction only. Business logic (status transitions, validation, data transformation, phase resolution) lives in hooks (`src/hooks/`, `src/features/*/use*.ts`) and utils (`src/utils/`).

### Types Are the Contract

All TypeScript interfaces live in `src/types/`. When the data model changes, update types first — let TypeScript errors guide the rest. Never use `any`. Never use `as` for type casting unless there is no alternative (and add a comment explaining why).

### Feature-Based Organization

Each feature (auth, content, production, learn, feedback) is self-contained under `src/features/`. A feature owns its components, hooks, and logic. Cross-feature shared code goes in `src/components/common/` or `src/hooks/`. For the full file tree, see `../tech-spec.md` § Project Structure.

### State Management: React Context + useReducer

Use React Context with `useReducer` for shared state. One provider per feature domain (`ContentProvider`, `AuthProvider`). Firestore `onSnapshot` listeners feed data into the reducer via `dispatch`. Do NOT scatter `useState` across components for shared data — if two components need the same data, it belongs in a Context provider.

### Use shadcn/ui for Complex Primitives

Use shadcn/ui (built on Radix UI) for: dropdowns, dialogs, tabs, tooltips, alert dialogs, and any interactive primitive that needs accessibility. Do NOT build these from scratch. For simple elements (buttons, inputs, badges), Tailwind utility classes are fine without shadcn.

## TypeScript Rules

- `strict: true` in tsconfig — no exceptions
- No `any` types. Use `unknown` + type guards if the type is genuinely unknown
- No `@ts-ignore` or `@ts-expect-error` — fix the types instead
- Prefer `interface` over `type` for object shapes (extends better)
- All function parameters and return types must be explicitly typed
- Use discriminated unions for status/phase: `type Status = 'draft' | 'technically-ready' | ...`

## React Rules

- Functional components only. No class components
- Custom hooks for any reusable logic. Prefix with `use`
- No `useEffect` for data fetching — use Firestore's `onSnapshot` via the service layer
- No `dangerouslySetInnerHTML`
- No inline styles — use Tailwind classes
- Every component that accepts props must have a typed Props interface
- Use React.memo only when profiling proves a re-render problem. Don't prematurely optimize

## Component File Pattern

```typescript
// src/components/Example/Example.tsx

interface ExampleProps {
  title: string;
  onAction: () => void;
}

export function Example({ title, onAction }: ExampleProps) {
  return (
    <div className="flex items-center gap-2 p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <button onClick={onAction} className="btn-primary">
        Action
      </button>
    </div>
  );
}
```

## Firestore Rules

- All reads/writes go through `src/services/firestore.ts`
- Every Firestore operation must handle errors with try/catch
- Use `onSnapshot` for real-time data, not `getDoc`/`getDocs` (except for one-time reads)
- Firestore security rules must reject unauthenticated access and restrict to owner email
- Never store sensitive data in Firestore that shouldn't be in a NoSQL document

## Data Model

9 lifecycle statuses grouped into 3 phases:

```
Pre-Production:  draft → technically-ready → shooting-script-ready → ready-to-record
Production:      recorded → edited
Post-Production: published → extracted-shorts → lifetime-value-ends
```

The `phase` field is derived from `status` — always compute it, never store inconsistent values. Use the helper in `src/utils/statusHelpers.ts`.

## File Naming

- Components: PascalCase (`ContentTab.tsx`, `PhaseGroup.tsx`)
- Hooks: camelCase with `use` prefix (`useContent.ts`, `useAuth.ts`)
- Utils/services: camelCase (`firestore.ts`, `statusHelpers.ts`)
- Types: camelCase (`content.ts`, `common.ts`)
- Test files: same name with `.test.ts(x)` suffix, co-located with source

## Testing

- Every service function must have unit tests
- Every custom hook must have tests
- Components: test user interactions, not implementation details
- Use Firebase Emulator for Firestore integration tests
- Test status transitions exhaustively — all valid transitions and invalid ones
- No snapshot tests

## What NOT to Do

- Don't add `axios`, `lodash`, `moment`, or `dayjs` — native alternatives exist
- Don't add Redux or Zustand — Context + useReducer is sufficient
- Don't create API routes or backend endpoints — this is client-side only
- Don't use CSS-in-JS (styled-components, emotion) — use Tailwind
- Don't commit `.env.local` or any file containing secrets
- Don't use `console.log` in production code — remove before committing
- Don't create files outside the defined project structure without discussing first
- Don't skip error handling — every async operation needs try/catch with user-facing error states

## Git

- Branch from `main` for features: `feature/sidebar-phase-groups`, `fix/status-transition-bug`
- Commit messages: imperative mood, concise. `Add phase group collapse to sidebar`, not `Added stuff`
- One logical change per commit
- PR description must explain what and why

## Observability

- Use `@sentry/react` for error tracking. Sentry DSN is public (like Firebase config) — it goes in `src/services/sentry.ts`
- Wrap `<App />` in `Sentry.ErrorBoundary` with a fallback UI — never let errors silently disappear
- Do NOT catch errors and swallow them. If you `catch`, either re-throw or call `Sentry.captureException(error)` explicitly
- Add `Sentry.addBreadcrumb()` for significant user actions (status transitions, content creation, auth events)
- No Sentry calls in components directly — route through the service layer (`src/services/sentry.ts`)

## Security

- Firebase client config (API key, project ID) is NOT secret — it goes in `src/services/firebase.ts`
- Sentry DSN is NOT secret — it goes in `src/services/sentry.ts`
- Firebase service account key IS secret — GitHub Secrets only, never in code
- Content Security Policy headers are configured in `firebase.json`
- Never use `eval()`, `Function()`, or inject user content as HTML
