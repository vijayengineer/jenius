# Production deployment

These are manual operator steps. This repository does not install services, change Nginx, create
DNS records, push Git commits, or deploy automatically.

## 1. Firebase and Firestore

1. Create or select the production Firebase/Google Cloud project in the provider console.
2. Create a Firestore database in Native mode. Record its database ID; use `(default)` unless a
   named database was intentionally created.
3. Create a dedicated server service account with only the Firestore data access needed for
   `explanation_cache`, `generated_concepts`, and `usage_limits`.
4. Prefer Application Default Credentials on a managed Google environment. On Ubuntu, if a JSON
   key is required, place it outside the repository, for example
   `/etc/jenius/firebase-service-account.json`, owned by the service user and mode `0600`.
5. Set either `FIREBASE_SERVICE_ACCOUNT_FILE=/etc/jenius/firebase-service-account.json`, or leave
   it empty and set `GOOGLE_APPLICATION_CREDENTIALS` for Application Default Credentials.
6. Set `FIRESTORE_DATABASE_ID=(default)` or the exact named database ID.

No client Firebase configuration or Firestore web rules are needed because the browser never
talks to Firestore.

## 2. Ubuntu backend

Install Node.js 22 LTS, npm, Git, Nginx, and the host's normal TLS tooling. As a non-root
application user:

```bash
cd /home/rndm_jenius/jenius/server
npm ci
npm run test
npm run typecheck
npm run build
```

Create `/etc/jenius/jenius-api.env` outside Git, readable only by the service user:

```dotenv
NODE_ENV=production
HOST=127.0.0.1
PORT=301
FRONTEND_ORIGINS=https://jenius.vercel.app,https://jns.fun
TRUST_PROXY=true
OPENAI_API_KEY=replace-at-deploy-time
OPENAI_MODEL=replace-with-approved-model-id
OPENAI_TIMEOUT_MS=30000
OPENAI_MAX_RETRIES=1
FIREBASE_SERVICE_ACCOUNT_FILE=/etc/jenius/firebase-service-account.json
FIRESTORE_DATABASE_ID=(default)
USAGE_HASH_SALT=replace-with-a-long-random-value
DAILY_EXPLAIN_LIMIT=20
DAILY_GENERATE_LIMIT=5
EXPLANATION_PROMPT_VERSION=v1
GENERATION_PROMPT_VERSION=v1
```

Example `/etc/systemd/system/jenius-api.service`:

```ini
[Unit]
Description=Jenius API
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=jenius
Group=jenius
WorkingDirectory=/home/rndm_jenius/jenius/server
Environment=NODE_ENV=production
EnvironmentFile=/etc/jenius/jenius-api.env
ExecStart=/usr/bin/node /home/rndm_jenius/jenius/server/dist/server/src/index.js
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
AmbientCapabilities=CAP_NET_BIND_SERVICE
CapabilityBoundingSet=CAP_NET_BIND_SERVICE

[Install]
WantedBy=multi-user.target
```

Port 301 is a privileged Linux port because it is below 1024. The two capability lines allow this
non-root service to bind that port without granting other root privileges. If the operator changes
both the service and Nginx to an unprivileged port such as 3001, remove those capability lines.

After reviewing paths and ownership, an operator can run:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now jenius-api
sudo systemctl status jenius-api
curl --fail http://127.0.0.1:301/health
```

The repository itself does not run these commands.

## 3. Nginx and HTTPS

Create an operator-reviewed server block for `api.jns.fun`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name api.jns.fun;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.jns.fun;

    ssl_certificate /etc/letsencrypt/live/api.jns.fun/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.jns.fun/privkey.pem;

    client_max_body_size 16k;

    location / {
        proxy_pass http://127.0.0.1:301;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 5s;
        proxy_send_timeout 40s;
        proxy_read_timeout 40s;
    }
}
```

Create an `A`/`AAAA` record for `api.jns.fun` pointing to the Ubuntu host, wait for DNS, validate
with `nginx -t`, obtain a certificate using the host's approved ACME/Certbot flow, then reload
Nginx. Do not expose port 301 publicly; firewall access should be through 80/443 only.

Check:

```bash
curl --fail https://api.jns.fun/health
curl -i -X OPTIONS https://api.jns.fun/api/generate \
  -H 'Origin: https://jns.fun' \
  -H 'Access-Control-Request-Method: POST'
```

Health output must contain readiness booleans but no credentials, paths, project IDs, or host
details.

## 4. Vercel frontend

1. Import the canonical `origin` repository into Vercel and select the intended branch.
2. Keep the project root at the repository root.
3. Select Node.js 22.x.
4. Use install command `npm ci` and build command `npm run build`.
5. Do not override the output directory. Nitro writes the Vercel Build Output API bundle to
   `.vercel/output`, including the SSR catch-all and static PWA assets.
6. Add `VITE_API_BASE_URL=https://api.jns.fun` to Preview and Production before building.
7. Add the frontend domains Vercel assigns to `FRONTEND_ORIGINS`, then restart the backend.
8. Add `jns.fun` in Vercel Domains and create exactly the DNS records Vercel displays. Wait for
   Vercel's HTTPS certificate to become active.
9. Open `/`, `/saved`, `/create`, `/me`, `/manifest.webmanifest`, and `/sw.js` over HTTPS.

TanStack/Nitro handles application routing; no blanket SPA rewrite is added. The manifest, service
worker, icons, and API base URL are all part of the production build.

## Operations and rollback

View backend logs without exposing environment values:

```bash
journalctl -u jenius-api --since today
```

Use `/health` for uptime checks. A degraded response means the HTTP service is alive but model,
usage, or Firestore readiness is incomplete.

For rollback, select a known-good commit without rewriting shared history, run `npm ci` and
`npm run build` in `server/`, then restart the service. Prefer a normal revert commit for permanent
source rollback. In Vercel, promote a known-good previous deployment or redeploy the known-good
commit. Recheck health, CORS, Create, Explain another way, and offline bundled lessons.
