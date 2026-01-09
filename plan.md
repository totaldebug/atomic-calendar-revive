# Strategic Plan: Fix PlannerView Past Days

## 1. Understanding the Goal

**User Goal:** Ensure `PlannerView` displays rows for past days without events when `plannerRollingWeek` is false.

**Success Criteria:**
- `PlannerView` passes the correct configuration (with `_showPastEvents: true`) to `setNoEventDays`.
- Empty events for past days retain their correct date instead of defaulting to "today".
- Future days and other modes remain unaffected.

---

## 2. Risk & Architecture Assessment

**Risk Classification:** LOW 🟡

**Architecture Standard Check:**
* [x] **Frontend:** Lit/TypeScript - Logic fix in View component.
* [ ] **Backend:** N/A
* [ ] **Storage:** N/A
* [ ] **Deployment:** N/A

**Justification:**
- **Scope of Impact:** Localized to `PlannerView.ts`.
- **Reversibility:** Trivial revert.

---

## 3. Investigation & Analysis

**Context Gathered:**
- `src/lib/views/PlannerView.ts`: Passes `this.config` to `setNoEventDays` instead of `plannerConfig`.
- `src/lib/event.class.ts`: `startTimeToShow` clamps past dates to today unless `_showPastEvents` is true.
- `src/lib/common.html.ts`: `setNoEventDays` creates new `EventClass` instances using the passed config.

**Root Cause:**
`PlannerView` modifies a copy of the config (`plannerConfig`) to enable `_showPastEvents`, but fails to pass this modified config to the function responsible for creating empty day placeholders (`setNoEventDays`).

---

## 4. Verification Strategy (TDD)

**Automated Tests:**
- **None available.** Project lacks a test runner (Jest/Mocha) in `package.json`.

**Manual Verification Plan:**
1.  **Code Review:** Verify `setNoEventDays` receives `plannerConfig`.
2.  **Logic Check:** Trace `plannerConfig._showPastEvents` -> `setNoEventDays` -> `EventClass` constructor -> `startTimeToShow`.

**Mandatory Verification Checklist:**
- [ ] `npm run lint` passes.
- [ ] `npm run build` succeeds.

---

## 5. Proposed Strategic Approach

**Phase 1: Implementation**
- Modify `src/lib/views/PlannerView.ts` to pass `plannerConfig` to `setNoEventDays`.

**Phase 2: Verification**
- Run linting and build commands.

---

## 6. Anticipated Challenges

**Technical Risks:**
- None.

---

## 7. Draft of Changes (Specs)

**Modifications:**
- `src/lib/views/PlannerView.ts`:
    - **Function:** `update`
    - **Change:** Replace `this.config` with `plannerConfig` in the `setNoEventDays` call.

```typescript
// src/lib/views/PlannerView.ts

// OLD
this.events = setNoEventDays(this.config, this.events, start, end.add(1, 'day'));

// NEW
this.events = setNoEventDays(plannerConfig, this.events, start, end.add(1, 'day'));
```

---

## 8. Context for Implementation

**Files to Monitor:**
- `src/lib/views/PlannerView.ts`