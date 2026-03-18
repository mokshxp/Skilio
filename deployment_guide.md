# 🚂 Railway Backend Deployment: Skilio

This guide focuses purely on deploying the **Skilio Backend** (Express API) on [Railway](https://railway.app/).

---

## 🛠 Phase 1: Push Code to GitHub
Railway builds directly from your repository.

1.  **Terminal Check**: Run these in the `skilio` root folder:
    ```powershell
    git add .
    git commit -m "chore: prepare backend for railway"
    git push origin main
    ```

---

## 🧠 Phase 2: Deploy the Backend
1.  **Railway Dashboard**: Click **"New"** → **"GitHub Repo"**.
2.  **Select your repo** (`Skilio-AI-Interview-Coach`).
3.  **Service Settings** (Click the service box once it's created):
    *   **Settings Tab**:
        *   **Source**: Ensure it's pointing to your `main` branch.
        *   **Root Directory**: Set this to `backend`.
        *   **Watch Patterns**: Put `/backend/**` here.
4.  **Variables Tab**: Add these EXACT keys from your [backend/.env](file:///d:/skilio/backend/.env):
    *   `DATABASE_URL` (Your Supabase connection string)
    *   `CLERK_SECRET_KEY` (Your Clerk secret key)
    *   `NVIDIA_API_KEY` (Your NVIDIA AI API key)
    *   `SUPABASE_URL` (Your Supabase project URL)
    *   `SUPABASE_SERVICE_ROLE_KEY` (Your Supabase service role key)
    *   `PORT`: `8000` (Railway will use this to listen for traffic)
5.  **Domain**:
    *   Go to the **Settings** tab.
    *   Click **"Generate Domain"** (or add your own).
    *   **Copy this URL** (e.g., `https://skilio-backend.up.railway.app`).

---

## 🎨 Phase 3: Linking your Frontend (e.g., Vercel)
Once the backend is live, you need to tell your frontend where it is.

1.  Go to your **Frontend deployment** (e.g., Vercel or your local `.env`).
2.  Update `VITE_API_URL` to the **Railway URL** you just copied.
    *   *Example:* `VITE_API_URL=https://skilio-backend.up.railway.app`

---

## ✅ Final Check
*   Check the **Railway Logs** (Deployments → View Logs).
*   If you see `Server running on port 8000`, your "brain" is live! 🧠🚀

---
**Happy Deploying!** 🚂💨
