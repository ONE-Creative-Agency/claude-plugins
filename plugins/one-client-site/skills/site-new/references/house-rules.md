# ONE client sites: how the system works and the house rules

Read this before running any command for a client site task.

## How the system works

```
Claude Code session on the designer's computer
   └─ site folder (e.g. C:\GitHub_Local)
        └─ <client>-site/        ← one folder per client, linked to GitHub
             │  git push
             ▼
GitHub repo ONE-Creative-Agency/<client>-site
             │  GitHub Actions "Deploy to Cloudflare" (2–3 minutes)
             ▼
Cloudflare Workers on ONE's account (nobody logs in to Cloudflare)
             ▲
Sanity (the editor at /admin) ── publish ──► webhook ──► GitHub rebuild
```

- Every client site is its own **private GitHub repo** in **ONE-Creative-Agency**, made from **ONE-Creative-Agency/site-template**. The name **must end in `-site`** (e.g. `dalton-site`). It is separate from the client's `<client>-preview` repo, which stays for design previews.
- The site is **Astro** (pages), **Sanity** (content, edited at `https://<site>/admin`) and **Cloudflare Workers** (hosting and the contact form). The design lives in code; the words, photos, menu and contact details live in Sanity.
- Inside the repo:
  - `site.config.js`: client name, worker name (= repo name), Sanity project ID, languages.
  - `src/components/sections/` + `src/sanity/schemaTypes/sections.js`: page sections. Each is a component plus a Sanity block.
  - `src/components/coded/`: one-off layouts kept in code.
  - `public/css/`, `public/js/`: the client's styles and scripts.
  - `worker/index.js`: the contact form endpoint. `wrangler.jsonc` and `.github/`: publishing machinery.
  - `CLAUDE.md` and `.claude/settings.json` carry these rules into any session opened on the folder.
- **Two branches, two addresses:**
  - **`staging`** → `https://<repo>-staging.one-agency.workers.dev`: the studio check link, hidden from search engines. Sanity publishes rebuild staging until launch.
  - **`main`** → the **live site**: `https://<repo>.one-agency.workers.dev` before launch, the client's own domain after. After launch, Sanity publishes rebuild main, so **publishing in Sanity changes the live site**.
- **One Sanity project per client**, in ONE's Sanity organisation (`oubftl5le`). The client gets one shared login (Nicky invites it). The dataset is public (read-only): published words and photos are public anyway.
- **Settings and keys** live in GitHub → the repo → Settings → Environments (`staging`, `production`). Non-secret settings are variables; keys are secrets. Cloudflare deploy access is two repo secrets Nicky sets on each new repo.

## House rules (non-negotiable)

1. **Run commands with Claude Code's own Bash tool.** On Windows this is Git Bash: use the bash commands in `commands.md`.
2. **Confirm before anything the public will see**: any push or merge to `main`, and after launch any Sanity publish. Say plainly "This updates the live site `<address>`" and wait for a clear yes in a question box.
3. **Never** force-push, reset hard, delete a repo, branch, Worker or Sanity project/dataset, or change repo settings beyond: adding the Studio team to a new site repo, and setting the non-secret GitHub variables listed in `commands.md` with the user's yes. Anything else: tell the user to ask Nicky.
4. **Never run `wrangler deploy`, `wrangler secret` or `wrangler delete` locally.** Publishing happens only on GitHub. `npm run dev`, `npm run build` and `npx wrangler dev` for local checks are fine.
5. **Never ask for, accept or repeat a token, API key or password in chat**, and never write one in a file. Nicky types them straight into GitHub or Sanity. If someone pastes one, tell them it must be replaced (revoked) and ask Nicky.
6. **Only touch repos in ONE-Creative-Agency whose name ends in `-site`**, and Sanity projects that belong to them (the ID in their `site.config.js`).
7. Keep command output out of the chat. Summarise it in a line.
8. When something fails, quote the one line of the error that matters, say what it means in plain words, and who fixes it (the user, or Nicky). Don't retry the same failing command more than once.
9. **Client copy belongs in Sanity**, never hard-coded in components. Fixed interface words (form labels, 404) go in `src/i18n/ui.js`.
10. Explain in plain language. The person is a designer, not a developer. Introduce each technical word once.

## Asking the user

- **Every question goes in a question box** (AskUserQuestion), **one question per box**. Wait for the answer before the next. Never list several questions in chat.
- Give 2–4 concrete options, the recommended one first and marked "(Recommended)". Don't add "Other"; the box allows typing.
- Make options real: detected folders, suggested names, the client you've inferred.
- Skip any question the user's message already answered, and say in one line what you took from it.
- The "go ahead?" before anything public is a question box too: "Yes, update the live site" / "Not yet".
- Ask in plain chat only for long free text (e.g. a brief).

## Who to ask

Nicky (Head of Operations) owns the GitHub org, ONE's Cloudflare and Sanity accounts, and these settings. Hand over to Nicky for: Cloudflare secrets on a new repo, the Sanity rebuild webhook, the client's Sanity login, domains and DNS, Turnstile keys, email sending, analytics, org invites and Studio team membership, and deleting anything. Write the handover as a short checklist the user can forward.
