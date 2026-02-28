# Deploy hypnoadminpro.com to Vercel

Follow these steps in order. Code is already on GitHub at `danteharker/hypno-admin-pro`.

---

## 1. Import project in Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import **hypno-admin-pro** from GitHub (authorize GitHub if asked)
4. Leave Framework Preset as **Next.js** — do not click Deploy yet

---

## 2. Add environment variables

In the import screen (or after: **Project → Settings → Environment Variables**), add these for **Production** (and Preview if you want):

| Name | Value | Where to get it |
|------|--------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Same |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Same (needed for Stripe webhook) |
| `OPENAI_API_KEY` | `sk-...` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `STRIPE_SECRET_KEY` | `sk_live_...` or `sk_test_...` | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` or `pk_test_...` | Same |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | From Step 3 below |
| `STRIPE_PAYMENT_LINK` | Your payment link URL | Stripe Dashboard → Payment links |
| `NEXT_PUBLIC_APP_URL` | `https://hypnoadminpro.com` | — |

---

## 3. Create production Stripe webhook (before first deploy)

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. **Add endpoint**
3. **Endpoint URL:** `https://hypnoadminpro.com/api/stripe/webhook`
4. **Events to send:**  
   `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
5. Click **Add endpoint**, then copy the **Signing secret** (`whsec_...`)
6. Add it as `STRIPE_WEBHOOK_SECRET` in Vercel (Step 2).  
   Until the domain works, you can use the `.vercel.app` URL once for a test webhook, then add a second endpoint for `https://hypnoadminpro.com/api/stripe/webhook` and use that secret in Vercel.

---

## 4. Deploy

1. In Vercel, click **Deploy**
2. Wait for the build; note the **`.vercel.app`** URL
3. Open that URL and confirm the app loads (login may fail until Supabase URLs are updated)

---

## 5. Add custom domain in Vercel

1. In the project: **Settings → Domains**
2. Add **hypnoadminpro.com**
3. Add **www.hypnoadminpro.com** when suggested
4. Vercel will show the DNS records to use (next step)

---

## 6. Point DNS at Vercel (Bluehost)

1. Log into **Bluehost** → **cPanel** → **Domains** → **DNS Zone Editor** (or **Advanced DNS**)
2. Set these records (remove or update any existing A/CNAME for `@` and `www`):

| Type | Name | Value |
|------|------|--------|
| **A** | `@` | `76.76.21.21` |
| **CNAME** | `www` | `cname.vercel-dns.com` |

3. Save. Propagation usually takes 5–60 minutes.

---

## 7. Verify

- Open `https://hypnoadminpro.com` — should load the app; Vercel will issue SSL automatically
- Open `https://www.hypnoadminpro.com` — should redirect to the root or load the app

---

## 8. Supabase auth URLs

1. **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. **Site URL:** `https://hypnoadminpro.com`
3. **Redirect URLs:** add `https://hypnoadminpro.com/**`
4. Save

---

## Optional: deploy from your machine

After linking once with the Vercel dashboard, you can deploy from the repo:

```bash
npx vercel login
npx vercel link
npx vercel --prod
```

Environment variables are managed in the Vercel dashboard, not in local `.env`.
