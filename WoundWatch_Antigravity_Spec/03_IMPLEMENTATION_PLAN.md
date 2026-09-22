# Implementation Plan — 2–4 Hour Phase-1 Sprint

## Phase 0 — 5 minutes

Create:
- React + TypeScript + Vite project.
- Install PWA support if time permits.
- Run locally.

Do not spend time configuring a complicated design system.

---

## Phase 1 — 20 minutes: shell

Build:
- top header;
- bottom/tab navigation;
- Home;
- New Check;
- Timeline;
- CareGuide.

Acceptance:
- all navigation works;
- mobile width looks polished.

---

## Phase 2 — 30 minutes: camera

Implement:
- `getUserMedia`;
- rear camera;
- capture;
- upload;
- demo image.

Acceptance:
- phone browser opens camera;
- capture displays image;
- upload works if camera permission fails.

---

## Phase 3 — 20 minutes: symptom context

Implement:
- pain slider;
- symptom chips;
- voice note;
- text fallback.

Acceptance:
- all inputs persist in React state;
- voice failure does not break the app.

---

## Phase 4 — 30 minutes: observation engine

Implement:
- canvas image extraction;
- brightness;
- red-dominance signal;
- transparent trend rules;
- result card.

Acceptance:
- Analyze button always returns a result;
- no API calls;
- no fake diagnosis.

---

## Phase 5 — 20 minutes: timeline

Implement:
- localStorage;
- save check;
- list checks;
- reset demo.

Acceptance:
- refresh retains timeline;
- newest check appears first.

---

## Phase 6 — 20 minutes: CareGuide

Implement deterministic FAQ-style conversational UI.

Required questions:
1. Can a phone image confirm infection?
2. Why track the same angle?
3. Why does pain matter?
4. What does WoundWatch not do?

Acceptance:
- answer appears instantly;
- answers are medically cautious.

---

## Phase 7 — 20 minutes: polish

Fix:
- overflow;
- loading states;
- button states;
- camera permission error;
- empty timeline;
- mobile spacing;
- accessibility labels.

Add:
- synthetic demo image;
- sample timeline;
- clear "Prototype / Educational only" label.

---

## Phase 8 — 15 minutes: deploy

Deploy static build to Netlify/Vercel.

Test:
- phone;
- desktop;
- refresh;
- camera;
- demo image;
- timeline.

---

## Hard stop

If time is running out, stop adding features.

Do not add:
- login;
- database;
- admin panel;
- real LLM API;
- payments;
- clinician dashboard;
- notifications;
- complex analytics.

A working, polished narrow MVP scores better than an unfinished platform. The official rubric puts 30% on end-product quality. citeturn0search0
