---
name: preview-new
description: Start a new ONE client website preview in Claude Code. Creates the client's private GitHub repo from ONE's template and its linked folder on the user's computer, gives the Studio team access, and sets up the passcode page. Then either builds the site in that folder or brings in finished files that already exist, and publishes to staging and the client link. Use when someone says "new client preview", "start a preview for Dalton", "set up a website preview", "put this new site online", or has finished HTML for a client that has no preview yet.
---

# New client preview

Read `references/house-rules.md` and `references/commands.md` first.

## 1. Setup check (silent unless something's missing)

`gh auth status` works, org membership is `active`, and `git config --global --get one.previewFolder` returns a folder. If anything fails, run **preview-setup** first, then come back.

## 2. The details

Ask one question per box, waiting for each answer (house-rules → Asking the user). Skip anything the user already said.

1. **Client.** If it isn't clear from the message, offer the likely names (from their words or the folder) and let them type it.
2. **Where does the website come from?**
   - **Build it here:** Claude builds the pages in the new folder, from an approved design or a brief.
   - **A claude.ai artifact link:** an HTML artifact, or a Claude Design canvas. Ask for the link next.
   - **Files on this computer:** a folder or zip, e.g. from an earlier chat. Next, offer the folders you find with an `index.html` (Downloads, Desktop, Documents, the NAS job folder if they mention one), and let them paste a path. It must be the **whole site** (`index.html` plus all images, styles and scripts). If it's only changed files, stop: a new preview needs the complete site.
3. **Passcode page?** Options: "Yes, passcode page (Recommended)" / "No, open link". The question text explains: "With a passcode, people see a page in the client's branding and must enter a code first. It's light gatekeeping, not real security."
4. **Credit line** on the passcode page: "Prepared by ONE Agency" / "Prepared by Small Circle" / "No credit".

Then propose the names in one question box (options: your suggestion, and one alternative), and confirm:
- **Repo:** `<short-client>-preview`, lowercase with hyphens. It **must end in `-preview`**. If the user suggests a name that doesn't, explain and propose one that does (e.g. `dalton-preview-27-10` → `dalton-2710-preview`).
- **Link:** `one-<repo>` gives `https://one-<repo>.web.app`, e.g. `one-dalton-2710-preview`. 6–30 characters.
- Check the repo name isn't taken (list previews). If it is, ask whether they meant to update that one (switch to **preview-update**) or want a different name.

## 3. Create the project

Say: "I'm creating a private project for <client> on GitHub, from ONE's preview template, and its linked folder on your computer."

1. Create it (commands.md → Repos → Create). Check `site/` arrived; if not, wait and pull.
2. Give the Studio team Write. If that fails with 404, note it for the wrap-up and carry on.
3. Fill in `preview.json`: `client`, `siteId`, `passcode`, `credit`. Leave `gate` for step 5.

## 4. The website

**Artifact link:** follow commands.md → Bringing in a claude.ai artifact.

**Finished files:** copy them in as a whole site (commands.md → Bringing in files → Whole site), then tidy up. Confirm `site/index.html` exists and summarise in one line (pages, images).

**Build it here:** remove the template's placeholder `site/index.html` only when the first real page replaces it. Tell the user:

> Your project folder is `<repo>`. For the best results, start a new Claude Code session on that folder (it picks up ONE's rules automatically) and build the site there: share the approved design or describe the pages. Whenever you want to see it online, say **send it to staging**.

Stop here when building. Publishing is handled by **preview-update** in that session; it brands the passcode page and sets the passcode on the first push if that hasn't happened yet.

## 5. Passcode page branding (passcode on, files present)

Fill `gate` in `preview.json` from the client's own site:
- **Logo:** an SVG or PNG in `site/` that works on a dark background (names with "white", "light", "reversed", "negative"). Path relative to `site/`. None: leave it empty and the client name shows instead.
- **Colours:** the brand's dark colour from the main CSS (variables like `--navy`, `--brand`, `--primary`, or the header/footer background) for `background` and `buttonText`; `#ffffff` for `text` and `button`. Swap them if the brand is light.
- **Fonts:** copy `use.typekit.net` / `fonts.googleapis.com` stylesheet links from `site/index.html` into `fontCss`, and the matching stacks into `fontFamily` / `headingFamily`.
- **Message:** "This preview of the new <Client> website was prepared by <ONE Agency | Small Circle>. Enter the passcode you were sent to view it." With no credit: "This preview of the new <Client> website is private. Enter the passcode you were sent to view it."

If the fonts are Adobe Fonts (`use.typekit.net`), the Adobe Fonts check in step 7 tells whether they'll load on the preview.

Show a four-line summary (logo, colours, fonts, message), then ask in a question box: "Looks right" / "Change something".

## 6. Set the passcode (passcode on)

Ask in a question box with two suggested passcodes (two simple words and a number, e.g. `harbour-light-42`, at least 8 characters). The user can pick one or type their own. Set it (commands.md → Passcode secret). Say: "Keep the passcode with the job in ONE Flow. It isn't stored in the project files, and I won't repeat it."

## 7. Check, then staging or main

1. Run the Adobe Fonts check (commands.md). If Node is installed, run the local check and report broken-link warnings, grouped.
2. Ask in a question box, with the explanation in the question:
   > **Staging (recommended):** a private check link just for the studio. You look it over, then publish it to the client.
   > **Main:** straight to the client link. Only for tiny fixes you're sure of.
   For a brand-new preview, recommend staging.

## 8. Publish

**Staging:** `git checkout -b staging`, commit everything ("<Client>: first version"), push staging, watch the run, get the link. Say: "Check every page on this studio-only link, on desktop and phone, and enter the passcode if asked. Don't send this link to the client. Tell me when it's good to publish, or what to change."

Changes requested: make them in `site/`, commit, push staging again, and send the new check link.

**To the client link:** confirm "This puts the site on the client link https://<siteId>.web.app. Go ahead?", then publish staging to main (commands.md), watch, and give the client link. Then copy the published site to the job folder, following **preview-update** Job E. The first time, Claude asks for the job's folder on the NAS.

## 9. Wrap up

- **Client link:** https://<siteId>.web.app. Send it to the client, and send the passcode separately.
- **Staging link:** studio only, expires 30 days after the last staging push.
- **Job folder copy:** where the published site was saved under `03_Work Files`.
- **Project folder:** `<repo>`. "Next time, open Claude Code on this folder, make the changes, and say *send it to staging*."
- Any notes: the Studio team couldn't be added (tell Nicky), or an Adobe Fonts kit still blocked.
- A custom address like `client.oneagency.one` is Nicky's job.
