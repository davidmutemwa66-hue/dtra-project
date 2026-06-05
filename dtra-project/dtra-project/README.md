# DTRA — Deployment Guide
## Digital Transformation Readiness Assessment Tool
### David Mutemwa | Student 107-784 | Cavendish University Zambia

**Stack:** MongoDB Atlas (database) → Render (backend API) → Netlify (frontend)
**Cost:** $0 on all free tiers

---

## STEP 1 — Set up MongoDB Atlas (Database)

1. Go to https://www.mongodb.com/cloud/atlas and create a free account
2. Click **"Build a Database"** → choose **M0 Free** tier → select a region close to Zambia (e.g. `aws / af-south-1` Cape Town or `aws / eu-west-1` Ireland)
3. Create a username and password — **save these**, you'll need them
4. Under **"Network Access"**, click **"Add IP Address"** → choose **"Allow Access From Anywhere"** (`0.0.0.0/0`) → Confirm
5. Under **"Database Access"**, confirm your user has **Read and Write** permissions
6. Click **"Connect"** → **"Drivers"** → copy the connection string. It looks like:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<password>` with your actual password and add the database name `dtra` before the `?`:
   ```
   mongodb+srv://youruser:yourpassword@cluster0.abc123.mongodb.net/dtra?retryWrites=true&w=majority
   ```
   **Keep this string private — never commit it to GitHub**

---

## STEP 2 — Push code to GitHub

1. Create a free account at https://github.com
2. Create a **new repository** called `dtra-project` (set to Public or Private)
3. Upload the entire `dtra-project` folder (drag and drop on GitHub, or use Git CLI):
   ```bash
   git init
   git add .
   git commit -m "Initial DTRA project"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/dtra-project.git
   git push -u origin main
   ```

---

## STEP 3 — Deploy Backend to Render

1. Go to https://render.com and sign up (free) with your GitHub account
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account and select the `dtra-project` repository
4. Configure the service:
   - **Name:** `dtra-api`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free
5. Scroll down to **"Environment Variables"** and add:
   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | Your Atlas connection string from Step 1 |
   | `FRONTEND_URL` | Leave blank for now (update after Step 4) |
6. Click **"Create Web Service"**
7. Wait ~3 minutes for deployment. You'll get a URL like:
   ```
   https://dtra-api.onrender.com
   ```
8. Test it by visiting `https://dtra-api.onrender.com/health` in your browser — you should see `{"status":"ok","db":"connected",...}`

---

## STEP 4 — Update Frontend with Your API URL

1. Open `frontend/index.html`
2. Find this line near the top of the `<script>` section:
   ```javascript
   const API_URL = 'https://YOUR-APP.onrender.com';
   ```
3. Replace `YOUR-APP` with your actual Render service name, e.g.:
   ```javascript
   const API_URL = 'https://dtra-api.onrender.com';
   ```
4. Save and commit the change to GitHub:
   ```bash
   git add frontend/index.html
   git commit -m "Set API URL"
   git push
   ```

---

## STEP 5 — Deploy Frontend to Netlify

1. Go to https://www.netlify.com and sign up free with your GitHub account
2. Click **"Add new site"** → **"Import an existing project"** → Connect GitHub
3. Select your `dtra-project` repository
4. Configure:
   - **Base directory:** `frontend`
   - **Build command:** *(leave blank)*
   - **Publish directory:** `frontend`
5. Click **"Deploy site"**
6. You'll get a URL like `https://amazing-name-123.netlify.app`
7. (Optional) Click **"Site settings"** → **"Change site name"** to customise it, e.g. `dtra-zambia.netlify.app`

---

## STEP 6 — Final CORS fix (important!)

1. Go back to your Render dashboard → `dtra-api` service → **"Environment"**
2. Add/update:
   | Key | Value |
   |-----|-------|
   | `FRONTEND_URL` | `https://dtra-zambia.netlify.app` (your Netlify URL) |
3. Click **"Save Changes"** — Render will redeploy automatically

---

## Your live URLs

| Service | URL |
|---------|-----|
| **Frontend (assessment tool)** | `https://dtra-zambia.netlify.app` |
| **Backend API** | `https://dtra-api.onrender.com` |
| **Health check** | `https://dtra-api.onrender.com/health` |
| **View all submissions** | `https://dtra-api.onrender.com/api/assessments` |
| **Research stats** | `https://dtra-api.onrender.com/api/assessments/stats` |

---

## Important Notes

- **Render free tier "sleeps"** after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to wake up. This is fine for research purposes. Paid tier ($7/month) keeps it always on.
- **MongoDB Atlas free tier** gives you 512MB storage — enough for thousands of assessments.
- **Never commit your `.env` file** to GitHub. The `.env.example` file is safe to commit.
- **To view your research data**, visit `https://dtra-api.onrender.com/api/assessments/stats` for aggregated statistics, or export the data from MongoDB Atlas directly.

---

## Project Structure

```
dtra-project/
├── backend/
│   ├── server.js           # Express server
│   ├── package.json
│   ├── .env.example        # Environment variable template
│   ├── models/
│   │   └── Assessment.js   # MongoDB schema + auto-scoring
│   └── routes/
│       └── assessments.js  # API endpoints
└── frontend/
    └── index.html          # Complete assessment tool (single file)
```

---

*Built for David Mutemwa · Research Project 107-784 · Cavendish University Zambia*
