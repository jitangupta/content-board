# P5-03: Auto-Save

> **Phase:** 5 — Interactions & Search (Parallel)
> **Branch:** `feature/auto-save`
> **Worktree:** `../cb-autosave`
> **Depends on:** P3-03 (detail panel)
> **Parallel with:** P5-01 (dnd), P5-02 (search)
> **Status:** [ ] Not started

## Objective

Implement debounced auto-save on typing and immediate save on blur for all editable fields. After this task, users never need a save button — changes persist automatically.

## Skills to Load

- `.claude/skills/auto-save.md` (follow this exactly)

## Steps

1. **Create `src/hooks/useAutoSave.ts`**:
   - Parameters: `contentId`, `fieldName`, `value`, `delay` (default 1500ms)
   - Debounces `updateContent()` calls on value change
   - Immediate save on blur (cancel pending debounce, save now)
   - Returns: `{ saving: boolean, lastSaved: Date | null }`
   - Error handling: captures error, shows inline error state
   - Does NOT save if value hasn't changed from Firestore value

2. **Create `src/components/common/SaveIndicator.tsx`**:
   - Subtle indicator: "Saving..." (during save), "Saved" (after save, fades after 2s)
   - Small text, positioned near the field or in a fixed position
   - NOT a toast — too intrusive for auto-save
   - Shows error state: "Save failed — retrying..." with retry logic

3. **Update `src/components/DetailPanel/tabs/ContentTab.tsx`**:
   - Each editable field uses `useAutoSave` hook
   - Title, description, notes, YouTube URL, shooting script, thumbnail ideas
   - Tags use immediate save on add/remove (no debounce needed for discrete actions)
   - SaveIndicator shown near each field or in the panel header

4. **Update Production tab textareas** (shooting script, thumbnail ideas):
   - Same auto-save pattern

5. **Write tests:**
   - useAutoSave: debounces correctly, saves immediately on blur, handles errors
   - SaveIndicator: shows correct state transitions
   - Verify no duplicate saves (changing value rapidly doesn't fire multiple saves)

## Acceptance Criteria

- [ ] Typing in any field triggers auto-save after 1500ms pause
- [ ] Blurring a field triggers immediate save (no waiting for debounce)
- [ ] SaveIndicator shows "Saving..." and "Saved" states
- [ ] No duplicate saves on rapid typing
- [ ] Failed saves show error and retry
- [ ] Tags save immediately on add/remove (discrete actions)
- [ ] Auto-save does NOT fire if value matches what's in Firestore
- [ ] All saves go through the service layer (`updateContent`)
- [ ] No toasts for auto-save (subtle inline indicator only)
- [ ] Tests pass

## Files Created / Modified

- `src/hooks/useAutoSave.ts` (NEW)
- `src/components/common/SaveIndicator.tsx` (NEW)
- `src/components/DetailPanel/tabs/ContentTab.tsx` (MODIFIED)
- `src/components/DetailPanel/tabs/ProductionTab.tsx` (MODIFIED — if shooting script/thumbnail use auto-save)
