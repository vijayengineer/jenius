# Jenius

> **An open, mobile-first adaptive AI teacher that learns what you understand and continuously chooses what to teach next.**

Jenius is an offline-first, mobile-first learning app built around a simple idea: learning should begin with curiosity, not a course.

Instead of asking learners to create a profile, choose a subject, or commit to a fixed curriculum, Jenius starts teaching immediately through a vertical feed of short visual lessons. It learns from what each learner explores, understands, misunderstands, saves, and asks about, then uses those signals to personalise what comes next.

The current product already implements the learning experience: short-form visual lessons, interactive challenges, misconception-aware feedback, locally persisted learner state, AI-generated explanations, and offline PWA support.

The next stage is to open the adaptive teacher layer behind Jenius: learner modelling, concept graphs, sequencing, model-neutral inference, and learning evaluation.

- **Live app:** [jns.fun]()
- **Repository:** [github.com/vijayengineer/jenius](https://github.com/vijayengineer/jenius)
- **Demo video:** https://youtube.com/shorts/g0PXFOk-vBs
- **Status:** Working public PWA / open-source project

---

## From learning feed to adaptive teacher

Jenius is designed to move beyond static educational content.

A traditional learning feed asks:

> What should the learner watch next?

Jenius asks:

> **What should this learner understand next?**

The adaptive loop is:

```text
Concept
  ↓
Explain
  ↓
Challenge
  ↓
Learner response
  ↓
Update understanding
  ↓
Detect misconception or mastery
  ↓
Choose the next best concept
  ↺
```

Every interaction can update the learner model so that future explanations, challenges, reviews, and concepts become increasingly relevant to the individual learner.

The goal is not to optimise for watch time.

> **The feed should optimise for understanding.**

---

## What Jenius does today

Every lesson follows a compact learning loop:

```text
Curiosity
→ Cinematic explanation
→ Four-option challenge
→ Misconception-aware feedback
→ Retry and understanding
→ Mind Blown fact
→ Next idea
```

Jenius includes:

- a mixed-subject **Discover** feed
- an adaptive **For You** experience
- concise visual explanations
- interactive knowledge checks
- feedback matched to specific misconceptions
- alternative AI-generated explanations
- locally persisted progress and saved lessons
- a **Teach me anything** lesson generator
- offline access through an installable Progressive Web App

No account is required. Learner progress and understanding are stored locally using IndexedDB.

---

## What we are opening next

The next phase is to extract the adaptive-teaching layer from Jenius into reusable, model-neutral open infrastructure.

### Learning graph

A common representation for:

- concepts
- prerequisites
- difficulty
- mastery
- related concepts
- common misconceptions
- review dependencies

### Learner state

A portable representation of what a learner currently understands, including:

- mastery
- confidence
- recent attempts
- misconception history
- review history
- retention signals
- concepts that may need reinforcement

### Adaptive sequencing

A deterministic and model-assisted engine that decides:

> **What should this learner see next?**

The sequencing layer can select:

- the next concept
- a missing prerequisite
- a review item
- a simpler explanation
- a harder challenge
- a misconception-specific retry

### Model-neutral teaching interface

Jenius should not depend on a single model provider.

The teacher layer will define interfaces that allow:

- open-weight models
- locally hosted models
- commercial model APIs
- specialised educational models

to generate explanations, analogies, challenges, examples, and coaching while preserving the same learner state and learning flow.

### Learning evaluation

The open evaluation layer will measure whether the system is actually improving learning, including:

- concept mastery
- first-attempt vs retry performance
- misconception correction
- delayed recall
- retention
- progression through prerequisite graphs

---

## Why this should be open

Frontier models can explain almost any subject, but an effective teacher needs more than generation.

A useful tutoring system must know:

- what the learner already understands
- where their reasoning is breaking
- which prerequisite is missing
- when to review a concept
- when to increase difficulty
- what should be taught next

Without shared open infrastructure, educational builders repeatedly recreate learner models, sequencing logic, misconception handling, and evaluation systems—or depend on proprietary tutoring platforms.

Jenius aims to make that adaptive-teaching layer reusable.

The long-term goal is for educators, developers, and communities to be able to adapt the system to:

- new subjects
- local curricula
- new languages
- accessibility requirements
- different model providers
- low-cost and offline-first deployments

Jenius remains the reference application demonstrating the teacher through a mobile-first infinite learning feed.

---

## Production learning catalogue

The current release contains ten fully produced concepts across Biology, Physics, Geography, Health, and Earth Science:

1. Why do volcanoes erupt?
2. Why do seasons exist?
3. What is DNA?
4. Why do planes fly?
5. Do heavier objects fall faster?
6. Why do deserts form?
7. Why is the sky blue?
8. Why do leaves change colour?
9. How do vaccines train the immune system?
10. Why do humans yawn?

The catalogue includes:

- **10** production concept cinematics
- **20** knowledge-check questions
- **30** misconception branches
- **5** reusable interface-motion assets
- video and poster fallbacks for every production lesson

---

## How learning works

Jenius deliberately separates deterministic learning logic from generative AI.

The application controls:

- progression
- questions and answers
- attempts
- scoring
- misconception selection
- completion
- experience points
- saved lessons
- review history
- understanding signals

AI is used where flexibility adds value:

- alternative explanations
- personalised coaching
- generating new lessons from a learner's curiosity
- adapting explanations to learner state
- generating examples and analogies
- supporting future adaptive sequencing

This separation keeps the core learning journey reliable while allowing explanations and new content to remain flexible and model-neutral.

---

## Misconception-aware feedback

A wrong answer should reveal more than whether the learner was correct.

Every plausible incorrect answer references a named misconception. Jenius can then respond with:

```text
Why that answer feels reasonable
→ where the reasoning breaks
→ what is actually happening
→ another opportunity to try
```

This lets the application respond to the learner's reasoning rather than simply displaying the correct answer.

In the adaptive-teacher version of Jenius, misconception history becomes part of persistent learner state and can influence what the learner sees next.

---

## Architecture

The frontend is built with **TanStack Start, React, TypeScript, and Zod**.

A pure reducer owns the verified learning flow, while a versioned IndexedDB repository stores:

- learner progress
- saved lessons
- attempts
- generated concepts
- topic requests
- understanding signals
- review scheduling

The standalone Fastify service under `server/` exposes:

```text
GET  /health
POST /api/explain
POST /api/generate
```

The server owns all model-provider and Firestore access. No provider credentials or Firestore SDK are shipped to the browser.

Firestore is used for:

- validated explanation caching
- generated concept storage
- lightweight daily usage limits

The frontend is deployed on Vercel. The API runs on Google Cloud behind Nginx and HTTPS.

More detail is available in:

- [Architecture](docs/architecture.md)
- [Backend](docs/backend.md)
- [Content model](docs/content-model.md)
- [Motion system](docs/motion.md)
- [Mobile testing](docs/mobile-testing.md)

---

## Adaptive teacher architecture

The next architecture layer builds on the current product:

```text
Learner interaction
        ↓
Learner state
        ↓
Concept + prerequisite graph
        ↓
Adaptive sequencing
        ↓
Model-neutral teacher interface
        ↓
Explanation / challenge / review
        ↓
Learning evaluation
        ↺
```

The current PWA remains the reference interface while the teacher layer becomes reusable infrastructure.

---

## Motion system

Jenius uses a custom motion engine rather than placing unrelated videos throughout the interface.

A central manifest controls:

- trim and loop windows
- transition timing
- crossfades
- lazy loading
- poster generation
- visibility-aware playback
- player disposal
- reduced-motion behaviour

Concept cinematics act as educational content, while curiosity, misunderstanding, success, and completion animations act as short interface transitions.

Immutable source videos are processed into runtime assets and poster frames using FFmpeg.

---

## Built with

### Frontend

- TanStack Start
- React
- TypeScript
- Vite
- Zod
- IndexedDB
- Progressive Web App APIs
- HTML5 Video
- CSS

### Backend

- Node.js
- Fastify
- model-provider APIs
- Google Cloud Firestore

### Media and motion

- FFmpeg
- HTML5 Video
- custom motion controller
- generated poster fallbacks

### Testing and quality

- Vitest
- TypeScript
- ESLint
- content-schema validation
- motion-asset validation
- frontend and server production builds

### Deployment

- Vercel
- Google Cloud
- Nginx
- Let's Encrypt
- GitHub

---

## Local development

### Requirements

- Node.js 22.12 or later
- npm
- FFmpeg when regenerating motion assets
- optional model-provider and Google Cloud credentials for AI features

### Frontend

```bash
git clone https://github.com/vijayengineer/jenius.git
cd jenius

npm install
cp .env.example .env.local
npm run dev
```

`VITE_API_BASE_URL` is optional. If it is missing or unavailable, bundled lessons and previously stored learner progress remain usable.

### Backend

Open a second terminal:

```bash
cd jenius/server

npm install
cp .env.example .env
npm run dev
```

Never commit:

- API keys
- service-account credentials
- usage salts
- copied environment files

Production requires valid values for the environment variables documented in the checked-in `.env.example` files.

---

## Verification

Run the complete release suite:

```bash
npm run verify
```

Individual checks include:

```bash
npm run validate-content
npm run report-content
npm run motion:verify
npm run test
npm run typecheck
npm run lint
npm run build
npm run server:test
npm run server:typecheck
npm run server:build
```

The current production release passed:

- **124 frontend tests**
- **33 server tests**
- validation for all 10 concepts
- complete motion-asset verification
- frontend and server typechecks
- lint with zero errors
- frontend and server production builds
- full release verification

---

## Offline-first behaviour

The application shell and verified lesson catalogue remain available offline after the initial load.

IndexedDB preserves:

- progress
- saved lessons
- attempts
- understanding
- reviews
- generated lessons
- topic requests

Internet access is required for:

- uncached AI explanations
- generating new lessons
- other uncached server interactions

A longer-term goal is to support increasingly capable local and open-weight models so more of the teacher can operate without continuous cloud connectivity.

---

## Installing the PWA

### iPhone

1. Open [jns.fun](https://jns.fun) in Safari.
2. Tap **Share**.
3. Select **Add to Home Screen**.
4. Tap **Add**.

### Android

1. Open [jns.fun](https://jns.fun) in Chrome.
2. Open the Chrome menu.
3. Select **Install app** or **Add to Home screen**.

---

## Privacy and accounts

Jenius does not require an account for the current experience.

Learner progress and inferred understanding are stored locally in the browser using IndexedDB.

This means:

- learners can begin immediately
- no onboarding profile is required
- progress remains private to the current device
- clearing browser storage removes local progress
- progress does not yet synchronise between devices

The adaptive-teacher architecture is designed to preserve this local-first approach wherever possible.

---

## Current limitations

- Learning state is local to the current device.
- There is no account-based cross-device synchronisation yet.
- The production catalogue currently contains ten curated lessons.
- AI-generated lessons are treated as personal drafts rather than verified catalogue content.
- The **For You** experience will become richer as more content and interaction signals are added.
- The current system does not yet maintain a complete long-term concept graph across arbitrary subjects.
- Adaptive sequencing and formal learning-gain evaluation are the next major development stage.

---

## Three-month open adaptive teacher roadmap

### Month 1 — Open the teacher core

- learning graph schema
- learner-state schema
- model-neutral teacher interface
- public documentation
- initial open-source runtime

### Month 2 — Make the feed adaptive

- sequencing engine
- prerequisite-aware progression
- misconception-driven reteaching
- personalised review
- spaced repetition
- second model-provider integration

### Month 3 — Measure learning

- two complete reference curricula
- public Jenius adaptive-teacher release
- learning evaluation toolkit
- pre/post learning assessment
- delayed recall measurement
- public documentation and reference implementation

The goal is not simply to generate more educational content.

> **The goal is to measure whether learners understand more because the teacher adapted.**

---

## What’s next

Beyond the initial adaptive-teacher release, Jenius can expand through:

- richer long-term understanding graphs
- multilingual lessons
- voice-led learning
- broader scientific, historical, mathematical, financial, and cultural subjects
- local and open-weight inference
- account-based cross-device synchronisation
- teacher and classroom tools
- educator-created learning graphs
- partnerships with schools, universities, and coaching organisations

> **The long-term vision is an AI teacher that learns how you learn—and always has something meaningful to teach next.**

---

## Project history — OpenAI Build Week 2026

Jenius originated during OpenAI Build Week as an experiment in turning short-form mobile interaction into a learning experience.

GPT-5.6 in OpenAI Codex was used as the primary engineering collaborator during the original build.

Focused Codex sessions helped implement:

- the content schema and initial lesson catalogue
- the deterministic learning reducer
- misconception-aware feedback
- IndexedDB persistence
- the Fastify and Firestore backend
- AI explanation and generation routes
- mobile and PWA refinements
- the production motion engine
- media trimming and verification with FFmpeg
- automated tests and release validation
- architecture and deployment documentation

The product was not produced through a single prompt. It was developed through focused implementation, testing, inspection, correction, and release-verification sessions.

Build Week established the working product experience.

The next phase is to turn the adaptive intelligence behind that experience into reusable open infrastructure.

---

## Documentation

- [Architecture](docs/architecture.md)
- [Backend](docs/backend.md)
- [Content model](docs/content-model.md)
- [Motion system](docs/motion.md)
- [Mobile testing](docs/mobile-testing.md)
- [Build Week notes](docs/build-week.md)

---

## Author

Built by [Vijay](https://github.com/vijayengineer).

Jenius began during OpenAI Build Week 2026 and is now being developed into an open adaptive AI teacher.
