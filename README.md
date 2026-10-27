# ONE Creative Agency · Claude Code plugins

These plugins are added to ONE's Claude organisation (Organisation settings → Plugins, source `ONE-Creative-Agency/claude-plugins`), so everyone gets them in the Code tab automatically. Nothing to install per person.

**Releasing an update:** push to `main`, then click **Re-sync** on the marketplace page in Organisation settings (or let the GitHub webhook do it). People pick it up in their next new session.

**Don't also add this marketplace personally** (`/plugin` → Marketplaces): you'd get two copies of every skill. If someone did, remove the personal copy with `claude plugin uninstall one-client-preview@one-agency` and `claude plugin marketplace remove one-agency`.

| Plugin | What it does |
|---|---|
| `one-client-preview` | Client website previews: first-time setup, new preview, send to staging, publish to the client link, passcode page. |

Studio how-to: https://claude.ai/artifact/HvFBWRbBwt2SjyZcAC7wvK

Owner: Nicky.
