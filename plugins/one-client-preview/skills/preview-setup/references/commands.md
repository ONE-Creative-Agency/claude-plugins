# Command reference (Claude Code Bash: Git Bash on Windows, zsh/bash on a Mac)

All commands below are bash and work on both. Paths: on Windows, Git Bash accepts `C:/GitHub_Local` or `/c/GitHub_Local`. Quote paths with spaces.

Work out the OS once: `uname -s` (`MINGW…`/`MSYS…` = Windows, `Darwin` = Mac).

`<base>` is the user's preview folder, saved in git config. Read it with:
`git config --global --get one.previewFolder`

`<repo>` is the folder `<base>/<name>-preview`. Run repo commands as `cd "<repo>" && …` in one call, because the working folder may reset between calls.

## Checks

| What | Command |
|---|---|
| Git | `git --version` |
| GitHub CLI | `gh --version` |
| GitHub login | `gh auth status` |
| Who is logged in | `gh api user --jq .login` |
| Org membership | `gh api user/memberships/orgs/ONE-Creative-Agency --jq .state` (`active` = good, `pending` = invite not accepted, 404 = not invited) |
| Accept a pending invite | `gh api -X PATCH user/memberships/orgs/ONE-Creative-Agency -f state=active` |
| Studio team | `gh api orgs/ONE-Creative-Agency/teams/studio/memberships/$(gh api user --jq .login) --jq .state` (`active` = in the team) |
| Node (optional, for local checks) | `node --version` |
| Git name / email | `git config --global user.name` · `git config --global user.email` |

## Installing (only with the user's OK)

| Tool | Windows | Mac |
|---|---|---|
| GitHub CLI | `winget install --id GitHub.cli -e --source winget --accept-package-agreements --accept-source-agreements` | `brew install gh` (no Homebrew: send them to https://cli.github.com) |
| Node (optional) | `winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements` | `brew install node` |

On Windows a newly installed tool isn't on the PATH until Claude Code restarts. Try `"/c/Program Files/GitHub CLI/gh.exe" --version`. If that works, use that full path for the rest of the session. Otherwise ask the user to close and reopen the Claude Code session in the same folder.

## GitHub login

Run in the background (Bash tool with `run_in_background: true`):
`gh auth login --hostname github.com --git-protocol https --web`

Read its output with BashOutput. It prints a **one-time code** (`XXXX-XXXX`) and the address `https://github.com/login/device`. Show both to the user in bold, and tell them to open the address, paste the code and click **Authorize**. Check BashOutput until it says "Logged in as …". Then run:
`gh auth setup-git`
so `git push` uses the same login.

## Repos

| What | Command |
|---|---|
| List the org's previews | `gh repo list ONE-Creative-Agency --limit 200 --json name --jq '.[].name' \| grep -- '-preview$'` |
| Create a new preview | `cd "<base>" && gh repo create ONE-Creative-Agency/<name>-preview --template ONE-Creative-Agency/preview-template --private --clone` |
| Give the Studio team Write (needs admin, which the creator has) | `gh api -X PUT orgs/ONE-Creative-Agency/teams/studio/repos/ONE-Creative-Agency/<name>-preview -f permission=push` |
| Clone an existing preview | `cd "<base>" && gh repo clone ONE-Creative-Agency/<name>-preview` |
| My permission | `gh api repos/ONE-Creative-Agency/<name>-preview --jq .permissions` (`push` to update, `admin` to set the passcode) |

If a fresh template clone has no `site/` yet, GitHub was still copying the template. Wait 5 seconds, then `cd "<repo>" && git pull`.

## Branch work (prefix each with `cd "<repo>" && `)

| What | Command |
|---|---|
| Get up to date | `git fetch origin` |
| Which branch am I on | `git branch --show-current` |
| Unpublished work on staging? | `git log --oneline origin/main..origin/staging` (empty = staging matches main; error = no staging yet) |
| Start staging fresh from main | `git checkout -B staging origin/main` (only with no uncommitted changes) |
| Switch to existing staging, keeping local edits | `git checkout staging` (if it doesn't exist locally: `git checkout -b staging --track origin/staging`) |
| What changed | `git status --short` · counts: `git diff --stat` |
| Commit everything | `git add -A && git commit -m "<message>"` |
| Push staging | `git push -u origin staging` |
| Publish staging to the client | `git checkout main && git pull --ff-only origin main && git merge --ff-only staging && git push origin main && git checkout staging` |

**Edits made while on `main`.** If the user has been building on `main` (a new repo starts there), move the work to staging without losing it: `git checkout -b staging` (or, if staging exists, `git stash && git checkout staging && git stash pop`), then commit there.

If `merge --ff-only` fails, main has moved since staging started. Run `git checkout staging && git merge origin/main`, push staging, re-check the staging link, then publish.

## Bringing in files that already exist (only when the site was made elsewhere)

Find where `index.html` sits; that folder is the **site root**. Copy its contents into `site/`, not the folder around it. Skip `__MACOSX`, `.DS_Store`, `Thumbs.db`.

| What | Command |
|---|---|
| Unzip (Windows) | `powershell -NoProfile -Command "Expand-Archive -LiteralPath '<zip>' -DestinationPath \"$env:TEMP\\one-preview-in\" -Force"`, then the files are in `$TEMP/one-preview-in` (Git Bash: `"$TEMP/one-preview-in"`) |
| Unzip (Mac) | `rm -rf /tmp/one-preview-in && unzip -q "<zip>" -d /tmp/one-preview-in` |
| Find index.html | `find "<folder>" -name index.html -not -path '*/__MACOSX/*'` |
| **Whole site**: replace site/ exactly | `cd "<repo>" && find site -mindepth 1 -delete && cp -R "<site root>/." site/` |
| **Changed files only**: copy over the top | `cd "<repo>" && cp -R "<site root>/." site/` |
| Tidy up | `cd "<repo>" && find site \( -name .DS_Store -o -name Thumbs.db -o -name __MACOSX \) -prune -exec rm -rf {} +` |

## Local check before pushing (only if Node is installed)

`cd "<repo>" && PREVIEW_PASSCODE=local-check-123 node tools/build.js; rm -rf public firebase.json .firebaserc`

"points to a missing file" warnings mean a broken image or link. Show them grouped by page and ask whether to continue.

## Passcode secret (needs admin)

`gh secret set PREVIEW_PASSCODE --repo ONE-Creative-Agency/<name>-preview --body "<passcode>"`

To re-publish after a passcode change: `gh workflow run deploy.yml --repo ONE-Creative-Agency/<name>-preview --ref main` (and `--ref staging` if staging exists).

## Watching the publish and getting the link

1. About 10 seconds after the push: `gh run list --repo ONE-Creative-Agency/<name>-preview --branch <branch> --limit 1 --json databaseId,status,conclusion,createdAt`
2. If no run started within about 30 seconds: `gh workflow run deploy.yml --repo ONE-Creative-Agency/<name>-preview --ref <branch>`, then list again.
3. Wait for it: `gh run watch <id> --repo ONE-Creative-Agency/<name>-preview --exit-status` (about 1 minute).
4. The link: `gh run view <id> --repo ONE-Creative-Agency/<name>-preview --log | grep 'PREVIEW_URL=https'`
5. On failure: `gh run view <id> --repo ONE-Creative-Agency/<name>-preview --log-failed | tail -30`

| Error contains | Means | Who fixes |
|---|---|---|
| `PREVIEW_PASSCODE is not set` | Passcode on, no secret | Repo admin sets it, or Nicky |
| `site/index.html is missing` | No home page | Fix the files |
| `"siteId" must be` | Bad name in preview.json | Fix preview.json |
| `403` / `Permission denied` | Google-side permission | Nicky |
| `already exists` / `not available` (site create) | Firebase site name taken | Pick another siteId |
| "template placeholder" (run skipped) | preview.json not filled in | Fill it in |
