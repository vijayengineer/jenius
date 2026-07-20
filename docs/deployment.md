# Production deployment

These are manual operator steps. This repository does not install services, change Nginx, create
DNS records, push Git commits, or deploy automatically.

## 1. Firebase and Firestore

Create or select the production Firebase/Google Cloud project, enable billing if the selected
plan requires it, and replace the angle-bracket placeholders below. In Google Cloud Shell:

```bash
gcloud config set project <PROJECT_ID>
gcloud services enable firestore.googleapis.com iam.googleapis.com
gcloud firestore databases create \
  --database='(default)' \
  --location='<FIRESTORE_LOCATION>' \
  --type=firestore-native
gcloud iam service-accounts create jenius-api \
  --display-name='Jenius API'
gcloud projects add-iam-policy-binding <PROJECT_ID> \
  --member='serviceAccount:jenius-api@<PROJECT_ID>.iam.gserviceaccount.com' \
  --role='roles/datastore.user'
```

Skip the database-create command if `(default)` already exists. `roles/datastore.user` is the
standard read/write data role; do not grant Owner or Editor. The application itself uses only
`explanation_cache`, `generated_concepts`, and `usage_limits`.

Prefer keyless Application Default Credentials or Workload Identity Federation when the host
supports it. If this standalone Ubuntu host must use a JSON key, create it from an administrative
machine, transfer it over SSH, and remove the transfer copies:

```bash
umask 077
gcloud iam service-accounts keys create ./jenius-api-key.json \
  --iam-account='jenius-api@<PROJECT_ID>.iam.gserviceaccount.com'
scp ./jenius-api-key.json <UBUNTU_ADMIN>@<BACKEND_IP>:/tmp/jenius-api-key.json
shred -u ./jenius-api-key.json
```

On Ubuntu:

```bash
sudo install -d -m 0750 -o root -g rndm_jenius /etc/jenius
sudo install -m 0600 -o rndm_jenius -g rndm_jenius \
  /tmp/jenius-api-key.json /etc/jenius/firebase-service-account.json
rm -f /tmp/jenius-api-key.json
```

Set `FIREBASE_SERVICE_ACCOUNT_FILE=/etc/jenius/firebase-service-account.json`. For keyless ADC,
leave that variable empty and configure the host's ADC mechanism instead. Set
`FIRESTORE_DATABASE_ID=(default)` unless a named database was intentionally created. No Firebase
web configuration or permissive Firestore client rules are required.

No client Firebase configuration or Firestore web rules are needed because the browser never
talks to Firestore.

## 2. Ubuntu backend

Install Node.js 22, Git, Nginx, and Certbot tooling on a supported Ubuntu host:

```bash
sudo apt update
sudo apt install -y ca-certificates curl git nginx snapd
curl -fsSL https://deb.nodesource.com/setup_22.x -o /tmp/nodesource_setup.sh
sudo -E bash /tmp/nodesource_setup.sh
rm -f /tmp/nodesource_setup.sh
sudo apt install -y nodejs
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/local/bin/certbot
node --version
npm --version
```

Deploy a reviewed release commit without rewriting history, then install and verify the server as
the non-root application user:

```bash
sudo adduser --disabled-password --gecos '' rndm_jenius
sudo -u rndm_jenius git clone <CANONICAL_REPOSITORY_URL> /home/rndm_jenius/jenius
sudo -u rndm_jenius git -C /home/rndm_jenius/jenius fetch origin
sudo -u rndm_jenius git -C /home/rndm_jenius/jenius checkout --detach <RELEASE_COMMIT>
sudo -u rndm_jenius npm --prefix /home/rndm_jenius/jenius/server ci
sudo -u rndm_jenius npm --prefix /home/rndm_jenius/jenius/server run test
sudo -u rndm_jenius npm --prefix /home/rndm_jenius/jenius/server run typecheck
sudo -u rndm_jenius npm --prefix /home/rndm_jenius/jenius/server run build
```

Create `/etc/jenius/jenius-api.env` outside Git, readable only by the service user:

```bash
sudo install -m 0600 -o rndm_jenius -g rndm_jenius /dev/null /etc/jenius/jenius-api.env
sudoedit /etc/jenius/jenius-api.env
```

```dotenv
NODE_ENV=production
HOST=127.0.0.1
PORT=301
FRONTEND_ORIGINS=https://jenius.vercel.app,https://jns.fun
TRUST_PROXY=true
OPENAI_API_KEY=replace-at-deploy-time
OPENAI_MODEL=gpt-5.6
OPENAI_TIMEOUT_MS=30000
OPENAI_MAX_RETRIES=1
FIREBASE_SERVICE_ACCOUNT_FILE=/etc/jenius/firebase-service-account.json
FIRESTORE_DATABASE_ID=(default)
USAGE_HASH_SALT=replace-with-at-least-32-random-characters
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
User=rndm_jenius
Group=rndm_jenius
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
sudo systemd-analyze verify /etc/systemd/system/jenius-api.service
sudo systemctl daemon-reload
sudo systemctl enable --now jenius-api
sudo systemctl status jenius-api
curl --fail http://127.0.0.1:301/health
```

The repository itself does not run these commands.

## 3. Nginx and HTTPS

Create an operator-reviewed HTTP server block for `api.jns.fun`. It must be reachable on port 80
for the initial ACME HTTP challenge:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name api.jns.fun;

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

Save it as `/etc/nginx/sites-available/jenius-api`, enable it, and validate it:

```bash
sudo ln -s /etc/nginx/sites-available/jenius-api /etc/nginx/sites-enabled/jenius-api
sudo nginx -t
sudo systemctl reload nginx
sudo ufw allow 'Nginx Full'
```

At the authoritative DNS provider, create `api.jns.fun A <BACKEND_IPV4>` and add an `AAAA` record
only when the host has working public IPv6. Do not publish a record for port 301. Verify
propagation, issue the certificate, force the redirect to HTTPS, and test renewal:

```bash
dig +short api.jns.fun A
curl --fail http://api.jns.fun/health
sudo certbot --nginx --redirect -d api.jns.fun
sudo certbot renew --dry-run
sudo nginx -t
sudo systemctl reload nginx
```

Certbot adds the reviewed TLS listener and certificate paths to this server block. Keep ports
80/443 public for HTTP redirect and HTTPS; keep 301 blocked externally because Fastify binds only
to `127.0.0.1`.

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

Before uploading, `npm run build && npm run preview` serves the generated `.vercel/output` locally
through Nitro for route and PWA-asset smoke checks.

For a CLI-assisted domain check after the project is linked:

```bash
vercel domains add jns.fun <VERCEL_PROJECT_NAME>
vercel domains inspect jns.fun
vercel certs ls
```

If DNS is hosted outside Vercel, create exactly the `A`, `CNAME`, and verification records printed
by `vercel domains inspect`; do not copy generic record values from another project. Vercel
provisions the frontend certificate after DNS verification. Finally update backend
`FRONTEND_ORIGINS` with both `https://<VERCEL_PROJECT>.vercel.app` and `https://jns.fun`, then
restart `jenius-api`.

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
