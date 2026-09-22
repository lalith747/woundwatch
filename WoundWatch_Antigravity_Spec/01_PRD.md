# PRD — WoundWatch AI

## 1. Product summary

WoundWatch AI is a phone-first recovery observation companion for users who want to document visible changes in a minor wound/recovery journey over multiple checks.

The product does not diagnose. It combines:
- a consistent phone-camera image,
- user-reported symptoms,
- pain score,
- optional voice note,
- longitudinal history,

and turns them into an understandable **recovery observation snapshot** plus **safety guidance**.

### One-line pitch

> WoundWatch turns a smartphone into a longitudinal recovery companion — helping users capture, compare and understand observable changes without pretending to diagnose them.

---

## 2. Problem

A single photo gives little context. Recovery observations are often inconsistent because users:
- photograph from different angles,
- use different lighting,
- forget previous symptoms,
- do not keep structured records,
- do not know which changes deserve professional attention.

Generic health chatbots answer questions but do not provide a focused longitudinal observation workflow.

---

## 3. Target users

### Primary
Adults tracking a minor wound/recovery process who want a simple personal record and educational guidance.

### Secondary
Caregivers who help someone maintain a structured observation log.

### Not the target
Emergency care, diagnosis, treatment selection, pathogen identification, or clinical decision replacement.

---

## 4. Product goals

### Phase-1 goals
- Make the camera the primary interaction.
- Make the result understandable in under 10 seconds.
- Show a longitudinal timeline.
- Make safety boundaries visible.
- Demonstrate phone-native interaction.
- Give the judges a complete 60–90 second user journey.

### Future goals
- Run a small open-source vision model locally on the iQOO device.
- Add a local/open-source language model for CareGuide.
- Add stronger image normalization and longitudinal comparison.
- Add secure backend storage.
- Add clinician-shareable summaries with explicit consent.

---

## 5. Non-goals

Do NOT build in the MVP:
- diagnosis of infection;
- bacterial/fungal/viral identification;
- medication recommendations;
- treatment prescriptions;
- emergency triage;
- claims of clinical accuracy;
- user accounts;
- real patient data collection;
- cloud storage of health images.

---

## 6. Core user journey

### Journey A — New recovery check

1. Open WoundWatch.
2. Tap **Start recovery check**.
3. Camera opens.
4. User captures an image or loads a demo image.
5. User records pain from 0–10.
6. User selects symptoms.
7. Optional voice note.
8. Tap **Analyze recovery**.
9. App extracts a lightweight visual signal locally.
10. App combines it with reported context.
11. App shows:
   - visual signal,
   - recovery trend,
   - pain,
   - observations,
   - safety prompt.
12. User saves the check.
13. Timeline updates.

### Journey B — Education

1. Open CareGuide.
2. Ask: "Can a phone image confirm infection?"
3. App answers:
   - No.
   - A phone image alone cannot confirm microbial infection.
   - WoundWatch tracks observable changes and reported symptoms.
   - Seek professional care if concerning changes worsen.

### Journey C — Timeline

1. Open Timeline.
2. See Check 1, Check 2, Check 3.
3. See pain + trend + reported symptoms.
4. Understand whether the user's recorded observations are changing.

---

## 7. MVP feature requirements

### F1 — Home / Overview
Must show:
- product name;
- short value proposition;
- current recovery snapshot;
- CTA: Start recovery check;
- safety boundary.

### F2 — Camera
Must:
- request rear camera;
- show live preview;
- capture frame;
- provide upload fallback;
- provide synthetic demo image.

### F3 — Image normalization
For prototype:
- resize image to a fixed small canvas;
- optionally compute average brightness;
- compute a simple red-dominance / colour-area signal;
- display it as an **observable visual signal**.

Do not map the number to infection probability.

### F4 — Symptoms
Provide:
- pain 0–10;
- More pain;
- Swelling;
- Warmth;
- Discharge;
- Fever;
- No new symptoms.

Allow multiple selections.

### F5 — Voice note
Use Web Speech API where supported.
Fallback:
- text input.

### F6 — Recovery analysis
Inputs:
- visual signal;
- pain;
- symptoms.

Outputs:
- Stable / Improving / Needs attention;
- observable signal;
- pain;
- explanation;
- safety prompt.

Use transparent rules for MVP. Label the intelligence as **Prototype AI / observation engine**.

### F7 — Timeline
Store locally:
- timestamp;
- pain;
- symptoms;
- trend;
- visual signal.

Use localStorage.

### F8 — CareGuide
Deterministic educational responses for at least:
- infection;
- pain;
- redness/swelling;
- how to take consistent images;
- what WoundWatch does not do.

### F9 — Safety
Every analysis screen should show:
> This prototype provides observation and educational guidance only. It does not diagnose infection or replace qualified medical care.

---

## 8. Future AI architecture

The MVP should expose a clean interface so the heuristic can later be replaced.

```ts
interface ObservationEngine {
  analyze(image: Blob, context: SymptomContext): Promise<ObservationResult>;
}
```

Implement:
1. `PrototypeObservationEngine`
2. Future `LocalVisionEngine`
3. Future `LocalLLMEngine`

This lets the team swap in a local/open-source model during the city battle without rebuilding the UI.

---

## 9. Success criteria

A judge should be able to understand the product in <20 seconds.

A complete demo should take 60–90 seconds.

The app must:
- work on a phone;
- work without a backend;
- survive refresh;
- have no API-key setup;
- have no broken buttons;
- provide a visible camera interaction;
- show a timeline;
- clearly communicate safety boundaries.

---

## 10. UX principles

- One primary CTA per screen.
- Large touch targets.
- High contrast.
- No medical jargon unless explained.
- Never use "diagnose", "infected", "infection detected" as a model output.
- Show progress: Capture → Context → Analyze → Timeline.
- Keep the demo path under 5 taps.

---

## 11. Privacy principle

Phase-1 uses local browser storage only.

Do not upload health images to a third-party service.

Do not use real patient images in the demo.

Use synthetic/demo imagery unless the user has appropriate permission.
