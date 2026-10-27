# ONE client preview (Claude Code plugin)

Lets ONE studio staff build client websites in a linked project folder and put them online as private previews.

## Skills
- **preview-setup**: once per computer. Installs the GitHub CLI, logs in to GitHub, checks ONE-Creative-Agency and the Studio team, and sets the preview folder.
- **preview-new**: a new client preview. Creates the repo from `ONE-Creative-Agency/preview-template` with its linked folder, gives the Studio team access, and sets up the passcode page. Then the site is built in the folder, brought in from finished files, or taken from a claude.ai artifact link (HTML artifact or Claude Design canvas).
- **preview-update**: "send it to staging", "publish to the client", bringing in files made elsewhere, passcode changes.

## Needs
- Claude Code (desktop app Code tab or terminal). On Windows it brings Git with it.
- A GitHub account in **ONE-Creative-Agency**, ideally in the **Studio** team.

## Links
- `staging` → studio-only check link `https://<siteId>--staging-<code>.web.app` (expires 30 days after the last push)
- `main` → client link `https://<siteId>.web.app`; each publish also saves a dated copy to the job folder on the NAS (`03_Work Files/Website preview/`)

Publishing runs on GitHub Actions with a keyless login to the Firebase project `one-client-pages`. Studio how-to: https://claude.ai/artifact/HvFBWRbBwt2SjyZcAC7wvK

Owner: Nicky.
