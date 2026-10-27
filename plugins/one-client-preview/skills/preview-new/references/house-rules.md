# ONE client previews: how the system works and the house rules

Read this before running any command for a preview task.

## How the system works

```
Claude Code session on the designer's computer
   └─ preview folder (e.g. C:\GitHub_Local)
        └─ <client>-preview/     ← one folder per client, linked to GitHub
             site/               ← the website, built and edited here
                │  git push
                ▼
GitHub repo ONE-Creative-Agency/<client>-preview
                │  GitHub Actions "Deploy preview" (about a minute)
                ▼
Firebase project one-client-pages  (nobody logs in to Firebase)
```

- Every preview is its own **private GitHub repo** in the **ONE-Creative-Agency** org, created from the template **ONE-Creative-Agency/preview-template**. The name **must end in `-preview`** (e.g. `dalton-preview`, `dalton-2710-preview`); GitHub refuses to deploy anything else.
- The repo's folder on the designer's own drive (never the NAS or a synced folder) is **where the site gets built**. GitHub is the shared copy and keeps every version. After each publish to the client link, a dated copy of the site goes into the job's `03_Work Files` folder on the NAS, for the job record. Claude edits `site/` directly in it. There is no exporting and no zips, except when finished files already exist somewhere else and need bringing in once.
- Inside the repo:
  - `site/` holds the website. `site/index.html` must exist.
  - `preview.json` holds the settings: `client`, `siteId` (the Firebase site, which becomes the link), `passcode` (true/false), `credit`, and `gate` (how the passcode page looks).
  - `CLAUDE.md` and `.claude/settings.json` carry these rules into any Claude Code session opened on the folder.
  - `tools/` and `.github/` are ONE's publishing machinery. **Never edit them.**
  - `public/`, `firebase.json` and `.firebaserc` are generated on GitHub. Never commit them; `.gitignore` already excludes them.
- **Two branches, two links:**
  - **`staging`** gives the studio check link, `https://<siteId>--staging-<code>.web.app`. It expires 30 days after the last push to staging. **Never give it to the client.**
  - **`main`** gives the **client link**, `https://<siteId>.web.app`. Pushing to main changes what the client sees.
- **Passcode:** it is stored only in the repo secret `PREVIEW_PASSCODE`. Never write it into any file, commit message or `preview.json`. If `passcode` is true and the secret is missing, GitHub stops instead of publishing the site unlocked. Updates with the same passcode don't make visitors re-enter it; a new passcode does.
- **Access:** studio staff are in the GitHub team **Studio**, which gets Write on every preview repo. The creator of a repo is its admin, and only admins can set the passcode.

## House rules (non-negotiable)

1. **Run commands with Claude Code's own Bash tool** on the user's computer. On Windows this is Git Bash, so use the bash commands in `commands.md`; switch to PowerShell only where it says so.
2. **Confirm before anything the client will see**, which means any push to `main`. Say plainly "This updates the client link `https://….web.app`" and wait for a clear yes in the chat.
3. **Never** force-push, reset hard, delete a repo, delete a branch on GitHub, delete a Firebase site, or change repo settings other than setting the `PREVIEW_PASSCODE` secret and adding the Studio team to a new preview. If one of these is needed, tell the user to ask Nicky.
4. **Never run Firebase commands locally.** Publishing happens only on GitHub.
5. **Only touch repos in ONE-Creative-Agency whose name ends in `-preview`.** Never edit `tools/` or `.github/` in them.
6. Keep command output out of the chat. Summarise it in a line.
7. When something fails, quote the one line of the error that matters, say what it means in plain words, and say who fixes it (the user, or Nicky). Don't retry the same failing command more than once.
8. **Job folders on the NAS are read-only except for one thing:** after a publish to the client link, add a new dated copy of the site under `03_Work Files/Website preview/`. Never delete, move or overwrite anything there. Never put the project folder itself on the NAS or in a synced folder.
9. Explain in plain language. The person is a designer, not a developer. Introduce each technical word once ("a branch is a separate line of work in the repo").

## Asking the user

- **Every question goes in a question box** (the AskUserQuestion tool), **one question per box**. Wait for the answer before asking the next. Never list several questions in a chat message for the user to answer in the reply box.
- Give 2–4 concrete options, with the recommended one first and marked "(Recommended)". The box always lets the user type their own answer, so don't add an "Other" option.
- Make the options real: detected folders, suggested names, the client you've inferred. For example, for "where are the files?", offer the folders you found that contain an `index.html`.
- Skip any question the user's message already answered, and say in one line what you took from it ("Client: Dalton Foundry, credit: Small Circle").
- Use a question box for the "go ahead?" before a push to `main` too: options "Yes, publish to the client link" / "Not yet".
- Only ask in plain chat when the answer is long free text that no option could cover (e.g. a brief for the site).

## Who to ask

Nicky (Head of Operations) owns the GitHub org, Firebase and these settings. Send people to her for: org invites, joining the Studio team, access to a preview the Studio team isn't on, passcode changes on a repo they didn't create, custom domains (e.g. `client.oneagency.one`), deleting previews.
