# OpenClaw — AI Agent Dashboard

A premium dark-themed AI agent dashboard built with React, Recharts, and Claude AI.

## 🚀 Deploy to Vercel (5 minutes)

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Test locally
```bash
npm run dev
```
Open http://localhost:3000

### Step 3 — Push to GitHub
```bash
git init
git add .
git commit -m "OpenClaw Dashboard v1.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/openclaw-dashboard.git
git push -u origin main
```

### Step 4 — Deploy on Vercel
1. Go to https://vercel.com
2. Click **"New Project"**
3. Import your GitHub repo
4. Click **"Deploy"** — done!

### Step 5 — Add API Key (2 ways)

**Option A — Vercel Environment Variable (recommended, more secure):**
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `ANTHROPIC_API_KEY` = `sk-ant-api03-...`
3. Redeploy

**Option B — Enter in app Settings:**
- Go to Config page in the dashboard
- Paste your key → click SAVE KEY
- Key saves in localStorage permanently

## 📁 Project Structure
```
openclaw/
├── api/
│   └── chat.js          # Vercel serverless function (API proxy)
├── src/
│   ├── App.jsx          # Main dashboard (all 13 pages)
│   ├── main.jsx         # React entry point
│   └── index.css        # Base styles
├── index.html
├── package.json
└── vite.config.js
```

## 🔑 Get Anthropic API Key
1. Go to https://console.anthropic.com
2. Sign up / Login
3. API Keys → Create Key
4. Copy `sk-ant-api03-...`

## 🛠 Tech Stack
- React 18
- Vite
- Recharts
- Claude AI (Anthropic API)
- Vercel Serverless Functions
- localStorage for persistence
