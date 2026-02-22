# P6-01: PWA Setup

> **Phase:** 6 — Polish & Deploy (Parallel)
> **Branch:** `feature/pwa`
> **Worktree:** `../cb-pwa`
> **Depends on:** P1-01 (scaffolding — vite-plugin-pwa already installed)
> **Parallel with:** P6-02 (CI/CD), P6-04 (responsive)
> **Status:** [ ] Not started

## Objective

Configure vite-plugin-pwa for installable app experience, service worker caching, and web manifest. After this task, the app can be installed on mobile and works offline.

## Steps

1. **Update `vite.config.ts`** — add VitePWA plugin:
   ```typescript
   import { VitePWA } from 'vite-plugin-pwa';

   export default defineConfig({
     plugins: [
       react(),
       VitePWA({
         registerType: 'autoUpdate',
         manifest: {
           name: 'Content Board',
           short_name: 'ContentBoard',
           description: 'YouTube content management system',
           theme_color: '#ffffff',
           background_color: '#ffffff',
           display: 'standalone',
           icons: [
             { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
             { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
           ],
         },
         workbox: {
           globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
         },
       }),
     ],
   });
   ```

2. **Create PWA icons** in `public/icons/`:
   - `icon-192.png` (192x192) — app icon
   - `icon-512.png` (512x512) — splash screen
   - Simple "CB" text on a colored background (can refine later)

3. **Add "Add to Home Screen" prompt** (optional enhancement):
   - Listen for `beforeinstallprompt` event
   - Show a subtle banner when installable
   - Dismiss and don't show again if declined

4. **Verify offline behavior:**
   - Build and serve with `npx serve dist`
   - Open app, sign in, load content
   - Go offline (Chrome DevTools → Network → Offline)
   - App shell loads from service worker cache
   - Firestore data loads from IndexedDB cache (set up in P1-02)
   - Writes queue and sync when back online

5. **Test on mobile:**
   - Deploy to Firebase Hosting
   - Open on phone's browser
   - "Add to Home Screen" prompt appears
   - App launches full-screen from home screen icon

## Acceptance Criteria

- [ ] `vite-plugin-pwa` configured in vite.config.ts
- [ ] Web manifest includes name, icons, theme color, display standalone
- [ ] Service worker precaches app shell (HTML, CSS, JS)
- [ ] PWA icons exist at 192x192 and 512x512
- [ ] App is installable on Chrome (desktop + mobile)
- [ ] App works offline (app shell loads, cached Firestore data available)
- [ ] Lighthouse PWA audit passes
- [ ] `npm run build` succeeds with PWA plugin

## Files Created / Modified

- `vite.config.ts` (MODIFIED — add VitePWA plugin)
- `public/icons/icon-192.png` (NEW)
- `public/icons/icon-512.png` (NEW)
