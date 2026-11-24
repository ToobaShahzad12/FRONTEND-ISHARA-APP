# Smart Inventory - Frontend Only

## Requirements
- Node.js (your installed Node.js is sufficient)
- npm

## Run in VS Code
1. Extract this ZIP.
2. Open the extracted `frontend` folder in VS Code.
3. Open Terminal in VS Code (`Ctrl + backtick`).
4. Run:

```powershell
npm install
npm run dev
```

5. Open the Local URL printed by Vite (usually http://localhost:5173).

## Important
This package contains only the frontend (`client` folder from the complete project).
The original `.env` file was intentionally not copied because it contained API credentials.
The UI can start without Java or the backend, but features that call the backend/API will
need the corresponding services and valid environment variables.

If the project needs Gemini or Stripe configuration, create a `.env` file in this folder
using your own credentials, for example:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_STRIPE_KEY=your_stripe_publishable_key
```
