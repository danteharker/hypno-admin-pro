# Hypno Admin Pro

Workspace for hypnotherapists: AI scripts, audio studio, client management, session delivery.

## Getting Started

### 1. Install (first time only)

```bash
npm install
```

### 2. Run the dev server

In a terminal (PowerShell or CMD):

```bash
npm run dev
```

Wait for `✓ Ready` and `Local: http://localhost:3000`.

### 3. Open the app

- Run `npm run open` in another terminal, or  
- Go to **http://localhost:3000** in your browser

---

**Auth (Supabase):** Copy `.env.example` to `.env.local` and add your [Supabase](https://supabase.com) project URL and anon key. Without these, sign up and login will not work. Add `OPENAI_API_KEY` for AI features (scripts, suggestions, audio, etc.).

## Deploy to Vercel

See **[DEPLOY.md](DEPLOY.md)** for step-by-step deployment and required environment variables.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
