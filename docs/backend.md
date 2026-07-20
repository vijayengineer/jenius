# Optional backend

## Service boundary

`server/` is a standalone strict-TypeScript Node service. It uses Fastify, Zod, Firebase Admin,
and the official OpenAI Node SDK. The frontend can run without it.

Public routes are deliberately limited to:

- `GET /health`
- `POST /api/explain`
- `POST /api/generate`

The server binds to `127.0.0.1` by default. It applies a 16 KiB body limit, configurable CORS
allowlist, security headers, safe request IDs and errors, controlled OpenAI timeout/retries,
redacted logging, clean shutdown, and explicit proxy trust. Production CORS rejects `*`.

## Local development

Use Node.js 22.12 or newer:

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

The committed example contains placeholders only. In development and test, credentials may remain
absent: `/health` reports a degraded configuration and AI routes return a controlled
`not_configured` error. Production deliberately fails startup with variable names (never values)
when `FRONTEND_ORIGINS`, `OPENAI_API_KEY`, `OPENAI_MODEL`, or `USAGE_HASH_SALT` is missing. The
production usage salt must contain at least 32 characters.

On Linux and other systems that reserve ports below 1024, use an unprivileged local override such
as `PORT=3001` and point the frontend to `http://localhost:3001`. Production keeps the requested
port 301 and grants only the bind capability in systemd; do not run the Node process as root.

The frontend uses:

```dotenv
VITE_API_BASE_URL=http://localhost:301
```

This value is public routing configuration, never a credential.

## Environment reference

| Variable                        | Purpose                                                                             |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| `NODE_ENV`                      | `development`, `test`, or `production`.                                             |
| `HOST`, `PORT`                  | Bind address and port; production defaults are `127.0.0.1:301`.                     |
| `FRONTEND_ORIGINS`              | Comma-separated exact origins, with no paths or trailing slashes.                   |
| `TRUST_PROXY`                   | Set `true` only behind the local trusted Nginx proxy.                               |
| `OPENAI_API_KEY`                | Server-only OpenAI credential.                                                      |
| `OPENAI_MODEL`                  | Configurable structured-output-capable model, such as an approved GPT-5.6 model ID. |
| `OPENAI_TIMEOUT_MS`             | Per-call SDK timeout; default `30000`.                                              |
| `OPENAI_MAX_RETRIES`            | SDK retry count; default `1`.                                                       |
| `FIREBASE_SERVICE_ACCOUNT_FILE` | Optional absolute JSON credential path outside Git.                                 |
| `FIRESTORE_DATABASE_ID`         | Firestore database name; default `(default)`.                                       |
| `USAGE_HASH_SALT`               | Long random server-only salt for one-way request fingerprints.                      |
| `DAILY_EXPLAIN_LIMIT`           | Daily explanation generations per fingerprint. Cache hits do not consume it.        |
| `DAILY_GENERATE_LIMIT`          | Daily personal lesson generations per fingerprint.                                  |
| `EXPLANATION_PROMPT_VERSION`    | Cache-breaking explanation prompt version.                                          |
| `GENERATION_PROMPT_VERSION`     | Generated-concept provenance version.                                               |

`USAGE_HASH_SALT` must be stable across restarts. Changing it resets effective anonymous usage
identity. Fingerprints combine the salt, request IP, and user agent and never store the raw IP.
This is lightweight abuse resistance, not an account or identity system.

Firebase credentials are intentionally not part of the production startup assertion because
Application Default Credentials may be supplied by the host. If neither ADC nor
`FIREBASE_SERVICE_ACCOUNT_FILE` works, the HTTP server keeps `/health` available with
`firestore.ready=false` and both AI routes fail safely.

## Structured model behavior

Prompts live in `server/src/prompts/` and are never accepted from the browser. Explanation
requests resolve only against the verified server catalogue projection. The model must return a
strict explanation object, which Zod validates before caching or returning.

Generation treats the topic as untrusted data, rejects obvious prompt injection and a small set of
unsupported unsafe requests, requests one complete structured lesson, and validates all content.
The primary question must have four options, one correct answer, and three mapped misconceptions.
If validation fails, the service makes one repair request and validates again. A second failure is
a controlled error; malformed partial data is never returned as success.

Full prompts and model responses are not logged by default.

## Firestore

Only these collections are used:

- `explanation_cache`
- `generated_concepts`
- `usage_limits`

Explanation keys hash concept, style, safe context fingerprint, prompt version, and model. Records
carry a 30-day application-enforced expiry timestamp and cache policy metadata. Usage counters are
updated transactionally.

Normal tests inject memory repositories and model stubs and make no network calls:

```bash
npm run server:test
npm run server:typecheck
npm run server:build
```
