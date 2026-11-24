# Command reference (Claude Code Bash: Git Bash on Windows, zsh/bash on a Mac)

All commands are bash. Quote paths with spaces. Work out the OS once: `uname -s` (`MINGW…`/`MSYS…` = Windows, `Darwin` = Mac).

`<base>` is the user's project folder: `git config --global --get one.siteFolder`, or else `git config --global --get one.previewFolder` (the same folder previews use). `<repo>` is `<base>/<client>-site`. Run repo commands as `cd "<repo>" && …` in one call, because the working folder may reset between calls.

## Checks

| What | Command |
|---|---|
| GitHub CLI and login | `gh auth status` |
| Who is logged in | `gh api user --jq .login` |
| Org membership | `gh api user/memberships/orgs/ONE-Creative-Agency --jq .state` (`active` = good) |
| Studio team | `gh api orgs/ONE-Creative-Agency/teams/studio/memberships/$(gh api user --jq .login) --jq .state` |
| Node (required: builds and local checks) | `node --version` (22 or newer) |

Missing GitHub CLI, login or org: run the **preview-setup** skill (one-client-preview plugin) if it's installed; otherwise install with `winget install --id GitHub.cli -e --source winget --accept-package-agreements --accept-source-agreements` (Mac: `brew install gh`) and log in with `gh auth login --hostname github.com --git-protocol https --web` in the background, showing the one-time code. Missing Node: `winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements` (Mac: `brew install node`), with the user's OK. On Windows a new install needs Claude Code restarted to be on the PATH.

## Repos

| What | Command |
|---|---|
| List client sites | `gh repo list ONE-Creative-Agency --limit 200 --json name --jq '.[].name' \| grep -- '-site$'` |
| Create a new site | `cd "<base>" && gh repo create ONE-Creative-Agency/<client>-site --template ONE-Creative-Agency/site-template --private --clone` |
| Studio team Write | `gh api -X PUT orgs/ONE-Creative-Agency/teams/studio/repos/ONE-Creative-Agency/<client>-site -f permission=push` |
| Clone an existing site | `cd "<base>" && gh repo clone ONE-Creative-Agency/<client>-site` |
| Install packages | `cd "<repo>" && npm ci` (first time after cloning, and after `package-lock.json` changes) |

A fresh template clone can be empty for a few seconds while GitHub copies the template: wait 5 seconds, then `git pull`.

## Local checks

| What | Command |
|---|---|
| Build (reads published Sanity content) | `cd "<repo>" && npm run build` |
| Preview the site and the Studio | `cd "<repo>" && npm run dev` in the background, then open `http://localhost:4321` (Studio: `/admin`) in the browser pane |
| Contact form endpoint | after a build: `cd "<repo>" && npx wrangler dev --env staging --port 8799` in the background; the form answers on `http://localhost:8799` |

Stop background servers when done.

## Shared files (before every push)

`cd "<repo>" && node .one/refresh.mjs`

- "Shared files are up to date": carry on.
- "Refreshed from …" with a list: ONE's fixes came in. Build locally (`npm run build`) to check nothing broke, then commit them on their own: `git add -A && git commit -m "Refresh ONE's shared files (template <short sha>)"`. Mention it in one line ("ONE's latest fixes to the shared files came in: <files>"). If the build breaks, stop and tell Nicky with the error line; don't push.
- "Couldn't refresh": usually not logged in to GitHub or no access to `site-template` (Studio team). Say so and carry on with the push; mention it in the wrap-up.
- A site made before shared files existed has no `.one/` folder: tell Nicky it needs bringing in line with the template once (Nicky's call, not part of a normal publish).

## Publishing

| What | Command |
|---|---|
| Send to staging (first time) | `cd "<repo>" && git checkout -b staging && git add -A && git commit -m "<message>" && git push -u origin staging` |
| Send to staging (after) | `cd "<repo>" && git checkout staging && git add -A && git commit -m "<message>" && git push origin staging` |
| Watch the run | `cd "<repo>" && sleep 5 && gh run watch $(gh run list --branch <branch> --limit 1 --json databaseId --jq '.[0].databaseId') --exit-status` |
| The address it deployed to | `cd "<repo>" && gh run view $(gh run list --branch <branch> --limit 1 --json databaseId --jq '.[0].databaseId') --log \| grep -oE 'SITE_URL=https://[^ ]+' \| head -1` |
| Why a run failed | `gh run view <id> --log-failed \| tail -30` |
| Publish staging to the live site (after a yes) | `cd "<repo>" && git checkout main && git pull --ff-only && git merge --ff-only staging && git push origin main && git checkout staging` |
| Rebuild without a code change | `cd "<repo>" && gh workflow run deploy.yml --ref <branch>` |

If `merge --ff-only` refuses, main has changes staging doesn't: `git checkout staging && git merge main`, push staging, check it, then try again.

A run that fails with "CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID are missing" means Nicky hasn't set the repo secrets yet (site-new handover).

## GitHub settings (environments)

The `staging` and `production` environments appear after the first run on each branch.

Non-secret variables Claude may set **after the user's yes** (one command per variable):
`cd "<repo>" && gh variable set <NAME> --env <staging|production> --body "<value>"`

| Variable | Environment | Value |
|---|---|---|
| `CONTACT_TO` | both | where enquiries go, e.g. `info@client.com` (several: comma-separated) |
| `CONTACT_FROM` | both | the sender, e.g. `website@client.com`, on a domain set up for Cloudflare Email Sending |
| `TURNSTILE_SITE_KEY` | both | the Turnstile widget's site key (public) |
| `SITE_URL` | production | the real address at launch, e.g. `https://client.com` |
| `CF_ANALYTICS_TOKEN` | production | only if Web Analytics isn't switched on automatically for the domain |

List them: `gh variable list --env <env>`. A change only takes effect on the next deploy (`gh workflow run deploy.yml --ref <branch>`).

**Secrets are Nicky's** (GitHub → repo → Settings → Secrets and variables → Actions / Environments): `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (repo secrets), `TURNSTILE_SECRET` and `SANITY_WRITE_TOKEN` (environment secrets, both environments). Check they exist without seeing them: `gh secret list` and `gh secret list --env <env>`.

## Sanity (Sanity MCP tools)

Use the Sanity connector's tools (`create_project`, `list_datasets`, `create_dataset`, `add_cors_origin`, `create_documents`, `patch_documents`, `publish_documents`, `query_documents`, `dataset_assets_upload_from_url`, `assets_upload_status`). If they aren't available or ask for authorisation, tell the user to connect Sanity (Customize → Connectors, ONE's Sanity organisation), or hand the step to Nicky.

| What | How |
|---|---|
| New project | `create_project` in organisation `oubftl5le`, named "<Client> website". Never in a personal organisation. |
| Dataset | `production`, **public** read. Create it with `create_dataset` if `list_datasets` doesn't show it. |
| Allowed web addresses (CORS, with credentials) | `http://localhost:4321`, `https://<repo>-staging.one-agency.workers.dev`, `https://<repo>.one-agency.workers.dev`; at launch the real domain and `www.` |
| Starter content | create each document in the repo's `sanity/starter-content.ndjson` (one JSON per line) with `create_documents`, then `publish_documents` |
| Photos | `dataset_assets_upload_from_url` (e.g. from the preview's staging link), wait with `assets_upload_status`, then reference as `{"_type":"image","asset":{"_type":"reference","_ref":"<asset id>"},"alt":"…"}` |
| Translation link (multi-language) | a `translation.metadata` document, id `translation-metadata-page-<name>`: `{"schemaTypes":["page"],"translations":[{"_key":"en","_type":"internationalizedArrayReferenceValue","language":"en","value":{"_type":"reference","_ref":"page-<name>-en","_weak":true}}, …one per language]}` |

Document ids: `siteSettings-<lang>`, `navigation-<lang>`, `page-<name>-<lang>`. Every array item needs a unique `_key`. Publish after creating or patching (drafts don't reach the site).

**Rebuild on publish.** Every site's Sanity project has one webhook, "Rebuild site", that calls ONE's rebuild relay (`https://one-rebuild-relay.one-agency.workers.dev/sanity/<repo>`). The relay runs the repo's deploy on the branch in `site.config.js` → `rebuildBranch` (`'staging'` until launch, `'main'` after). The webhook holds no key.

| What | Command |
|---|---|
| Sanity login on this computer (once; opens the browser) | `cd "<repo>" && npx sanity login` |
| Create or fix the webhook | `cd "<repo>" && node .one/sanity-webhook.mjs` |
| Check it | `cd "<repo>" && node .one/sanity-webhook.mjs --check` (✓ = set up correctly) |

- "Not logged in to Sanity": run the login (the user picks the same account they use for Sanity, in the browser), then try again.
- "can't manage webhooks": the user isn't an Administrator of that Sanity project; Nicky adds them.
- The relay can only rebuild a branch that exists: before the first push to `staging`, a publish does nothing (harmless).
- An older site whose webhook still calls GitHub with a token: running the script points it at the relay and removes the token. Tell Nicky the old token can then be revoked.

## Large files

Cloudflare refuses any single file over 25 MB. Before pushing: `cd "<repo>" && find public -type f -size +24M`. Videos go in Sanity (file field) or are compressed; never commit them over 24 MB.
