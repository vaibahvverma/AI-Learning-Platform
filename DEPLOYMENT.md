# AI Learning Platform - Deployment Guide

This guide will walk you through deploying your full-stack application.
- **Database**: MongoDB Atlas (Cloud)
- **Backend**: Render.com (Free Tier)
- **Frontend**: Vercel (Free Tier)

## 1. Prerequisites
- A **GitHub** account with your code pushed to a repository.
- Accounts on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), [Render](https://render.com), and [Vercel](https://vercel.com).

---

## 2. Set up MongoDB Atlas (Database)
Stateful data cannot be stored on free tier hosting efficiently, so we use a cloud database.

1.  Log into **MongoDB Atlas**.
2.  Create a new project.
3.  Create a **Cluster** (Select "M0 Sandbox" for free tier).
4.  Go to **Database Access** > Create a Database User (Remember the username and password).
5.  Go to **Network Access** > Allow Access from Anywhere (`0.0.0.0/0`).
6.  Go back to **Database** > Connect > Drivers > Copy the **Connection String**.
    *   It looks like: `mongodb+srv://<username>:<password>@cluster0.rx89q.mongodb.net/?retryWrites=true&w=majority`
    *   Compare this with your local `MONGODB_URI` to understand the format (replace `mongodb://localhost:27017` with this new string).

---

## 3. Deploy Backend (Render)

1.  Log into **Render Dashboard**.
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository.
4.  Configure the service:
    *   **Name**: `ai-learning-backend` (or similar)
    *   **Root Directory**: `backend`  <-- IMPORTANT
    *   **Environment**: `Node`
    *   **Build Command**: `npm install && npm run build`
        *   *Note: This installs dependencies and compiles TypeScript.*
    *   **Start Command**: `npm start`
    *   **Plan**: Free
5.  Scroll down to **Environment Variables** and add:
    *   `MONGODB_URI`: (Paste connection string from Step 2, replace `<password>` with real password)
    *   `JWT_SECRET`: (Generate a strong random string)
    *   `GEMINI_API_KEY`: (Your Google Gemini API Key)
    *   `PORT`: `10000` (Render creates this automatically, but good to know)
    *   `FRONTEND_URL`: (Leave empty for now, we will update this after deploying frontend)
6.  Click **Create Web Service**.
7.  Wait for deployment to finish. Once live, copy the **Backend URL** (e.g., `https://ai-learning-backend.onrender.com`).

---

## 4. Deploy Frontend (Vercel)

1.  Log into **Vercel Dashboard**.
2.  Click **Add New...** > **Project**.
3.  Import your GitHub repository.
4.  Configure the project:
    *   **Root Directory**: Edit this and select **`frontend`**.
    *   **Framework Preset**: Next.js (Should be auto-detected).
5.  **Environment Variables**:
    *   `NEXT_PUBLIC_API_URL`: Paste your **Backend URL** from Step 3 and append `/api` to it.
        *   Example: `https://ai-learning-backend.onrender.com/api`
6.  Click **Deploy**.
7.  Wait for deployment to finish. You will get a **Frontend URL** (e.g., `https://ai-learning-platform.vercel.app`).

---

## 5. Final Configuration

1.  Go back to **Render Dashboard** (Backend).
2.  Go to **Environment** settings.
3.  Add/Edit `FRONTEND_URL` and paste your **Frontend URL** (without trailing slash).
4.  **Save Changes** (Render will auto-deploy again).

## 6. Verification
1.  Open your deployed Vercel URL.
2.  Try Signing Up (Checks Database connection).
3.  Try Chatting with AI (Checks Gemini API).
4.  Upload a PDF (Checks Backend filesystem/memory).
    *   *Note: On Render Free tier, uploaded files are ephemeral and will disappear after restarts. For production file storage, you'd typically use AWS S3 or uploadthing, but for a demo, standard uploads are fine.*
