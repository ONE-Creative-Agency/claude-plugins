---
name: site-new
description: Start a new ONE client production website (Astro + Sanity + Cloudflare) in Claude Code. Creates the client's private `<client>-site` GitHub repo from ONE's site template and its linked folder, gives the Studio team access, creates the client's Sanity project with starter pages, sets the languages, writes Nicky's handover for the Cloudflare and Sanity keys, and puts the starter site on the staging check link. Use when someone says "new client website", "set up the real site for Dalton", "start the production site", "make the live site from the preview", or "the design is approved, build the website".
---

# New client website

Read `references/house-rules.md` and `references/commands.md` first. This makes the empty site and its connections; **site-build** then brings the design in.

## 1. Setup check (silent unless something's missing)

`gh auth status` works, org membership is `active`, Node 22+ is installed, and a project folder is set (commands.md → Checks). Fix anything missing first.

## 2. The details

One question per box (house-rules → Asking the user), skipping anything already said.

1. **Client.** Offer likely names (from their words, the folder, existing `-preview` repos).
2. **Languages.** Options like "English only", "English and Arabic (Recommended for UAE clients)", "Another set". Arabic, Hebrew, Urdu and Farsi read right to left; say the layout handles that, and that the RTL styling is checked in site-build.
3. **Where the design comes from** (for site-build later; just note it): the client's `-preview` repo (offer the matching ones), Astro source from a developer, or HTML files on this computer.

Then propose the repo name in a question box (your suggestion, one alternative): `<short-client>-site`, lowercase with hyphens, **must end in `-site`**, at most 40 characters (it also becomes the Cloudflare worker name and the check link `https://<repo>-staging.one-agency.workers.dev`). Check it isn't taken (commands.md → List client sites). If it is, ask whether they meant to work on that one (switch to **site-update**).

## 3. Create the project

Say: "I'm creating a private project for <client> on GitHub, from ONE's site template, and its linked folder on your computer."

1. Create the repo and clone it (commands.md → Repos). Check `site.config.js` arrived.
2. Give the Studio team Write. On 404, note it for the handover and carry on.
3. `npm ci` (a few minutes the first time). Say it's downloading the site's building blocks.

## 4. The Sanity project

1. Create the project in ONE's Sanity organisation, check the `production` dataset is public, and add the CORS addresses (commands.md → Sanity). If the Sanity tools aren't available, put "create the Sanity project" on Nicky's handover and stop after step 5 with the folder ready.
2. Fill in `site.config.js`: `name` (client name per language; ask for the native spelling if it differs, e.g. Arabic), `worker` (the repo name), `sanity.projectId`, `languages` (uncomment or add entries; the first is the default and has no URL prefix).
3. Set the same worker name in `wrangler.jsonc`: `"name": "<repo>"` and the staging env `"name": "<repo>-staging"`.
4. Create and publish the starter content from `sanity/starter-content.ndjson`, replacing "Client name" and "Client" with the client's name. For each extra language, copy every document with `-<lang>` ids and `"language": "<lang>"` (keep the English words for now; site-build translates), and create the `translation-metadata-page-<name>` links.
5. Run the shared-files refresh once (commands.md → Shared files). It records the template version in `.one/template-version`.
6. Build locally (`npm run build`). It must finish with the home and contact pages listed. Fix anything it reports.

## 5. Nicky's handover

Write this checklist for the user to forward (fill in the names; no keys in it):

> **New client site: <Client>** (`ONE-Creative-Agency/<repo>`, Sanity project `<projectId>`)
> 1. GitHub repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (Settings → Secrets and variables → Actions).
> 2. Sanity webhook "Rebuild site" pointing at this repo, ref `staging` (details: one-client-site → commands.md → Rebuild on publish).
> 3. Sanity: invite the client's shared login as Editor, and add the studio designers who need it.
> 4. (Only if it failed) Add the Studio team to the repo.

Say the first deploy can't go out until step 1 is done.

## 6. First push to staging

Commit ("<Client>: new site from ONE's template") on a new `staging` branch and push (commands.md → Publishing). Watch the run.

- **Secrets missing:** the run stops at Deploy with the missing-secrets message. That's expected until Nicky does step 1. Tell the user to say **send it to staging** once Nicky confirms.
- **Success:** get the address, open it in the browser pane, and check the home page, the contact page and `/admin` load.

## 7. Wrap up

- **Repo / folder:** `<repo>`. "Next, open Claude Code on this folder and say **build the site from the design** (site-build)."
- **Check link:** `https://<repo>-staging.one-agency.workers.dev` (or "after Nicky's step 1").
- **Editor:** `<check link>/admin`, the Sanity login.
- **Waiting on Nicky:** the handover list.
