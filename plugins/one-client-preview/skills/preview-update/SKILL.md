---
name: preview-update
description: Publish work on an existing ONE client website preview from Claude Code. Sends what changed in the client's folder to the studio-only staging link, publishes staging to the client link, brings in files made elsewhere, opens a preview's folder to work on, or changes the passcode. Use when someone says "send it to staging", "put this on staging", "let me see it online", "publish to the client", "publish staging", "update the <client> preview", "here's R17 for Dalton", "work on the <client> preview", or "change the passcode".
---

# Send to staging, publish, and other updates

Read `references/house-rules.md` and `references/commands.md` first.

## 1. Which preview?

- **Session opened on a preview folder** (the working folder has `preview.json` and a `.git` folder): that's the preview. Read `preview.json` for the client and `siteId`.
- **Otherwise:** match the client the user named against the org's `-preview` repos. If the repo isn't in `<base>`, clone it, saying "I'm making a linked copy of the <client> project on your computer." If no repo fits, switch to **preview-new**.
- Check access: `permissions.push` must be true. If not: "You don't have access to update <repo> yet. Ask Nicky to add you to the Studio team, or to add the Studio team to this preview." (`admin` is only needed for passcode changes.)
- If the user is mainly going to keep building, tell them once: "For the smoothest work on this site, open a Claude Code session on `<repo>`."

## 2. What's the job?

- **A. Send to staging** (most common): put what's changed on the studio check link
- **B. Publish staging to the client link**
- **C. Bring in files made elsewhere** (a folder or zip), then do A
- **D. Change the passcode**
- **E. Copy the published site to the job folder** (automatic after B, or on request: "copy the published site to the job folder")

When the user just says "update the <client> preview" without saying how, ask whether the changes are already in the folder or the files are somewhere else.

## Job A: send to staging

1. `git fetch origin`, then look at where things stand: the current branch, `git status --short`, and whether `origin/staging` has commits that aren't on `origin/main`.
2. **Get onto staging without losing anything:**
   - On `staging` already: carry on. If `origin/staging` is ahead of the local branch, `git pull --ff-only origin staging` first.
   - On `main` with edits: move them to staging (commands.md → Edits made while on main).
   - No staging branch yet: `git checkout -b staging` from the current main with the edits.
   - `origin/staging` holds someone else's unpublished work: show their commit messages, and say your changes will go on top of theirs. If that's a problem, ask Nicky.
3. **First push for this preview?** If `preview.json` still has the default `gate` (empty logo, background `#14161a`) and `passcode` is true, do the branding from **preview-new** step 5. If `gh secret list --repo …` doesn't show `PREVIEW_PASSCODE`, do preview-new step 6 (needs admin).
4. **Review the change:** `git status --short` and `git diff --stat`. Summarise: X pages changed, Y added, Z removed, naming the pages. Flag anything odd: a missing `site/index.html`, files changed outside `site/` other than `preview.json`, or lots of removals.
5. If Node is installed, run the local check and report broken-link warnings, grouped.
6. Ask for a short label if the user hasn't given one ("R17", "contact page fixes"), and commit: `<Client>: <label>`.
7. `git push -u origin staging`. Watch the run, get the staging link, and say: "Check the changed pages on this studio-only link (enter the passcode if asked). Tell me when it's good to publish to the client, or what to change."

**Straight to main instead?** Only if the user asks. Explain once that it skips the check link and goes directly to the client. Then confirm "This updates the client link https://<siteId>.web.app. Go ahead?", commit on main, push, watch, and give the link, then do Job E.

## Job B: publish staging to the client

1. `git fetch origin`, and show what will be published: `git log --oneline origin/main..origin/staging`. If it's empty, say staging already matches the client link.
2. If there are uncommitted edits, ask whether they're meant to be in this publish. If yes, do Job A first and have them check the staging link.
3. Confirm: "This updates the client link https://<siteId>.web.app with: <commit labels>. Go ahead?"
4. Publish (commands.md → Publish staging to the client). If the fast-forward fails, follow the recovery note. Watch the run and give the client link.
5. Mention that people who already entered the passcode won't be asked again.
6. **Copy to the job folder** (Job E).

## Job C: bring in files made elsewhere

1. Find the zip or folder, and its site root (where `index.html` is, or the HTML files).
2. Ask: "Is this the **whole website**, or **only the files that changed**?"
   - **Whole site:** mirror it into `site/`. Pages that aren't in the new set get removed.
   - **Changed files only:** copy over the top. Nothing is removed.
   Check the answer against the files (a whole site has `index.html` and roughly as many files as `site/` now has) and say what you see.
3. Get onto staging first (Job A step 2), then copy (commands.md → Bringing in files), then continue with Job A from step 3.

## Job D: change the passcode

1. Needs `admin`. Without it, send the user to Nicky.
2. Warn them: "Everyone with the current code will need the new one."
3. Agree the new passcode, set the secret, then re-run the deploy on `main` (and on `staging` if it exists). Watch the runs.
4. Remind them to update the passcode wherever the job keeps it.

## Job E: copy the published site to the job folder

After every successful publish to the client link (never after staging):
1. Read the saved job folder (commands.md → Copy to the job folder). If none is saved, ask: "Where's the <client> job folder on the NAS? Paste the path, e.g. `Z:\Clients\Dalton Foundry\DF26012 Website`." Check that its `03_Work Files` folder exists. If it doesn't, show what is there and ask; don't create `03_Work Files` without a yes. Save the path for this project.
2. Copy `site/` to `03_Work Files/Website preview/<date> <label>`, write `PUBLISHED.txt`, and check the file count matches.
3. Tell the user where it went in one line. If the NAS isn't reachable (drive not mapped, off-site), say so and offer to do it next time; the publish itself is done either way.

## Wrap up

Two to four lines: what changed, which link(s) it's on, and whether staging has anything the client link doesn't.
