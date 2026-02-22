# P1-01: Project Scaffolding

> **Phase:** 1 — Foundation (Sequential)
> **Branch:** `main`
> **Depends on:** Nothing — this is the first task
> **Status:** [ ] Not started

## Objective

Create the Vite + React + TypeScript project with all configuration files, folder structure, and dev tooling. After this task, `npm run dev` works and shows a blank app.

## Skills to Load

- `.claude/skills/routing.md` (for the route structure to scaffold)

## Steps

1. **Initialize the project** (from the `content-board/` directory):
   ```bash
   npm create vite@latest . -- --template react-ts
   ```
   > **WARNING:** The directory already contains files (CLAUDE.md, tasks/, .claude/, specs). If the CLI prompts about existing files, do NOT use `--overwrite` — it will delete everything. Instead, create the Vite project in a temp directory and copy only the scaffolding files (package.json, index.html, tsconfig.json, src/, etc.) into the project directory.
   >
   > After copying, update the `"name"` field in `package.json` to `"content-board"` and the `<title>` in `index.html` to `"Content Board"` (the temp directory defaults will be different).

2. **Install production dependencies:**
   ```bash
   npm install react-router-dom firebase @sentry/react @dnd-kit/core @dnd-kit/sortable
   ```

3. **Install dev dependencies:**
   ```bash
   npm install -D tailwindcss @tailwindcss/vite vitest @testing-library/react @testing-library/jest-dom jsdom eslint prettier eslint-config-prettier
   ```

4. **Configure TypeScript** — update `tsconfig.json`:
   - `"strict": true`
   - Path alias: `"@/*": ["./src/*"]`
   - `"target": "ES2020"`, `"module": "ESNext"`

5. **Configure Vite** — update `vite.config.ts`:
   - Path alias matching tsconfig
   - React plugin

6. **Configure Tailwind** — `tailwind.config.ts`:
   - Content paths: `./index.html`, `./src/**/*.{ts,tsx}`
   - Update `src/index.css` with Tailwind directives

7. **Initialize shadcn/ui:**
   ```bash
   npx shadcn@latest init
   ```
   - Select: New York style, Zinc color, CSS variables: yes

8. **Configure ESLint + Prettier:**
   - ESLint: TypeScript rules, React hooks plugin
   - Prettier: single quotes, trailing commas, 2-space indent
   - `.prettierrc` file

9. **Configure Vitest** — `vitest.config.ts`:
   - jsdom environment
   - Path alias matching tsconfig
   - Setup file for `@testing-library/jest-dom`

10. **Create folder structure** (empty directories with `.gitkeep`):
    ```
    src/
    ├── components/Sidebar/
    ├── components/DetailPanel/tabs/
    ├── components/Navbar/
    ├── components/common/
    ├── features/auth/
    ├── features/content/
    ├── features/production/
    ├── features/learn/
    ├── features/feedback/
    ├── services/
    ├── hooks/
    ├── types/
    └── utils/
    ```

11. **Create `.gitignore`** — node_modules, dist, .env.local, .firebase, coverage

12. **Create `.env.example`** — template with placeholder comments

13. **Verify:** `npm run dev` starts without errors, `npm run build` succeeds, `npx tsc --noEmit` passes

## Acceptance Criteria

- [ ] `npm run dev` starts the Vite dev server at localhost
- [ ] `npm run build` produces a `dist/` folder without errors
- [ ] `npx tsc --noEmit` passes with zero type errors
- [ ] `npx vitest run` exits with "no tests found" (not with config errors)
- [ ] TypeScript strict mode is enabled
- [ ] Path alias `@/` resolves to `src/`
- [ ] Tailwind classes render correctly (test with a `className="text-red-500"`)
- [ ] Folder structure matches tech-spec § Project Structure
- [ ] `.gitignore` excludes node_modules, dist, .env.local, .firebase
- [ ] All config files exist: tsconfig.json, vite.config.ts, tailwind.config.ts, vitest.config.ts, .prettierrc, eslint.config.js

## Files Created / Modified

- `package.json` — dependencies + scripts
- `tsconfig.json` — strict mode, path aliases
- `vite.config.ts` — React plugin, path alias
- `tailwind.config.ts` — content paths
- `vitest.config.ts` — jsdom, aliases
- `eslint.config.js` — TypeScript + React rules
- `.prettierrc` — formatting config
- `src/index.css` — Tailwind directives
- `src/main.tsx` — entry point (minimal)
- `src/App.tsx` — placeholder component
- `.gitignore`, `.env.example`
- Folder structure with `.gitkeep` files
