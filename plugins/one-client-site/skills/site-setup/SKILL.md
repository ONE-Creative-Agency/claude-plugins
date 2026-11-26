---
name: site-setup
description: First-time setup for ONE client production websites in Claude Code, once per computer. Checks everything the site skills need and installs or connects what's missing, asking first - Git, the GitHub CLI and login, ONE-Creative-Agency and the Studio team, Node 22+, the Sanity connector for ONE's Sanity organisation, the Sanity login for publish rebuilds, and the projects folder. Use when someone says "set me up for client websites", "site setup", "one site init", "get my computer ready for site-new", "I've never built a production site", or when site-new, site-build, site-launch or site-update finds something missing.
---

# Site setup (once per computer)

Get this computer ready for **site-new**, **site-build**, **site-launch** and **site-update**. Read `references/house-rules.md` and `references/commands.md` first. Safe to run again at any time: it only fixes what's missing.

## 1. Say what's about to happen

Roughly: "I'll check your computer has what client websites need: GitHub, Node, and access to ONE's Sanity. I'll install or connect what's missing and ask before installing anything. About ten minutes the first time."

## 2. Check everything (no changes yet)

Run each check (commands.md → Checks and Sanity), then show one line per item, ✅ ready / ❌ missing / ⚠️ needs Nicky:

| Item | Check |
|---|---|
| Git | `git --version` (on a Mac this may open a box offering the developer tools: tell the user to click **Install**) |
| GitHub CLI and login | `gh auth status` |
| Git name and email | `git config --global user.name` and `user.email` |
| ONE-Creative-Agency | org membership `active` |
| Studio team | team membership `active` |
| Node 22 or newer | `node --version` |
| Projects folder | `git config --global --get one.siteFolder`, else `one.previewFolder` |
| Sanity connector | the Sanity MCP tools are available and `list_organizations` returns without asking for authorisation |
| ONE's Sanity organisation | `list_organizations` includes `oubftl5le` |
| Sanity login (for rebuild on publish) | `cd "<base>" && npx -y sanity@latest projects list` prints a table (not "You must login first") |

If everything is ✅, say so in one line, then go to step 8.

## 3. GitHub (Git, GitHub CLI, login, name, organisation, Studio team)

If the **preview-setup** skill (one-client-preview plugin) is available, run it for these items: it's the same setup previews use. Otherwise:
- Ask once (question box, naming what's missing): "Yes, install them" / "Not now". Install with the commands in commands.md → Checks. If Windows asks "Do you want to allow this app to make changes?", tell the user to click **Yes**. A new install needs Claude Code restarted on Windows (commands.md).
- Log in: `gh auth login --hostname github.com --git-protocol https --web` in the background. Show the **one-time code** and **https://github.com/login/device** in bold, wait for "Logged in as …", then `gh auth setup-git`.
- Name and email missing: offer the ones from `gh api user --jq '.name,.email'` in a question box, then `git config --global user.name "…"` and `user.email "…"`.
- Organisation 404: "Send Nicky your GitHub username **<login>** and ask to be invited to ONE-Creative-Agency and the Studio team." `pending`: accept it with `gh api -X PATCH user/memberships/orgs/ONE-Creative-Agency -f state=active`, after telling the user.

## 4. Node

Missing or older than 22: ask, then install (commands.md → Checks). Node builds the site on this computer so pages can be checked before they go online.

## 5. Sanity connector

Sanity is where each client's pages and photos live; Claude uses its connector to create the project and fill in the content.
- **Tools not available, or asking for authorisation:** tell the user: "In Claude, open **Customize → Connectors**, find **Sanity**, click **Connect** and log in with your work Sanity account. When it asks which organisation, pick **ONE Creative Agency**. Then start a new Claude Code session in the same folder and say **site setup** again." Claude can't connect it for them.
- **Connected but `oubftl5le` isn't listed:** ⚠️ "Ask Nicky to invite **<your Sanity email>** to ONE's Sanity organisation with the **Developer** role (it can create projects). Accept the email, then run site setup again." Never create client projects in a personal organisation.

## 6. Sanity login on this computer

Needed once, so the site's "Rebuild site" webhook can be set up (publishing in Sanity then updates the site).
`cd "<base>" && npx -y sanity@latest login` in the background. It opens the browser: the user picks the **same login** as the connector (Google, GitHub or email). Wait until it says "Login successful", then repeat the check.

## 7. Projects folder

If no folder is saved: explain "each client site gets its own folder, linked to GitHub, inside one parent folder". Ask in a question box: `C:\GitHub_Local` (Recommended) on Windows, `~/GitHub_Local` on a Mac, or another path. **Never** the NAS or a Google Drive, Dropbox, OneDrive or iCloud folder (syncing fights with Git). Create it and save it: `git config --global one.siteFolder "<path>"` (Windows: the `C:/GitHub_Local` form).

## 8. Done

Three or four lines: what's ready, anything still waiting on Nicky (and the exact message to send), anything skipped with "Not now". Then:
- "To start a client's production site, say **new client website**."
- "To work on an existing one, open Claude Code on its folder in <base> and say what to change."
