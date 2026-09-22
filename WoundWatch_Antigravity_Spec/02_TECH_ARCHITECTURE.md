# Technical Architecture — WoundWatch AI

## 1. Architecture

```text
                         PHONE
┌──────────────────────────────────────────────┐
│ React + TypeScript PWA                       │
│                                              │
│  Camera ───────┐                             │
│  Upload ───────┤                             │
│  Voice ────────┤                             │
│                ▼                             │
│       Observation Engine                    │
│        ┌───────────────┐                    │
│        │ Prototype CV  │                    │
│        │ Local Canvas  │                    │
│        └───────┬───────┘                    │
│                │                             │
│        Symptom Context                       │
│                │                             │
│                ▼                             │
│       Recovery Reasoner                      │
│                │                             │
│        ┌───────┴────────┐                    │
│        ▼                ▼                    │
│  Recovery Snapshot   Safety Prompt           │
│        │                                      │
│        ▼                                      │
│    localStorage                              │
│        │                                      │
│        ▼                                      │
│    Timeline / CareGuide                      │
└──────────────────────────────────────────────┘
```

## 2. Why PWA

For Phase-1:
- fastest implementation;
- no Android Studio dependency;
- camera works through browser permissions;
- can be deployed instantly;
- responsive phone UX;
- can later be wrapped or migrated to native Android.

The official rules explicitly allow PWA. citeturn0search0

## 3. Repository structure

```text
woundwatch/
├── src/
│   ├── components/
│   │   ├── CameraCapture.tsx
│   │   ├── SymptomInput.tsx
│   │   ├── RecoveryResult.tsx
│   │   ├── Timeline.tsx
│   │   ├── CareGuide.tsx
│   │   └── SafetyNotice.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Check.tsx
│   │   ├── TimelinePage.tsx
│   │   └── Guide.tsx
│   ├── services/
│   │   ├── observationEngine.ts
│   │   ├── imageFeatures.ts
│   │   ├── voice.ts
│   │   └── storage.ts
│   ├── types/
│   │   └── index.ts
│   ├── data/
│   │   └── demoCase.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── demo/
├── package.json
├── vite.config.ts
└── README.md
```

## 4. Data types

```ts
type Trend = "Improving" | "Stable" | "Needs attention";

interface SymptomContext {
  pain: number;
  symptoms: string[];
  voiceNote?: string;
}

interface VisualSignal {
  redDominance: number;
  brightness: number;
  imageQuality: "good" | "low";
}

interface RecoveryCheck {
  id: string;
  timestamp: string;
  visualSignal: VisualSignal;
  context: SymptomContext;
  trend: Trend;
  explanation: string;
  safetyPrompt: string;
}
```

## 5. Observation rules

Keep the rules transparent.

Example:

```text
if fever OR discharge:
    trend = Needs attention

else if pain >= 7:
    trend = Needs attention

else if pain <= 4 AND no concerning symptom:
    trend = Improving

else:
    trend = Stable
```

This is not a medical classifier. It is a prototype decision-support demonstration.

## 6. Local AI upgrade path

During the actual city battle:

```text
PrototypeObservationEngine
          ↓ replace
LocalVisionEngine
          ↓
small open-source vision model
          ↓
Snapdragon NPU / on-device inference
```

And:

```text
Deterministic CareGuide
          ↓ replace
LocalLLMEngine
          ↓
small open-source LLM
```

The official rules specifically reward local/open-source models at the core. citeturn0search0

## 7. Backend upgrade path

Do not build tonight.

Future:

```text
Phone
  ↓
FastAPI
  ↓
PostgreSQL / Supabase
  ↓
Encrypted user timeline
```

For the hackathon battle, add this only if the core phone experience is already stable.
