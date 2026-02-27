# Deploy Hypno Admin Pro to Vercel

Follow these steps to get the app live.

## 1. Push your code to GitHub

If you haven’t already:

```bash
git add .
git commit -m "Hypno Admin Pro – market-ready MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

(Replace with your repo URL. You can create a new repo on [GitHub](https://github.com/new).)

## 2. Import the project in Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (or create an account).
2. Click **Add New…** → **Project**.
3. Import your GitHub repository.
4. Leave **Framework Preset** as **Next.js** and **Root Directory** as `.`.
5. Do **not** click Deploy yet—add environment variables first.

## 3. Set environment variables

In the Vercel project setup, open **Environment Variables** and add:

| Name | Value | Notes |
|------|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | From Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon (public) key | Same place |
| `OPENAI_API_KEY` | Your OpenAI API key | From [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |

Optional:

- `OPENAI_SCRIPT_MODEL` – e.g. `gpt-4o-mini` (default) or `gpt-4o` for higher quality scripts.
- `SUPABASE_SERVICE_ROLE_KEY` – only if you use seed scripts or server-side admin tasks (keep secret).

Apply to **Production**, **Preview**, and **Development** as needed.

## 4. Deploy

Click **Deploy**. Vercel will build and deploy. The first run may take a couple of minutes.

## 5. Configure Supabase for production

In [Supabase Dashboard](https://supabase.com/dashboard) → your project → **Authentication** → **URL Configuration**:

- **Site URL:** `https://YOUR_VERCEL_DOMAIN.vercel.app` (or your custom domain).
- **Redirect URLs:** add `https://YOUR_VERCEL_DOMAIN.vercel.app/**` and `https://YOUR_VERCEL_DOMAIN.vercel.app/auth/callback`.

Replace `YOUR_VERCEL_DOMAIN` with the domain Vercel gives you (e.g. `hypno-admin-pro-xyz`).

## 6. Test the flow

1. Open your live URL.
2. Register a new account (Supabase auth).
3. Open the dashboard, create a script, and try the Audio Studio or another AI feature (OpenAI key must be set).
4. Confirm sign-out and sign-in work.

If something fails, check Vercel **Functions** and **Logs** for errors, and confirm all env vars are set and Supabase redirect URLs include your production domain.

## Custom domain (optional)

In the Vercel project: **Settings** → **Domains** → add your domain and follow the DNS instructions.
