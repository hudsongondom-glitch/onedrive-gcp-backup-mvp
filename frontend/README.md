# OneDrive Backup MVP — Frontend

React (Vite) MVP frontend for the OneDrive → Google Cloud Storage backup project.

## Folder structure

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
└── src/
    ├── main.jsx            # React entry point + router setup
    ├── App.jsx             # Routes, nav bar, session guard
    ├── styles.css          # Plain CSS, no UI framework
    ├── api/
    │   └── client.js       # fetch wrapper, sessionId helpers (localStorage)
    └── pages/
        ├── LoginPage.jsx
        ├── DashboardPage.jsx
        ├── BackupPage.jsx
        ├── HistoryPage.jsx
        └── RestorePage.jsx
```

## Setup

```
cp .env.example .env
npm install
npm run dev
```

App runs at `http://localhost:3000` and talks to the backend at `VITE_API_BASE_URL`
(defaults to `http://localhost:8080`).

## Auth flow (MVP)

The backend's `/auth/microsoft/callback` currently returns JSON `{ sessionId, profile }`
rather than redirecting back to the frontend. So for this MVP:

1. Click **Login with Microsoft** on the Login page (redirects to the backend, which
   redirects to Microsoft).
2. After completing sign-in, copy the `sessionId` from the JSON response.
3. Paste it into the **Save session & continue** field on the Login page.

The `sessionId` is stored in `localStorage` and sent as the `x-session-id` header
on every API request (see `src/api/client.js`).

## Pages

| Route        | Page             | Purpose                                         |
|--------------|------------------|-------------------------------------------------|
| `/`          | Login            | Start Microsoft login, save sessionId           |
| `/dashboard` | Dashboard        | List OneDrive folders, select one to back up    |
| `/backup`    | Backup           | Run backup on the selected folder, show result  |
| `/history`   | History          | Table of past backups                           |
| `/restore`   | Restore          | Look up a backup by ID, show its file list      |

All routes except `/` require a `sessionId` in `localStorage` (redirects to `/` otherwise).
