# Jenius

> **An AI teacher that turns endless scrolling into endless learning.**

Jenius is an offline-first, mobile-first learning app built around a simple idea: learning should begin with curiosity, not a course.

Instead of asking learners to create a profile, choose a subject, or commit to a curriculum, Jenius starts teaching immediately through a vertical feed of short visual lessons. It gradually learns from what each learner explores, understands, misunderstands, saves, and asks about, then uses those signals to personalise what comes next.

- **Live app:** [jns.fun](https://jns.fun)
- **Demo video:** Add YouTube link
- **Built for:** OpenAI Build Week

---

## What Jenius does

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

OpenAI is used where flexibility adds value:

- alternative explanations
- personalised coaching
- generating new lessons from a learner’s curiosity

This keeps the core learning journey reliable while allowing explanations and new content to remain adaptive.

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

This lets the application respond to the learner’s reasoning rather than simply displaying the correct answer.

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

The server owns all OpenAI and Firestore access. No OpenAI or Firestore SDK is shipped to the browser.

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

## Built with GPT-5.6 and OpenAI Codex

GPT-5.6 in OpenAI Codex was used as the primary engineering collaborator throughout development.

Focused Codex sessions helped implement:

- the content schema and initial lesson catalogue
- the deterministic learning reducer
- misconception-aware feedback
- IndexedDB persistence
- the Fastify and Firestore backend
- OpenAI explanation and generation routes
- mobile and PWA refinements
- the production motion engine
- media trimming and verification with FFmpeg
- automated tests and release validation
- architecture and deployment documentation

Codex enabled rapid iteration across the full stack while preserving typed contracts, deterministic behaviour, logical commits, and comprehensive verification.

The product was not produced through a single prompt. It was developed through focused implementation, testing, inspection, correction, and release-verification sessions.

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
- OpenAI API
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
- Let’s Encrypt
- GitHub

---

## Local development

### Requirements

- Node.js 22.12 or later
- npm
- FFmpeg when regenerating motion assets
- optional OpenAI and Google Cloud credentials for AI features

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

The production release passed:

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

---

## Current limitations

- Learning state is local to the current device.
- There is no account-based cross-device synchronisation yet.
- The production catalogue currently contains ten curated lessons.
- AI-generated lessons are treated as personal drafts rather than verified catalogue content.
- The **For You** experience will become richer as more content and interaction signals are added.

---

## What’s next

The next stage is to make Jenius truly infinite and increasingly personal through:

- richer long-term understanding graphs
- personalised review and spaced repetition
- multilingual lessons
- voice-led learning
- broader scientific, historical, mathematical, and cultural subjects
- account-based cross-device synchronisation
- teacher and classroom tools
- partnerships with schools, universities, and coaching organisations

> **The long-term vision is an AI teacher that learns how you learn—and always has something meaningful to teach next.**

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

Built by [Vijay](https://github.com/vijayengineer) for OpenAI Build Week.
