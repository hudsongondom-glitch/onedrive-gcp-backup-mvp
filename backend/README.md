# OneDrive Backup MVP — Backend

Node.js + Express service that backs up selected OneDrive folders into Google Cloud Storage,
storing metadata in Firestore. Deploys to Cloud Run.

## Folder structure

```
backend/
├── Dockerfile
├── .dockerignore
├── .env.example
├── package.json
└── src/
    ├── app.js              # Express app: middleware + route mounting
    ├── server.js           # Entry point — starts the HTTP server
    ├── config/
    │   ├── env.js          # General env vars (port, URLs)
    │   ├── microsoftGraph.js
    │   ├── firestore.js
    │   └── storage.js
    ├── routes/
    │   ├── health.js
    │   ├── auth.js
    │   ├── onedrive.js
    │   ├── backup.js
    │   └── restore.js
    ├── services/
    │   ├── AuthService.js
    │   ├── GraphService.js
    │   ├── BackupService.js
    │   ├── StorageService.js
    │   └── FirestoreService.js
    └── middleware/
        ├── authMiddleware.js
        └── errorHandler.js
```

## Setup

1. Copy the env template and fill in values:
   ```
   cp .env.example .env
   ```
   - `MS_CLIENT_ID` / `MS_CLIENT_SECRET` — from your Azure AD app registration
   - `MS_REDIRECT_URI` — must match the redirect URI configured in Azure AD
   - `GCS_BUCKET_NAME` — defaults to `onedrive-backup-mvp-storage-hudsong`
   - `GOOGLE_APPLICATION_CREDENTIALS` — path to a service account key JSON (local dev only;
     on Cloud Run the attached runtime service account is used instead)

2. Install dependencies:
   ```
   npm install
   ```

3. Run locally:
   ```
   npm run dev
   ```
   Server starts on `http://localhost:8080` (or `PORT` from `.env`).

4. Check health:
   ```
   curl http://localhost:8080/health
   ```

## Routes (placeholders — return 501 until implemented)

| Method | Path                          | Purpose                       |
|--------|-------------------------------|-------------------------------|
| GET    | /health                       | Liveness check                |
| GET    | /auth/microsoft/login         | Start Microsoft OAuth flow    |
| GET    | /auth/microsoft/callback      | OAuth redirect/code exchange  |
| GET    | /onedrive/folders             | List OneDrive folders         |
| GET    | /onedrive/files               | List files in a folder        |
| POST   | /backup/start                 | Trigger a manual backup       |
| GET    | /backup/history               | List past backups             |
| GET    | /restore/:backupId            | Restore/download a backup     |

## Docker

```
docker build -t onedrive-backup-backend .
docker run -p 8080:8080 --env-file .env onedrive-backup-backend
```

## Deploying to Cloud Run

```
gcloud run deploy onedrive-backup-backend \
  --source . \
  --region <YOUR_REGION> \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,GCS_BUCKET_NAME=onedrive-backup-mvp-storage-hudsong
```

Cloud Run provides credentials for Firestore/Cloud Storage via its attached service account —
make sure that account has `roles/datastore.user` and `roles/storage.objectAdmin` on the bucket.
