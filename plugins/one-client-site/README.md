# ONE client site (Claude Code plugin)

Takes an approved client design to a live production website, and keeps it running: **Astro** pages, **Sanity** editor at `/admin`, **Cloudflare Workers** hosting on ONE's account, published by **GitHub Actions** (nobody logs in to Cloudflare).

## Skills
- **site-setup**: once per computer. Checks everything below and installs or connects what's missing (GitHub, Node, the Sanity connector and login, the projects folder), asking first. The other skills send you here when something's missing.
- **site-new**: new `<client>-site` repo from `ONE-Creative-Agency/site-template`, Studio team access, the client's Sanity project with starter pages and languages, Nicky's handover, first push to staging.
- **site-build**: brings the design in (a client preview, Astro source or HTML), turns repeated blocks into Sanity sections, moves the content into Sanity, adds other languages, compares with the design, sends to staging.
- **site-launch**: pre-launch checks, domain and DNS (moved to Cloudflare or kept at the client's host), contact form email, Turnstile, analytics, go-live after a clear yes.
- **site-update**: content changes in Sanity, design changes via staging, settings, failed publishes, form messages.

## Needs
- Claude Code with the GitHub CLI logged in to **ONE-Creative-Agency** (the one-client-preview plugin's preview-setup does this), and Node 22+.
- The Sanity connector, authorised for ONE's Sanity organisation (or Nicky does the Sanity steps), and a Sanity login on the computer (`npx sanity login`, once) for the rebuild webhook.
- ONE's rebuild relay (`ONE-Creative-Agency/one-rebuild-relay`), set up once by Nicky.

## Addresses
- `staging` → `https://<repo>-staging.one-agency.workers.dev` (studio check link, never indexed)
- `main` → the live site: `https://<repo>.one-agency.workers.dev`, then the client's domain after launch

Admin steps (Cloudflare secrets, Sanity webhook and logins, DNS, Turnstile, email sending) are handed to Nicky as a checklist. Owner: Nicky.
