# WoundWatch AI — Antigravity Build Pack

## Objective

Build a polished, phone-first HealthTech MVP for the iQOO Hackathon Phase-1 screening submission.

**Product:** WoundWatch AI  
**Track:** HealthTech  
**Core workflow:** Camera → symptom/voice input → observable recovery signal → longitudinal timeline → safety guidance.

The official iQOO rules make the phone the build/demo surface, reward camera/voice/on-device AI, and award 30% to end-product quality, 20% to novelty/impact, 15% to creative phone use, 15% to technical depth, 10% to Office Kit usage, and 10% to demo/presentation. A local/open-source model at the core earns brownie points. citeturn0search0

## Tonight's priority

This is a 2–4 hour Phase-1 prototype. Do NOT attempt a clinical-grade diagnostic model, authentication, clinician portal, payment system, or complex backend.

### Must work
1. Mobile-first responsive UI.
2. Camera capture on mobile.
3. Image upload fallback.
4. Synthetic demo case.
5. Pain slider + symptom chips.
6. Voice note using browser speech recognition where supported.
7. Observable image signal computed locally in browser.
8. Recovery result screen.
9. Timeline stored in localStorage.
10. CareGuide educational chat with deterministic safe answers.
11. Deployable as a PWA/static site.
12. No API keys required for the Phase-1 demo.

### Do not claim
- infection diagnosis
- pathogen identification
- wound severity diagnosis
- treatment prescription
- clinical validation
- medical-device status
- "AI detects infection"

Use: "observable visual signal", "trend", "user-reported symptoms", "safety prompt", "prototype".

## Recommended stack

- React + TypeScript + Vite
- CSS or Tailwind
- PWA plugin
- Browser MediaDevices API
- Browser SpeechRecognition/Web Speech API
- Canvas API for lightweight local visual feature extraction
- localStorage for demo persistence
- Netlify/Vercel static deployment

The official rules allow native Android, Flutter, React Native, or PWA as long as the solution runs on the phone. citeturn0search0

## Important event constraint

The official rules say code for the city battle must be original work written during the event window; open-source libraries are allowed with attribution. The Phase-1 screening asks for an idea and optional prototype/deck, but the eventual on-site build must comply with the event's build-window rules. citeturn0search0
