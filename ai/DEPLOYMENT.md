# Deployment Guide — Vercel & Render

This guide outlines the step-by-step instructions to host **The Interview Agent** in production:
- **Frontend**: Next.js React application hosted on **Vercel**.
- **Backend**: FastAPI Python application hosted on **Render**.

---

## 1. Code Changes Made (Production Readiness)

We updated [page.js](file:///d:/Projects/Interview%20Agent/frontend/src/app/page.js) to dynamically select the API server URL:
- **Development**: Defaults to `http://127.0.0.1:8000`.
- **Production**: Reads the environment variable `NEXT_PUBLIC_API_URL` injected by Vercel.

No changes were needed for the FastAPI CORS setup in [main.py](file:///d:/Projects/Interview%20Agent/backend/app/main.py) because it is already configured with wildcard CORS (`allow_origins=["*"]`), which permits cross-origin requests from Vercel.

---

## 2. Frontend Deployment: Vercel

Vercel is the native platform for Next.js, requiring minimal setup:

### Steps:
1.  **Sign Up / Log In**: Connect your GitHub account to [Vercel](https://vercel.com).
2.  **Import Repo**: Click **Add New** > **Project** and select your `The-Interview-Agent` repository.
3.  **Configure Directory**:
    *   In the **Root Directory** setting, click Edit and select the **`frontend`** directory.
4.  **Environment Variables**:
    *   Expand the **Environment Variables** section.
    *   Add the following key-value pair:
        *   **Key**: `NEXT_PUBLIC_API_URL`
        *   **Value**: `https://your-backend-service.onrender.com` *(Replace this with your active Render web service URL once created in the next section).*
5.  **Deploy**: Click **Deploy**. Vercel will build and host your frontend dashboard.

---

## 3. Backend Deployment: Render

Render is a robust cloud provider for hosting Python/FastAPI web services:

### Steps:
1.  **Log In**: Sign in to [Render](https://render.com) and link your GitHub.
2.  **Create Service**: Click **New +** > **Web Service**.
3.  **Connect Repo**: Select your `The-Interview-Agent` repository.
4.  **Configure Settings**:
    *   **Name**: `interview-agent-api` (or similar)
    *   **Region**: Select a region close to your users.
    *   **Language**: `Python`
    *   **Root Directory**: **`backend`** (This points Render to compile packages from `/backend/requirements.txt`).
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5.  **Environment Variables**:
    *   Add the following variables to configure LLM keys:
        *   `LLM_PROVIDER`: `gemini` (or `openai` or `mock` for testing)
        *   `GEMINI_API_KEY`: *(your real Google Gemini API Key)*
        *   `GEMINI_MODEL`: `gemini-2.5-flash`
        *   `DATABASE_URL`: `sqlite:////data/interview_agent.db` *(Required for persistent storage - see below)*
        *   `PYTHON_VERSION`: `3.11.0` (Recommended)

### 💾 Enabling Persistent Storage (For SQLite Session Recovery)
By default, Render web services run on ephemeral disks, meaning your SQLite session database will clear on server restarts. To keep database records persistent:
1.  In your Render Web Service page, navigate to the **Disks** section in the left sidebar.
2.  Click **Add Disk**.
3.  Enter the settings:
    *   **Name**: `database-volume`
    *   **Mount Path**: `/data`
    *   **Size**: `1 GB` (free tier disk is sufficient)
4.  Click **Save**.
5.  In the Web Service **Environment Variables**, ensure you have:
    *   `DATABASE_URL=sqlite:////data/interview_agent.db`
    *   *(Note: The extra slash in `sqlite:////` denotes an absolute root path `/data/` where your persistent disk is mounted).*

---

## 4. Verification Check

Once both services are running:
1.  Visit your Vercel URL in the browser.
2.  The footer at the bottom should display `FastAPI Backend: Online` with a pulsing green dot, confirming successful cross-origin communication between Vercel and Render.
3.  Select a candidate, start a session, and test that the AI interview loads and operates properly.
