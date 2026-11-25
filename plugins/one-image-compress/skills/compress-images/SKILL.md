---
name: compress-images
description: Compress a batch of images to Squoosh quality for ONE studio staff. Takes a Google Drive folder link (shared drives fine), a folder on the computer, or attached images; asks what the images are for, the format, quality and maximum size; compresses with the same encoders squoosh.app uses (MozJPEG, WebP, AVIF, PNG palette reduction); and puts the results in a new "Compressed" folder next to the originals with a before/after size table. Originals are never changed. Use when someone says "compress these images", "squoosh this folder", "make these images smaller", "optimise images for the web", "reduce the file size", "web-ready images", "convert to WebP", or runs /compress-images.
---

# Compress images (Squoosh quality)

Compress 1–40 images from a Drive folder, a local folder or chat attachments, and hand them back next to the originals. The work is done by `scripts/compress.cjs` (next to this file), which uses sharp with the same encoders as squoosh.app. Don't try to open squoosh.app in a browser: it does one image at a time by hand.

Talk to the user in plain words. They are designers, not developers: no file paths, commands or tool names unless something breaks.

## 1. Get the images

Ask for the images if they weren't given: "Paste the Google Drive folder link (or drop the images here)."

Accept any of:
- **A Google Drive folder link**, e.g. `https://drive.google.com/drive/folders/<FOLDER_ID>?...`. The folder ID is the part after `/folders/`. Shared drives work the same way.
- **Attached images** in the chat.
- **A folder on their computer** (Claude Code only), including a Google Drive for desktop folder such as `G:\Shared drives\...` or `~/Library/CloudStorage/GoogleDrive-<email>/Shared drives/...`.

For a Drive link:
1. `get_file_metadata` on the folder ID. If it fails, or the Google Drive tools aren't available, say: "I can't reach that folder. Check that Google Drive is connected to your Claude account (Settings → Connectors → Google Drive) and that you have access to the folder." Then stop.
2. List the images: `search_files` with query `parentId = '<FOLDER_ID>' and mimeType contains 'image/' and trashed = false`, `excludeContentSnippets: true`, `pageSize: 100`. Follow `nextPageToken` until it's empty.
3. Also check for subfolders (`parentId = '<FOLDER_ID>' and mimeType = 'application/vnd.google-apps.folder'`). If there are any, ask whether to include them. Only go into them if the user says yes (use `'<FOLDER_ID>' in ancestors` and keep each file's subfolder name).
4. Tell the user what you found, in one line: "Found 18 images (54 MB) in *Folder name*." Mention anything that won't be compressed (GIF, SVG, HEIC, PSD).
5. More than 40 images: suggest doing them in batches of about 30, or use Google Drive for desktop and a local folder in Claude Code.

## 2. Ask about the output

Ask once, in a single question box with three questions. Mark the recommended option for what the images are for, using the table below. If the user already said what they're for ("for the website"), use that. Otherwise make the first question "What are these images for?" and carry its answer into your recommendations.

| Use | Format | Quality | Max size (longest side) |
|---|---|---|---|
| Website, landing page | **WebP** | **Balanced** | **2560** for full-width heroes, **1920** otherwise |
| Social media | **Keep original** (JPEG/PNG; platforms recompress and some reject WebP) | **High** | **2048** |
| Email newsletter, presentation, Docs | **Keep original** | **Balanced** | **1200** |
| Sending a client proofs / previews | **Keep original** | **Balanced** | **1920** |

Questions and options:
1. **Format:** Keep original format · WebP (best for websites) · AVIF (smallest, newer; some older apps can't open it) · JPEG (no transparency)
2. **Quality:** High (hard to tell apart from the original) · Balanced (what Squoosh would pick) · Small (smallest files, softer detail)
3. **Max size, longest side:** 2560 px · 1920 px · 1200 px · Don't resize. Images are never enlarged.

If the images are for print, say plainly: "Don't compress files for print. Send the originals." Then stop.

Metadata (camera info, location) is removed by default. Keep it only if the user asks.

## 3. Compress

1. Make a work folder with `in/` and `out/` inside it, **inside the current working directory** (`pwd`), e.g. `./compress-<timestamp>`. Not `/tmp`: Drive uploads by file reference are refused from outside the working directory. In Claude Code, never put it in the user's own project files or a Drive for desktop folder. If the working directory is one of those, ask where to put it.
2. Get the originals into `in/` under their **original file names**:
   - Drive: call `download_file_content` once per file. The result shows where the file was saved (e.g. `/tmp/claude-tool-results/.../mcp-Google_Drive-blob-....png`). Copy it straight away to `in/<original title>`, because the saved name doesn't match the Drive name. Check the byte size matches `fileSize`. If a file has a download restriction or fails, skip it and list it at the end. If you can't find where downloads are saved, ask the user for the folder through Google Drive for desktop instead.
   - Attachments: copy them from the uploads folder.
   - Local folder: point `--in` straight at it (it is only read, never written to).
3. Check Node is installed (`node --version`, needs 18 or newer). The cloud sandbox has it. In Claude Code, if it's missing, ask before installing: Windows `winget install OpenJS.NodeJS.LTS`, Mac `brew install node`. Or suggest running this in the Chat tab instead.
4. Copy `scripts/compress.cjs` and `scripts/package.json` into the work folder and run `npm install --omit=dev --no-audit --no-fund` there (installs sharp; needs internet once).
5. Run:
   ```
   node compress.cjs --in in --out out --format <keep|webp|avif|jpeg> --quality <high|balanced|small> --max <2560|1920|1200|0> --report report.json
   ```
   Add `--recursive` if subfolders were included, and `--keep-metadata` only if asked. A typed quality number (1–100) is passed straight through.
6. Read `report.json`. Compressing a file that's already well compressed can make it bigger. The script then copies the original and marks it `kept original`, which is fine. If every file comes out `kept original`, say so and suggest a smaller quality setting or size.

Before handing back, open two or three of the outputs with Read (the biggest saving, and anything with transparency) and check they look right: not blank, not cropped, transparency kept where the format allows it.

## 4. Hand back

**Drive source:**
1. Check the source folder's `capabilities.canAddChildren` from step 1. If false, the user can't add files there: ask for another Drive folder link to save to, or hand the files back in the chat.
2. Create a folder inside the source folder: `create_file` with `title: "Compressed – <Format> <Quality> <size>"` (e.g. `Compressed – WebP Balanced 2560`), `contentMimeType: "application/vnd.google-apps.folder"`, `parentId: <FOLDER_ID>`. If folders were mirrored, make the subfolders inside it too.
3. Upload each file in `out/` with `create_file`: `title` = output file name, `parentId` = the new folder, `contentMimeType` = `image/jpeg` | `image/png` | `image/webp` | `image/avif`, `disableConversionToGoogleType: true`, and `base64Content` as a **file reference**, not typed base64: `sha256:<64 lowercase hex>:<absolute path>` (get the hash with `sha256sum`, or `shasum -a 256` on a Mac). Never paste base64 yourself. If an upload says the reference can't be sent, the file is outside the working directory: copy it in and retry once.
5. When the uploads are done, delete the work folder.
4. Never move, rename, overwrite or trash the originals.

**Attachments or no Drive access:** zip `out/` and send the zip with SendUserFile. For 1–3 images, send the files themselves.

**Local folder (Claude Code):** write the results to a new `Compressed – …` folder next to the source folder and say where it is.

Then reply briefly:
- Link to the new Drive folder (or where the files are).
- A small table: file · before · after · % smaller. For more than 15 files, show the 10 biggest and a total line.
- Total saved, e.g. "54 MB → 6.1 MB (89% smaller)".
- Anything skipped or kept as original, with the reason in a few words.
- If the result is AVIF, add: "AVIF won't open in some older apps. Use WebP if anyone has trouble."

## Rules
- Never change, move or delete the originals.
- Never enlarge an image.
- Don't use this for print files.
- JPEG has no transparency: transparent areas become white. If a source has transparency and the user picked JPEG, warn them before running and suggest WebP or keeping PNG.
- If something fails twice (Drive upload, npm install), stop, say what happened in one line and hand the files back in the chat instead.
