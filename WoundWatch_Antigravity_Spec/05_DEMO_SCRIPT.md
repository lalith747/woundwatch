# WoundWatch AI — 90 Second Demo Script

## 0–10 sec — Problem

"People often photograph recovery changes inconsistently and rely on memory to understand whether something is changing. WoundWatch turns that into a structured phone-first observation workflow."

Show Home.

## 10–25 sec — Camera

"First, the user captures today's observation directly from the phone."

Open New Check → Camera/Demo.

## 25–40 sec — Context

"They can add pain, symptoms and a voice note."

Set pain to 3 and select No new symptoms.

## 40–55 sec — Analysis

"The prototype extracts a lightweight visual signal locally and combines it with the user's reported context."

Tap Analyze.

Show:
- visual signal;
- trend;
- pain;
- safety prompt.

## 55–68 sec — Timeline

"Every check becomes a longitudinal record rather than a one-off chatbot conversation."

Save → Timeline.

## 68–82 sec — CareGuide

Ask:
"Can a phone image confirm infection?"

Show safe answer.

## 82–90 sec — Close

"We deliberately don't diagnose. WoundWatch focuses on observable change, symptom context and clear safety guidance — turning the phone into a recovery observation companion."

---

# Judge questions

### Q: Is this diagnosing infection?
A:
"No. The prototype explicitly avoids that. The visual component is an observable signal, and the symptom layer produces safety prompts rather than diagnoses."

### Q: Why not just use ChatGPT?
A:
"ChatGPT can answer a health question, but WoundWatch is a workflow: capture → contextualize → compare over time → explain → track. The phone camera and longitudinal timeline are core product features."

### Q: What is AI about it?
A:
"The prototype has a local observation engine and an abstraction layer designed to accept a local vision model and local LLM during the city battle. We intentionally made the MVP API-free and reliable first."

### Q: What makes it phone-first?
A:
"The camera, voice interaction and local image processing are central to the user journey. The product still works when the user has no laptop."

### Q: What's next?
A:
"During the city battle we would replace the prototype observation engine with a small open-source vision model running locally, add stronger longitudinal image alignment, and use a local LLM for CareGuide."
