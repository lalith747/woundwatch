# Antigravity Master Prompt

You are the lead engineer for a hackathon prototype called **WoundWatch AI**.

Read these files before coding:
- `00_README.md`
- `01_PRD.md`
- `02_TECH_ARCHITECTURE.md`
- `03_IMPLEMENTATION_PLAN.md`

## Mission

Build the complete Phase-1 MVP described in the PRD.

The user has only 2–4 hours. Optimize for:
1. working product;
2. phone UX;
3. camera interaction;
4. clear demo;
5. reliability;
6. deployment simplicity.

Do NOT over-engineer.

## Product positioning

WoundWatch AI is a phone-first recovery observation companion.

Core flow:

Camera → symptoms/voice → local observable signal → recovery snapshot → timeline → safety guidance.

It is NOT:
- a diagnostic device;
- a pathogen detector;
- an infection classifier;
- a treatment recommender;
- a replacement for a clinician.

Never output claims such as:
- "infection detected";
- "you have an infection";
- "this is bacterial";
- "take this medicine".

Use:
- "observable visual signal";
- "reported symptom";
- "trend";
- "safety prompt";
- "consider professional care".

## Technical constraints

Use:
- React
- TypeScript
- Vite
- responsive CSS
- browser APIs
- localStorage

Do not require:
- API keys;
- external databases;
- authentication;
- cloud AI;
- paid services.

The application must work offline after initial load except for deployment.

## Required pages

### 1. Overview
Show:
- WoundWatch AI
- value proposition
- current demo recovery state
- Start recovery check
- safety notice

### 2. New Check
Show:
- camera;
- upload;
- demo image;
- pain;
- symptom chips;
- voice note;
- Analyze Recovery.

### 3. Recovery Result
Show:
- visual signal;
- trend;
- pain;
- explanation;
- safety prompt;
- Save to Timeline.

### 4. Timeline
Show:
- chronological recovery checks;
- pain;
- symptoms;
- trend;
- visual signal.

### 5. CareGuide
Show:
- conversational educational interface;
- safe deterministic responses.

## Camera requirements

Use:
`navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })`

Provide graceful fallback if camera permission is denied.

Provide:
- Upload;
- Demo image.

## Local observation engine

Create:

```ts
export interface ObservationEngine {
  analyze(image: HTMLImageElement | HTMLCanvasElement, context: SymptomContext): Promise<ObservationResult>;
}
```

Implement a prototype engine using Canvas.

Extract:
- brightness;
- simple red-dominance percentage;
- image quality.

Do NOT convert these into a medical probability.

## Trend logic

```text
concerning symptom = fever OR discharge OR warmth OR more pain

if concerning symptom:
    Needs attention

else if pain >= 7:
    Needs attention

else if pain <= 4:
    Improving

else:
    Stable
```

Call this:
**prototype recovery trend**, not a diagnosis.

## CareGuide required answers

Question:
"Can a phone image confirm infection?"

Answer:
"No. A phone image alone cannot confirm whether bacteria or another pathogen is present. WoundWatch tracks observable changes and user-reported symptoms. If symptoms worsen or you are concerned, seek qualified medical care."

Question:
"Why take the image from the same angle?"

Answer:
"Consistent lighting, distance and angle make visual comparisons more meaningful. The timeline is designed to help you observe change rather than interpret one image in isolation."

Question:
"What does WoundWatch not do?"

Answer:
"It does not diagnose infection, identify pathogens, prescribe medication or replace professional medical care."

## Demo case

Include a synthetic image with a visible label:
"SYNTHETIC DEMO IMAGE — NOT A REAL CLINICAL PHOTO"

Never use a real patient's wound photo.

## UI

Make it look like a premium mobile health product:
- clean;
- calm;
- green/neutral palette;
- rounded cards;
- strong typography;
- large touch targets;
- minimal clutter.

Use a responsive desktop layout for judges but optimize primarily for 390–430px phone width.

## Reliability

Before finishing:
- run build;
- fix TypeScript errors;
- test all routes;
- test refresh;
- test empty states;
- test camera denial;
- test upload;
- test demo;
- test localStorage;
- test CareGuide;
- ensure no console-breaking errors.

## Final output

After implementation, report:
1. files created/changed;
2. how to run;
3. build result;
4. deployment command;
5. exact 90-second demo path;
6. known limitations.

Do not start adding stretch features until the MVP is fully working.
