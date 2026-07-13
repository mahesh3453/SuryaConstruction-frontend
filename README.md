# SURYA CONSTRUCTION - Permit Activity Tracking Frontend

This repository contains the React + Vite frontend SPA for the Surya Construction Permit Tracking application.

## Tech Stack
- **Framework**: React 18
- **Styles**: Tailwind CSS
- **Icons**: Lucide React
- **API Client**: Axios

## Production Deployment (Vercel)
You can deploy this React client directly to **Vercel** with a simple git integration.

### Vercel Environment Settings
Ensure you add this Environment Variable in your Vercel project settings:
- `VITE_API_BASE_URL` - Set to your live Render backend URL (e.g. `https://suryaconstruction-backend.onrender.com`)

### Vercel Routing Configuration
To prevent 404 issues when reloading the SPA page on dynamic sub-routes (e.g. `/admin`, `/employee`), add a `vercel.json` rewrite file in the root if necessary, or let Vercel handle standard redirects.

---

## Local Setup
Ensure you have Node.js installed.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run development server:
   ```bash
   npm run dev
   ```
The application runs on `http://localhost:5173`.
All local backend requests starting with `/api` are automatically proxied to the backend at `http://localhost:8080` (configured in `vite.config.js`).
