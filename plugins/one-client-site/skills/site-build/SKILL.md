---
name: site-build
description: Build a ONE client website from its approved design, in a `<client>-site` folder made by site-new. Brings in the design (a client preview's HTML, Astro source from a developer, or HTML files), turns each repeated block into a section that editors fill in Sanity, moves every page's words and photos into Sanity, adds the other languages, checks the result matches the design page by page, and sends it to the staging check link. Use when someone says "build the site from the design", "bring the preview into the real site", "move the content into Sanity", "add the Arabic pages", "add a page" or "add a section type" on a client site.
---

# Build the site from the design

Read `references/house-rules.md` and `references/commands.md` first. Work in the `<client>-site` folder (if this session isn't on it, `cd` there; if it doesn't exist, run **site-new** first). Plan the whole build first, then do it in parts, each ending on staging, so the user can check as you go.

## 1. Get the design

Ask where it is, if not known (question box): the client's `-preview` repo (clone it next to the site folder, read-only, and use its `staging` branch if it's newer than `main`), Astro source (a repo or folder), or HTML files on this computer. It must be the complete approved design: every page, CSS, JS, fonts, images.

## 2. Plan the sections (show the user before building)

Read every page and list the blocks it is made of. Group blocks that share a layout across pages: each group becomes **one section type**. For each, decide:
- **Template section** (`hero`, `textBlock`, `textImage`, `cards`, `faqSection`, `contactSection`) restyled to the design, when the fields fit.
- **New section type** when the layout has its own fields (a team grid, steps, a product slider, a ticker). Prefer a few flexible types with a "Developer settings → Style hook" over many near-identical ones.
- **Built-in (coded) section** only for a true one-off that editors shouldn't change, or one driven by its own documents (e.g. products from a `product` document type).

Also note: the header, footer, menu, contact details and social links (they come from Site settings and Menu), and any repeated data that deserves its own document type (products, team members, case studies, FAQs shared across pages).

Show the plan as a short table: section type · used on · editable fields. Ask in a question box: "Looks right" / "Change something".

## 3. Bring the design in

- **CSS:** shared styles into `public/css/site.css` (replace the starter styles), page-specific files into `public/css/<page>.css` (set on the page's "Page stylesheet" field). Keep class names from the design; update the components to use them. Use logical properties (`margin-inline-start`, `inset-inline-end`) for anything left/right, so right-to-left languages mirror.
- **Fonts:** the design's font link goes in `src/layouts/Layout.astro` where marked. Adobe Fonts kits need the site's domains added in Adobe (site-launch reminds).
- **JS:** into `public/js/`, loaded from the layout. Keep it working with sections that may be missing or repeated.
- **Logo, favicon, icons:** `public/logo.svg`, `public/favicon.svg`; fixed icons used by code in `public/` or `src/assets/`. Photos that editors may change go to Sanity, not `public/`.
- **Header and footer:** rebuild `Header.astro` and `Footer.astro` from the design, reading the menu and settings from Sanity (`getSite`). Keep the language link.

## 4. Build the section types

For each new section type, in one go:
1. Schema in `src/sanity/schemaTypes/sections.js` (reuse `headingField`, `bodyField`, `photoField`, `buttonField`, `darkField`, `anchorField`, `styleField`); add it to `sectionSchemas`. Plain words for titles and descriptions; descriptions say what the editor sees ("Press Enter where a new line should start").
2. Component in `src/components/sections/` taking `section` and `lang`, with the design's exact markup.
3. A case in `src/components/Sections.astro`, and its fields in the query in `src/data/pages.js`.
4. Extra document types (e.g. `product`) in `src/sanity/schemaTypes/`, in `schemaTypes/index.js`, in `translatedTypes` if they differ per language, and as a list in `sanity.config.js`.

Fixed interface words go in `src/i18n/ui.js` for every language.

## 5. Move the content into Sanity

For each page, create `page-<name>-<lang>` for the default language with its sections in order and the design's real words, then publish (commands.md → Sanity). Upload photos with alt text (describe the photo; ask if unsure). Fill Site settings and Menu. Use the design's page addresses as slugs; if they change from the preview, add redirects in `astro.config.mjs`.

Rule: **nothing the client may want to change stays hard-coded.** When unsure, make it a field.

## 6. Compare with the design (every page)

Build locally and compare each page with the design:
- **Words:** extract the visible text of the original and the new page and diff them; explain every difference or fix it.
- **Look:** open both in the browser pane at desktop and phone widths and compare screenshots, including hover menus and the mobile menu.
- **Links:** every internal link resolves; buttons point where the design did.
Report in a short list what matches and what still differs.

## 7. Other languages

For each extra language: draft the translation (keep brand names as the client writes them, and numbers, units and product names consistent), create `page-<name>-<lang>`, Site settings and Menu, and the translation links. Say clearly that **the translation is Claude's draft and needs a native speaker's review** before launch. For right-to-left languages, check every page in the browser at both widths and list layout issues (icons that should mirror, arrows, sliders, alignment) for the designer.

## 8. Send to staging

Run the large-file check, commit (one commit per part, saying what it added), push to `staging`, watch, and give the check link. Say: "Check every page on desktop and phone, and try editing a few words at /admin: publishing there rebuilds the check link in about two minutes."

## 9. Wrap up

- What was built: pages, section types, document types, languages.
- What's left before launch: native review, missing photos ("Need image" placeholders), content the client must supply, anything that differs from the design.
- Next: **site-launch** when the client approves.
