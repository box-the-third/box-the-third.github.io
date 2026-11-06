# Backend setup (all free tier)

1. SQL editor → run `schema.sql`, then `studio.sql`.
2. Insert bank details into `studio_bank` (see comment in studio.sql). Never commit them.
3. AI agent proxy (key stays server-side):
   ```bash
   supabase functions deploy agent-run
   supabase secrets set GEMINI_API_KEY=your_free_key ALLOWED_ORIGINS=https://box-the-third.github.io,http://localhost:3000
   ```
   Without the key every agent still works using the built-in template engine.
4. GitHub → Settings → Secrets and variables → Actions:
   secrets `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`; variable `NEXT_PUBLIC_N8N_WEBHOOK`.
5. n8n on localhost: import `automation/n8n/social-poster.workflow.json`, attach your own
   OAuth credentials inside n8n, activate, then `n8n start` before logging in.
