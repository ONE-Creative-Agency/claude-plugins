---
name: preview-setup
description: First-time setup for ONE client website previews in Claude Code. Installs the GitHub CLI, logs the user in to GitHub, checks ONE-Creative-Agency org and Studio team membership, and sets the preview folder. Use when someone says "set me up for client previews", "first time setup", "I've never done a preview", or when preview-new or preview-update finds setup missing.
---

# Preview setup (once per computer)

Get this computer ready to build and publish client previews. Read `references/house-rules.md` and `references/commands.md` first.

## 1. Say what's about to happen

Keep it short, roughly:

> I'll get your computer ready for client previews: check the GitHub tool is installed, log you in to GitHub, check you're in ONE's GitHub organisation and the Studio team, and pick a folder for client projects. About ten minutes. I'll ask before installing anything.

## 2. Check what's there

Run the Checks from commands.md, then report one line per item: ✅ ready / ❌ missing.
- Git (always there on Windows, because Claude Code needs it; on a Mac, `git --version` may open a macOS box offering to install the developer tools: tell the user to click **Install**)
- GitHub CLI (`gh`)
- GitHub login
- Git name and email
- ONE-Creative-Agency membership, and the Studio team
- Node (optional; lets Claude check pages for broken images before publishing)
- Preview folder saved (`one.previewFolder`)

If everything is ✅, say so and stop.

## 3. Install what's missing

Ask once in a question box, naming the tools: "Yes, install them" / "Not now". Use the install commands in commands.md. If Windows shows "Do you want to allow this app to make changes?", tell the user to click **Yes**. If the tool isn't found after installing, follow the PATH note in commands.md.

## 4. GitHub login

Explain once: "GitHub stores each client's website and publishes it for us."

1. If they have no account, send them to `https://github.com/signup` with their work email, and wait.
2. Log in following commands.md → GitHub login. Show the code and the address in bold.
3. Confirm with `gh api user --jq .login`, then run `gh auth setup-git`.

## 5. Git name and email

If they're not set, offer the name and email from their GitHub account (`gh api user --jq '.name,.email'`) in a question box, or let them type them. Then set them:
`git config --global user.name "<Name Surname>"` · `git config --global user.email "<email>"`

## 6. Organisation and Studio team

- Org `active`: good. `pending`: accept the invite with the PATCH command, after telling the user. 404: stop and say: "Send Nicky your GitHub username **<login>** and ask her to invite you to ONE-Creative-Agency and the Studio team. Tell me when you've accepted the email."
- Studio team not active: say "Ask Nicky to add **<login>** to the Studio team. Until then you can only update previews you create yourself." Carry on; this doesn't block setup.

## 7. Preview folder

Explain: "Each client gets its own folder on your computer, linked to GitHub. They all live in one parent folder, and you open Claude Code on a client's folder to work on that site."

- Ask in a question box: `C:\GitHub_Local` (Recommended) on Windows (`/c/GitHub_Local` in Git Bash), or `~/GitHub_Local` on a Mac, plus the option to type another path.
- **Never** the NAS, or a Google Drive, Dropbox, OneDrive or iCloud folder: shared and synced folders fight with Git and can undo changes. Say so if they suggest one.
- Tell them where to find it: Windows, File Explorer → This PC → Local Disk (C:) → GitHub_Local; Mac, Finder → Go → Home → GitHub_Local (drag it to the Finder sidebar to keep it handy).
- Create it if needed (`mkdir -p`) and save it: `git config --global one.previewFolder "<path>"` (on Windows use the `C:/GitHub_Local` form).

## 8. Done

Three or four lines: GitHub login, org and team status, preview folder, Node yes/no. Then what's next:
- "To start a new client site, say **new client preview**."
- "To work on an existing one, open Claude Code on that client's folder inside <preview folder>, then make changes and say **send it to staging**."
- "The short studio guide is here: https://claude.ai/artifact/HvFBWRbBwt2SjyZcAC7wvK"
