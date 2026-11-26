---
name: site-launch
description: Take an approved ONE client website live on the client's own domain. Runs the pre-launch checks, collects the contact-form recipient, prepares Nicky's handover for the domain and DNS (moving the domain to Cloudflare, or records at the client's DNS host), email sending, Turnstile spam protection, analytics and Search Console / Bing access, takes an SEO baseline of any old site, adds the domain to the site, sets the launch settings, switches Sanity publishing to the live site, and publishes staging to main after a clear yes. Use when someone says "go live", "launch the site", "put it on the client's domain", "connect the domain", or "set up the contact form email".
---

# Launch a client site

Read `references/house-rules.md` and `references/commands.md` first. Launch has steps only Nicky can do; this skill prepares them, does the rest, and publishes only after a clear yes. It can be run in parts: check what's already done (GitHub variables and secrets lists, `wrangler.jsonc` routes, the live address) and pick up from there.

## 1. Pre-launch checks (report as a list: done / missing)

- The client approved the staging site (ask).
- No "Need image" placeholders or "Client name" leftovers: build, then `grep -rl "Need image\|Client name\|example.com" dist --include=*.html`.
- Every page has a search title and description (query pages missing `seoTitle`/`seoDescription` in each language). Offer to write the missing ones (≤60 and ≤155 characters, in the brand's voice, without keyword stuffing).
- Other languages: native review done (ask).
- Contact form sends on staging (needs step 3 settings; otherwise mark as pending).
- Share images, favicon and the 404 page look right.
- Legal pages the client needs (privacy policy, terms) exist, if the site collects data or sells.
- **Old site baseline** (the domain has a site now): make sure it is in the SEO reports with its current address and has a report (commands.md → SEO reports; add it to `sites.json` and run the report if not). Compare the old site's page list (`sections.audit.pages` in its latest report) with the new site's pages and write the redirects for every old address that changes into `astro.config.mjs` now, so they go live with the site.

## 2. The details

One question per box:
1. **Domain:** e.g. `client.com`. Ask whether the site should answer on `www.` too (recommended: both, with one redirecting to the other).
2. **Where the domain's DNS is managed now**, with the explanation in the question:
   - **Move it to ONE's Cloudflare (Recommended):** the client changes two nameservers at their registrar; Cloudflare then handles the site, email sending and analytics automatically. Their existing email records are copied over.
   - **Keep it where it is:** the client (or their IT) adds records ONE gives them. Needs Nicky's one-time Cloudflare for SaaS setup; the bare domain must redirect to `www.` at their DNS host.
3. **Contact form recipient(s):** e.g. `info@client.com`, and the sender address (`website@<domain>` recommended).
4. **Search Console and Bing:** "Does the client already use Google Search Console or Bing Webmaster Tools for this domain?" — "Yes, they have it" / "No, ONE sets it up" / "Not sure". With "Not sure", Nicky checks with the workflow's access check and asks the client (commands.md → SEO reports). An existing account is always kept, never replaced.

## 3. Nicky's handover

Write the checklist (names only, no keys):

> **Launch: <Client>** (`<repo>`, domain `<domain>`)
> 1. **DNS:** *[moving]* add `<domain>` to ONE's Cloudflare, check the imported records (MX, SPF, other services), send the client the two nameservers, wait for "Active". *[keeping]* add `www.<domain>` as a custom hostname (Cloudflare for SaaS) and send the client the CNAME and verification records; the client redirects the bare domain to `www.`.
> 2. **Email Sending:** onboard `<domain>` (Cloudflare → Email Service → Email Sending); with DNS elsewhere, send the client the SPF/DKIM records too.
> 3. **Turnstile:** a widget for `<domain>`, `www.<domain>`, `<repo>-staging.one-agency.workers.dev` and `<repo>.one-agency.workers.dev`. Secret key → GitHub secret `TURNSTILE_SECRET` in both environments; give the site key (public) to the designer.
> 4. **Form copies in Sanity (optional):** a Sanity token with Editor rights → GitHub secret `SANITY_WRITE_TOKEN`, both environments.
> 5. **Web Analytics:** automatic once the domain is on Cloudflare; otherwise add the site and give the designer the token (public). Either way, send the designer the site tag for the SEO report.
> 6. **Search Console and Bing:** *[ONE sets it up]* Domain property `sc-domain:<domain>` by DNS record, service account added as Restricted, Bing imported from Search Console. *[client has it]* ask the client's owner to add ONE's Google account (Full) and the service account (Restricted), and ONE's Bing account (Read-only); if DNS moves to Cloudflare, copy their verification records across. Then run the SEO workflow's access check.

## 4. Settings Claude sets (after the user's yes)

With the values from step 2 and Nicky's public keys, set the GitHub variables (commands.md → GitHub settings): `CONTACT_TO`, `CONTACT_FROM`, `TURNSTILE_SITE_KEY` in both environments; `SITE_URL=https://<domain or www.domain>` and, if needed, `CF_ANALYTICS_TOKEN` in production. Add the domain and `www.` to Sanity's CORS addresses.

## 5. Connect the domain (DNS moved to Cloudflare)

Once Nicky says the domain is Active, add to `wrangler.jsonc` at the top level (not in `env.staging`):
`"routes": [{ "pattern": "<domain>", "custom_domain": true }, { "pattern": "www.<domain>", "custom_domain": true }]`
The deploy creates the DNS records. Ask Nicky for a redirect rule from the address that isn't `SITE_URL` to the one that is. (DNS kept elsewhere: Nicky's custom hostname setup replaces this step.)

## 6. Go live

1. Refresh ONE's shared files (commands.md → Shared files), send the launch changes to staging and test the contact form there end to end: a real message must arrive at the recipient (ask the user to check the inbox).
2. Set `rebuildBranch: 'main'` in `site.config.js` (from now on, Sanity publishes rebuild the live site), commit it on staging.
3. Ask in a question box: "This publishes the site at `https://<domain>` for everyone. Go ahead?" — "Yes, go live" / "Not yet". With "Not yet", set `rebuildBranch` back to `'staging'` and push staging, so Sanity publishes keep updating the check link.
4. Publish staging to main (commands.md), watch the run, then check `https://<domain>`, `www.`, a missing page (404), `/sitemap-index.xml`, `/robots.txt` (must allow crawling) and the form.
5. Test rebuild on publish once more (publish a small change in Sanity, see a run start on `main`, undo it), and tell the user: from here on, **publishing in Sanity changes the live site.**

## 7. After launch

- **Adobe Fonts:** if the site uses a kit (`grep -rhoE 'use\.typekit\.net/[a-z0-9]+\.css' src`), remind the user to add `<domain>` and `www.<domain>` to the kit's web project domains.
- **Search engines:** once Nicky's step 6 is done, submit `https://<domain>/sitemap-index.xml` in Search Console and Bing (Nicky, or whoever has Full access), and in Search Console use **URL inspection → Request indexing** on the home page.
- **SEO reports:** update the site in `sites.json` (live `url`, `searchConsole`, `bing`, `cloudflareSiteTag`), push, run the report and put it on the board's SEO tab (commands.md → SEO reports). From now on it updates every month.
- **Redirects:** open three old addresses from the baseline on the live domain and check they land on the right new pages.

## 8. Wrap up

First update the sites board (commands.md → Sites board): `stage: "live"` and `liveUrl` after going live; with "Not yet", keep `"staging"` and set `paused` if the client asked to wait. List what still waits on Nicky or the client.

- Live address, editor address (`/admin`), where enquiries go.
- What's still waiting on Nicky or the client.
- "From now on, changes go through **site-update**: content in Sanity goes live when published; design changes go via staging."
