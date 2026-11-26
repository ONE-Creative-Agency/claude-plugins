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

Anything missing here, or the Sanity connector or Sanity login (see Sanity below): run the **site-setup** skill, which checks everything and installs or connects what's missing, asking first. Its install commands: GitHub CLI `winget install --id GitHub.cli -e --source winget --accept-package-agreements --accept-source-agreements` (Mac: `brew install gh`) and log in with `gh auth login --hostname github.com --git-protocol https --web` in the background, showing the one-time code. Missing Node: `winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements` (Mac: `brew install node`), with the user's OK. On Windows a new install needs Claude Code restarted to be on the PATH.

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

## Sites board (after every run)

ONE's **Client sites** page (`https://claude.ai/artifact/UyvSwmAJGgrgkt3WJeNa86`) shows every client site, its stage and what it waits on. Update the site's row at the end of every site-new, site-build, site-launch and site-update run, before the wrap-up message.

- **Tool:** `ArtifactData` (if it isn't loaded, load it with ToolSearch `select:ArtifactData`). `url` is the page above, `collection` is `sites`, `doc_id` is the repo name.
- **Read first:** `action: "get"`. If it exists, write with `action: "update"` and `if_version` set to the version you read (only the fields that changed). If it doesn't, create it with `action: "set"` and every field below.
- **Can't update** (the tool isn't available, or the write is refused because this person can't edit the page): say so in one line in the wrap-up ("The sites board wasn't updated: ask Nicky for edit access to the Client sites page") and carry on. Never a reason to stop.
- **Never** put keys, tokens, passwords or client messages on the board. Everyone at ONE with access can read it.

| Field | What |
|---|---|
| `client` | the client's name as people say it ("UnBread") |
| `repo` | the repo name |
| `stage` | `not-started` · `building` (site-new done, site-build under way) · `staging` (built and on the check link for the client) · `live` (published on the client's domain) |
| `paused` | `true` when the client asked to wait, otherwise `false` |
| `designer` | first name of who builds it |
| `languages` | e.g. `["English", "Arabic"]`, main language first |
| `contact` | where the contact form goes, or `""` |
| `design` | where the approved design is, in a few words |
| `checkLink` | `https://<repo>-staging.one-agency.workers.dev` once staging has deployed, else `""` |
| `liveUrl` | the live address once launched, else `""` |
| `waiting` | what's open, at most five: `[{"who": "Nicky" \| "Client" \| "Designer", "what": "<short line>"}]`; remove items that are done |
| `next` | `{"label": "<the next step, one line>", "prompt": "<the exact text to paste into Claude Code to do it>"}` |
| `note` | one optional line of context, or `""` |
| `updated` | now, as an ISO date-time |

Write in plain words for the studio, no em dashes. The `prompt` starts with the skill to run, e.g. `/site-build Build the UnBread site from the design in ONE-Creative-Agency/unbread-source.`

## SEO reports

ONE's monthly SEO reports live in the private repo `ONE-Creative-Agency/one-seo-reports`, from free sources only: Google Search Console, Bing Webmaster Tools, Cloudflare Web Analytics, PageSpeed Insights and ONE's own site audit. A GitHub Action runs on the 3rd of each month for every site in its `sites.json` and commits `reports/<repo>/<YYYY-MM>.json`. Keys are repo secrets that only Nicky sets; never ask for them or put them anywhere else.

- **Get the repo:** clone it into `<base>` if it isn't there (`gh repo clone ONE-Creative-Agency/one-seo-reports`), otherwise `git -C "<base>/one-seo-reports" pull --ff-only`. Node 22+, nothing to install.
- **Run a report now:** `gh workflow run collect.yml --repo ONE-Creative-Agency/one-seo-reports -f site=<repo>` (add `-f month=YYYY-MM` for a given month), watch it (`gh run watch`), then pull. The audit alone can also run locally: `node collect.mjs --site <repo> --only audit`; don't commit local runs, the Action does that.
- **Which sources ONE can read:** run the workflow with `-f check=true` and read the log. It lists the Search Console properties and Bing sites the keys can see.
- **Add or change a site:** edit `sites.json` (`repo`, `client`, `url` = live home page, `searchConsole` = `sc-domain:<domain>` or the URL-prefix property, `bing` = the site URL as Bing shows it, `cloudflareSiteTag`). Leave a source `null` until ONE has access. Commit `<Client>: SEO report settings` and push to `main` (this repo has no staging).
- **Put it on the board:** `node board-doc.mjs <repo> > "<scratchpad>/seo-<repo>.json"`, then add two things before writing it:
  - `fixes`: the three changes that would help most, in order, each `{"title": "<what to do, one sentence>", "why": "<the evidence from the report, with numbers>", "who": "<Designer | Nicky | Client | site-launch | in Sanity>"}`. Base them only on the report (audit issues, falling clicks or positions, slow pages, searches with many impressions but few clicks, pages that rank 5 to 20). Never invent search volumes or rankings the report doesn't have.
  - `note`: one line of context, or `""`.
  Then write it to the SEO tab: `ArtifactData`, page `https://claude.ai/artifact/UyvSwmAJGgrgkt3WJeNa86`, `collection` `seo`, `doc_id` = repo. Read it first (`get`); replace it with `set` and `if_version`, or create it with `set`. If the write is refused, say so in one line in the wrap-up.

**Search Console and Bing access, per site** (Nicky's part; Claude writes the handover):
- **ONE sets it up:** a Search Console Domain property `sc-domain:<domain>`, verified with a DNS TXT record (easiest when the domain is on ONE's Cloudflare). Add the service account (its email is in the one-seo-reports README) as a **Restricted** user. In Bing Webmaster Tools, **Import from Google Search Console**. Submit `https://<domain>/sitemap-index.xml` in both.
- **The client already has Search Console:** keep their property; it holds their history, and a new property would start empty. Ask the owner to add ONE's Google account as **Full** user and the service account as **Restricted** (Settings, Users and permissions, Add user). Or, if the domain's DNS is on ONE's Cloudflare, Nicky verifies ONE as a second owner of the same property with ONE's own TXT record: the client keeps theirs and both see the same data.
- **Moving DNS to Cloudflare:** copy every `google-site-verification=` and Bing (`msvalidate`/CNAME) verification record across with the others, or the client loses verification.
- **The client already has Bing:** ask them to add ONE's Bing account (Settings, User management, Read-only is enough), or ONE adds the site in its own account too; each verified user sees the same data.
- **Old site replaced by the new one:** keep the same properties. Never remove the old property or its sitemap before the redirects are live.
