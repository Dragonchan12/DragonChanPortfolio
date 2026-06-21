# Hosting Dragon Chan's portfolio on Cloudflare

Good news: this project is **already configured to build for Cloudflare**. The Vite
setup (`@lovable.dev/vite-tanstack-config`) bundles with **nitro using Cloudflare as the
default target**, so `vite build` produces a Cloudflare-ready Worker — including the
server function that fetches live Roblox stats (`src/lib/roblox.functions.ts`). No
rewrite needed.

You have two ways to deploy.

---

## Option A — Connect your Git repo (easiest, auto-deploys)

1. Push this project to GitHub/GitLab.
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Pick the repo, then set:
   - **Framework preset:** None / TanStack
   - **Build command:** `bun run build`  (or `npm run build` if you don't use bun)
   - **Build output directory:** `dist`
   - **Node/Bun:** add an env var `SKIP_DEPENDENCY_INSTALL=false` if needed; Cloudflare
     auto-detects `bun.lock`.
4. **Save and Deploy.** Every push to your main branch redeploys automatically.

If Cloudflare reports it can't find the output, check the end of your local `bun run build`
log for the emitted folder (TanStack/nitro Cloudflare builds usually land in `dist/` or
`.output/`) and set **Build output directory** to match.

---

## Option B — Wrangler CLI (deploy from your machine)

```bash
# one-time
bun install
bun add -d wrangler

# build + deploy
bun run build
bunx wrangler deploy        # for a Workers build
# or, if the build emits a Pages-style folder:
bunx wrangler pages deploy dist
```

First run opens a browser to log into your Cloudflare account.

---

## Custom domain

After the first deploy: **your project → Settings → Domains/Routes → Add custom domain**,
enter e.g. `dragonchan.gg`. If the domain's DNS is already on Cloudflare it's one click;
otherwise point its nameservers to Cloudflare first.

## Notes
- The live Roblox numbers come from a **server function**, which runs on the Cloudflare
  Workers runtime — it works on Cloudflare exactly like it does on Lovable. No API keys.
- Leaving the project on Lovable too? That's fine — Cloudflare just becomes a second,
  self-hosted deployment of the same repo.
