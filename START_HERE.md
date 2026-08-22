# START HERE

Read this before running anything. The most common issue people hit is running commands from
the **wrong folder** — this guide is written to make that impossible.

## 1. Unzip

Unzip this file **once**, somewhere clean, e.g. `C:\Projects\lastmile-delivery-tracker`.
After unzipping you must see exactly this:

```
lastmile-delivery-tracker/
├── backend/
├── frontend/
├── README.md
├── SYSTEM_DESIGN.md
├── API_DOCUMENTATION.md
└── START_HERE.md   <- you are reading this file
```

If you see a `.zip` file *inside* the extracted folder, unzip that one too and use *its*
contents instead — but with this version of the download, there should be no nested zip.

⚠️ **Do not** copy individual folders out into other locations (like a Downloads/AI/GEN-AI
folder). Run everything from inside this exact `lastmile-delivery-tracker` folder, in place.

## 2. Open TWO terminals

You need the backend and frontend running **at the same time**, in **two separate terminal
windows**. Confirm each terminal's prompt shows the correct path before typing anything.

### Terminal 1 — Backend

```bash
cd lastmile-delivery-tracker/backend
npm install
copy .env.example .env        (Windows)   |   cp .env.example .env   (Mac/Linux)
```

Now open the new `.env` file in a text editor and set:
- `MONGO_URI` → a local MongoDB (`mongodb://127.0.0.1:27017/lastmile`) or a free MongoDB Atlas
  connection string
- `JWT_SECRET` → any random long string
- Leave `NOTIFICATIONS_DRY_RUN=true` if you don't have SMTP/Twilio credentials yet — email/SMS
  will just be logged to this terminal instead of actually sent, and everything else still works.

Then:

```bash
npm run seed
npm run dev
```

You should see:
```
[DB] MongoDB connected: ...
[Server] Running in development mode on port 5000
```

Leave this terminal running. Test it worked by opening `http://localhost:5000/api/health` in a
browser — you should see `{"success":true,"message":"..."}`.

### Terminal 2 — Frontend

```bash
cd lastmile-delivery-tracker/frontend
npm install
copy .env.example .env        (Windows)   |   cp .env.example .env   (Mac/Linux)
npm run dev
```

You should see:
```
VITE ready
➜  Local:   http://localhost:5173/
```

Open `http://localhost:5173/` in your browser. You should land on the Last-Mile Delivery Tracker
homepage — not a 404.

## 3. Log in

Use the accounts printed by the seed script (also listed in `README.md` §3.1):

| Role     | Email                     | Password       |
|----------|----------------------------|----------------|
| Admin    | admin@lastmile.com         | Admin@12345    |
| Agent    | ravi.agent@lastmile.com    | Agent@12345    |
| Customer | customer@lastmile.com      | Customer@12345 |

## 4. If something still breaks

Copy-paste the exact terminal output (both terminals) plus, if it's a blank/broken page in the
browser, open DevTools (F12) → Console tab and copy any red error text. That's almost always
enough to pinpoint the exact fix.

Common mistakes, in order of likelihood:
1. Running `npm run dev` from the wrong folder (not `frontend/` or not `backend/`).
2. Only one of the two servers running (you need both, in two terminals, simultaneously).
3. `.env` not created (only `.env.example` exists) — Vite and Node both ignore `.env.example`.
4. MongoDB not reachable — check `MONGO_URI` in `backend/.env`.
