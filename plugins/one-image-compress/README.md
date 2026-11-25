# ONE image compress (plugin)

Lets anyone in the studio compress a batch of images to Squoosh quality without opening squoosh.app one image at a time.

## Skill
- **compress-images** (`/compress-images`): paste a Google Drive folder link (shared drives fine), attach images, or point at a folder (Claude Code). Claude asks what the images are for, then format (keep / WebP / AVIF / JPEG), quality (High / Balanced / Small) and max size (2560 / 1920 / 1200 / none). It compresses them and saves the results to a new `Compressed – <settings>` folder inside the source folder, with a before/after size table.

## How it works
- `scripts/compress.cjs` uses sharp (libvips) with the same encoders Squoosh uses: MozJPEG, libwebp, AVIF (aom), and libimagequant palette reduction for PNG.
- Quality presets: JPEG/WebP 85 / 75 / 60, AVIF 65 / 50 / 38, PNG lossless / palette 90 / palette 70.
- Originals are never changed. Images are never enlarged. Camera orientation is applied and metadata is removed unless asked. If a compressed file comes out bigger, the original is returned instead.
- Skips GIF, SVG, HEIC, PSD, AI and PDF, and says why.

## Needs
- Works in Chat, Cowork and Claude Code.
- The **Google Drive connector** on the person's own Claude account, for Drive links. They need to be able to add files to the source folder, or Claude asks for another folder.
- Claude Code on a computer: Node 18+ (Claude offers to install it). sharp is installed into a temporary folder on first run.

## Test it locally
```
cd skills/compress-images/scripts && npm install
node compress.cjs --in ~/some-images --out /tmp/out --format webp --quality balanced --max 2560
```

Owner: Nicky.
