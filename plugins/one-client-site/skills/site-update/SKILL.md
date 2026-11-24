---
name: site-update
description: Change a ONE client website, before or after launch. Content changes (words, photos, pages, menu, contact details) are made in Sanity, by the editor or by Claude with a yes before publishing on a live site; design and code changes go to the staging check link first, then to the live site after a clear yes. Also opens an existing site's folder, checks why a publish failed, reads contact form messages, and changes settings like the enquiry email. Use when someone says "update the Dalton site", "change the text on the about page", "add a page", "send it to staging", "publish to the live site", "the site didn't update", "work on the UnBread site", or "change where the form emails go".
---

# Update a client site

Read `references/house-rules.md` and `references/commands.md` first.

## 0. Find the site

If this session isn't on a `-site` folder: list the client sites, ask which (question box), then clone it into `<base>` if it isn't there, or `git pull --ff-only` on `staging` if it is. `npm ci` if `node_modules` is missing. Read `site.config.js` for the worker name, languages and Sanity project.

Live or not? Live once `main` has deployed and `SITE_URL` is set in production (`gh variable list --env production`). Say which in one line.

## 1. Which kind of change

- **Content** (words, photos, a page made of existing sections, the menu, contact details, search descriptions): **Job A**.
- **Design or code** (a new kind of section, layout, styles, a new feature): **Job B**.
- **Settings** (form recipient, Turnstile, analytics, domain): **Job C**.
- **Something didn't update / a publish failed:** **Job D**.
- **Form messages:** **Job E**.

## Job A: content in Sanity

Tell the user they (or the client) can do this themselves at `<site>/admin`, and offer to do it. If Claude does it:
1. Find the document (`query_documents`), make the change as a patch, and show the before/after in a short list. Change every language that needs it; for translations, say they're Claude's draft.
2. Before launch: publish, and say the check link rebuilds in about two minutes.
3. **After launch, publishing changes the live site:** ask "This updates the live site `<address>`. Publish?" — "Yes, publish" / "Not yet". With "Not yet", leave it as a draft and say where to find it in the Studio.
4. Check the page once the rebuild finishes (`gh run list --limit 1`).

A new page made from existing sections is content too: create `page-<name>-<lang>` (and its translation link), add it to the Menu if it should be there.

## Job B: design or code

1. Work on the `staging` branch (`git checkout staging && git pull --ff-only`). If `main` has commits staging doesn't, merge main into staging first.
2. Make the change following site-build's rules (sections as component + schema + query; client copy in Sanity; logical CSS properties).
3. Build locally and check the pages it touches, at desktop and phone widths.
4. Push to staging, watch, give the check link: "Check it and tell me when it's good to go live, or what to change."
5. **To the live site:** ask "This updates the live site `<address>`. Go ahead?" — "Yes, update the live site" / "Not yet". Then publish staging to main (commands.md), watch, and check the live pages.

New Sanity fields deploy with the code. Content in new fields must be filled and published after the code is live, or the section shows empty: plan that order with the user.

## Job C: settings

Non-secret settings (commands.md → GitHub settings): show the current value, ask for the new one, set it after a yes, then rebuild the branch it affects. Secrets, domains, Turnstile widgets, email sending, the Sanity webhook and logins: write Nicky's handover line.

## Job D: something didn't update

1. `gh run list --limit 5` on the branch. A failed run: read `gh run view <id> --log-failed`, quote the one line that matters, and say who fixes it.
   - Build error after a Sanity publish: usually content the code doesn't expect (an empty required field, a new section type the code doesn't know yet). Find the document and fix the content, or fix the code via Job B.
   - Missing Cloudflare secrets or an expired token: Nicky.
2. No run at all after a Sanity publish: the webhook (wrong ref, expired token). Nicky checks Sanity → API → Webhooks → attempts log. Meanwhile rebuild by hand: `gh workflow run deploy.yml --ref <branch>`.
3. Run succeeded but the page looks old: hard refresh; check the right address (staging vs live).

## Job E: form messages

If `SANITY_WRITE_TOKEN` is set, messages are in the Studio under "Form messages" (query `*[_type == "formSubmission"] | order(receivedAt desc)[0...20]`). Summarise them, flagging any not emailed (`emailed: false`), which means email sending needs attention (Job C). Never forward or reply to them on the user's behalf without a clear yes.

## Wrap up

What changed, where it is (staging or live), the address to check, and anything waiting on Nicky or the client.
