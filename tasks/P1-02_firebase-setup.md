# P1-02: Firebase Setup

> **Phase:** 1 — Foundation (Sequential)
> **Branch:** `main`
> **Depends on:** P1-01 (scaffolding)
> **Status:** [x] Complete

## Objective

Set up the Firebase project, configure the Firebase SDK in the app, deploy Firestore security rules, and configure Firebase Hosting with CSP headers. After this task, `firebase deploy` works and the app connects to Firestore.

## Skills to Load

- `.claude/skills/firestore-patterns.md` (for the service layer structure)

## Steps

1. **Create Firebase project** (via Firebase Console):
   - Project name: `content-board` (or similar)
   - Enable Google Analytics: No
   - Enable Firestore (start in test mode, we'll lock it down)
   - Enable Authentication → Google sign-in provider

2. **Install Firebase CLI** (if not already):
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```
   Select: Firestore, Hosting. Set `dist` as public directory. Configure as SPA: Yes.

3. **Create `src/services/firebase.ts`** — Firebase initialization:
   ```typescript
   import { initializeApp } from 'firebase/app';
   import { getFirestore } from 'firebase/firestore';
   import { getAuth } from 'firebase/auth';

   const firebaseConfig = {
     apiKey: '...',
     authDomain: '...',
     projectId: '...',
     storageBucket: '...',
     messagingSenderId: '...',
     appId: '...',
   };

   const app = initializeApp(firebaseConfig);
   export const db = getFirestore(app);
   export const auth = getAuth(app);
   ```

4. **Create `firestore.rules`** — strict owner-only access:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /contents/{contentId} {
         allow read, write: if request.auth != null
           && request.auth.token.email == 'gtangupta@gmail.com';
       }
     }
   }
   ```

5. **Configure `firebase.json`** — hosting + CSP headers:
   - Rewrite all URLs to `/index.html` (SPA routing)
   - Add Content-Security-Policy header
   - Add X-Content-Type-Options, X-Frame-Options headers
   - Deploy Firestore rules on `firebase deploy`

6. **Create `.firebaserc`** — project alias

7. **Enable Firestore offline persistence** in `firebase.ts`:
   ```typescript
   import { enableIndexedDbPersistence } from 'firebase/firestore';
   enableIndexedDbPersistence(db).catch(() => { /* multi-tab not supported */ });
   ```

8. **Create `firestore.indexes.json`** — composite indexes per spec:
   - `phase` + `status` + `order` (ascending) — for sorted sidebar queries
   - `tags` (array-contains) — for tag filtering
   - Deploy with `firebase deploy --only firestore:indexes`

9. **Verify:** `firebase deploy --only firestore:rules` succeeds, `firebase deploy --only hosting` serves the app

## Acceptance Criteria

- [ ] `firebase.json` exists with hosting config (rewrites, headers)
- [ ] `firestore.rules` exists with owner-only access rules
- [ ] `.firebaserc` exists with project alias
- [ ] `src/services/firebase.ts` exports `db` and `auth`
- [ ] Firebase config values are hardcoded (NOT in .env — they're public)
- [ ] Offline persistence is enabled
- [ ] `firebase deploy --only firestore:rules` succeeds
- [ ] `firebase deploy --only hosting` serves the built app
- [ ] CSP headers are set in hosting config
- [ ] No Firebase imports exist outside `src/services/`

## Files Created / Modified

- `src/services/firebase.ts` — Firebase init + exports
- `firebase.json` — hosting config, CSP headers, rewrite rules
- `firestore.rules` — security rules
- `.firebaserc` — project alias
