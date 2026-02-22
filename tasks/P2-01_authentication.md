# P2-01: Authentication

> **Phase:** 2 — Auth & Data Layer (Sequential)
> **Branch:** `main`
> **Depends on:** P1-02 (Firebase setup)
> **Status:** [ ] Not started

## Objective

Implement Google sign-in authentication with AuthProvider context, login page, route guard, and Sentry user context. After this task, only `gtangupta@gmail.com` can access the app.

## Skills to Load

- `.claude/skills/routing.md` (for AuthGuard pattern)
- `.claude/skills/observability.md` (for setUserContext on login)

## Steps

1. **Create `src/services/auth.ts`** — auth service layer:
   - `signInWithGoogle()` — uses `signInWithPopup` with GoogleAuthProvider
   - `signOut()` — calls `firebase/auth` signOut
   - `onAuthStateChanged(callback)` — wraps the Firebase listener
   - Calls `setUserContext()` on sign-in, `clearUserContext()` on sign-out
   - Calls `addBreadcrumb('auth', ...)` on sign-in/sign-out

2. **Create `src/features/auth/AuthProvider.tsx`** — Auth context:
   - State: `{ user: User | null, loading: boolean }`
   - Uses `useReducer` for state
   - Sets up `onAuthStateChanged` listener in useEffect
   - Provides `user`, `loading`, `signIn`, `signOut` via context

3. **Create `src/features/auth/useAuth.ts`** — hook to consume AuthContext

4. **Create `src/features/auth/LoginPage.tsx`**:
   - Centered card with app name "Content Board"
   - "Sign in with Google" button
   - Minimal design using Tailwind
   - Shows error message if sign-in fails

5. **Create `src/features/auth/AuthGuard.tsx`**:
   - If loading: show spinner/skeleton
   - If not authenticated: redirect to `/login`
   - If authenticated but wrong email: show "Access denied"
   - If authenticated and correct email: render `<Outlet />`

6. **Update `src/App.tsx`** — wire up routing:
   ```
   <AuthProvider>
     <BrowserRouter>
       <Routes>
         <Route path="/login" element={<LoginPage />} />
         <Route element={<AuthGuard />}>
           {/* Protected routes will go here in later tasks */}
           <Route path="/" element={<div>Dashboard placeholder</div>} />
         </Route>
       </Routes>
     </BrowserRouter>
   </AuthProvider>
   ```

7. **Write tests:**
   - `auth.ts` — mock Firebase, test signIn/signOut calls
   - `AuthGuard` — test redirect when unauthenticated, render when authenticated
   - `LoginPage` — test sign-in button exists

## Acceptance Criteria

- [ ] Google sign-in works — clicking the button opens Google auth popup
- [ ] Successful sign-in redirects to `/` (dashboard placeholder)
- [ ] Unauthorized email shows "Access denied" message
- [ ] Unauthenticated user is redirected to `/login`
- [ ] Sign-out returns user to `/login`
- [ ] Auth state persists across page refresh (Firebase handles this)
- [ ] Sentry user context is set on sign-in, cleared on sign-out
- [ ] No Firebase auth imports outside `src/services/auth.ts`
- [ ] `AuthProvider` uses `useReducer` (not scattered `useState`)
- [ ] Tests pass for auth service, AuthGuard, and LoginPage

## Files Created / Modified

- `src/services/auth.ts` — auth service layer (NEW)
- `src/features/auth/AuthProvider.tsx` — auth context provider (NEW)
- `src/features/auth/useAuth.ts` — auth hook (NEW)
- `src/features/auth/LoginPage.tsx` — login page (NEW)
- `src/features/auth/AuthGuard.tsx` — route guard (NEW)
- `src/App.tsx` — add AuthProvider + routing (MODIFIED)
