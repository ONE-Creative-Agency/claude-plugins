#!/usr/bin/env node
// ONE image compress: Squoosh-quality compression with the same encoders
// Squoosh uses (MozJPEG, WebP, AVIF, PNG palette reduction), via sharp/libvips.
//
// Usage:
//   node compress.cjs --in <folder> --out <folder> [options]
//
// Options:
//   --format   keep | webp | avif | jpeg        (default keep)
//   --quality  high | balanced | small | 1-100  (default balanced)
//   --max      longest side in px, 0 = no resize (default 0). Never upscales.
//   --keep-metadata                            keep EXIF/ICC (default: strip)
//   --recursive                                include subfolders, mirrored in --out
//   --report   <file.json>                     write a JSON report
//
// Rules: originals are never touched; if the compressed file is not smaller
// than the original, the original is copied instead and flagged.

'use strict';
const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('sharp is not installed. Run `npm install` in this script\'s folder first.');
  process.exit(2);
}

// ---------- args ----------
function parseArgs(argv) {
  const a = { format: 'keep', quality: 'balanced', max: 0, keepMetadata: false, recursive: false };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) fail(`Missing value for ${k}`);
      return v;
    };
    if (k === '--in') a.in = next();
    else if (k === '--out') a.out = next();
    else if (k === '--format') a.format = next().toLowerCase();
    else if (k === '--quality') a.quality = next().toLowerCase();
    else if (k === '--max') a.max = parseInt(next(), 10) || 0;
    else if (k === '--keep-metadata') a.keepMetadata = true;
    else if (k === '--recursive') a.recursive = true;
    else if (k === '--report') a.report = next();
    else if (k === '-h' || k === '--help') { console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 19).join('\n')); process.exit(0); }
    else fail(`Unknown option ${k}`);
  }
  if (!a.in || !a.out) fail('--in and --out are required');
  if (!['keep', 'webp', 'avif', 'jpeg', 'jpg'].includes(a.format)) fail(`Unknown format ${a.format}`);
  if (a.format === 'jpg') a.format = 'jpeg';
  if (!['high', 'balanced', 'small'].includes(a.quality)) {
    const n = parseInt(a.quality, 10);
    if (!(n >= 1 && n <= 100)) fail(`Quality must be high, balanced, small or 1-100`);
    a.quality = n;
  }
  if (path.resolve(a.in) === path.resolve(a.out)) fail('--out must be a different folder from --in (originals are never overwritten)');
  return a;
}
function fail(msg) { console.error(`Error: ${msg}`); process.exit(2); }

// ---------- settings ----------
const PRESETS = {
  jpeg: { high: 85, balanced: 75, small: 60 },
  webp: { high: 85, balanced: 75, small: 60 },
  avif: { high: 65, balanced: 50, small: 38 }, // AVIF's scale runs lower for the same look
  png:  { high: null, balanced: 90, small: 70 }, // null = lossless; else palette quality
};
const SUPPORTED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff']);
const SKIP_REASONS = {
  '.gif': 'GIF (often animated) - not compressed',
  '.svg': 'SVG is vector - not compressed',
  '.heic': 'HEIC not supported - export as JPEG first',
  '.heif': 'HEIF not supported - export as JPEG first',
  '.psd': 'Photoshop file - export first',
  '.ai': 'Illustrator file - export first',
  '.pdf': 'PDF - not an image',
};
const EXT = { jpeg: '.jpg', png: '.png', webp: '.webp', avif: '.avif' };

function q(fmt, quality) {
  if (typeof quality === 'number') return quality;
  return PRESETS[fmt][quality];
}

// ---------- files ----------
function listFiles(dir, recursive, base = dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith('.')) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) { if (recursive) out.push(...listFiles(full, recursive, base)); }
    else if (ent.isFile()) out.push(path.relative(base, full));
  }
  return out.sort();
}

function uniqueName(dir, name, used) {
  let candidate = name;
  const ext = path.extname(name);
  const stem = name.slice(0, -ext.length);
  let i = 2;
  while (used.has(path.join(dir, candidate).toLowerCase())) candidate = `${stem}-${i++}${ext}`;
  used.add(path.join(dir, candidate).toLowerCase());
  return candidate;
}

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

// ---------- encode ----------
async function encode(inputPath, opts) {
  const input = sharp(inputPath, { failOn: 'none' });
  const meta = await input.metadata();
  if ((meta.pages || 1) > 1) return { skip: 'animated or multi-page image - not compressed' };

  const srcFmt = meta.format === 'jpg' ? 'jpeg' : meta.format; // jpeg | png | webp | heif(avif) | tiff
  let outFmt = opts.format;
  const notes = [];
  if (outFmt === 'keep') {
    if (srcFmt === 'jpeg') outFmt = 'jpeg';
    else if (srcFmt === 'png') outFmt = 'png';
    else if (srcFmt === 'webp') outFmt = 'webp';
    else if (srcFmt === 'heif') outFmt = 'avif';
    else if (srcFmt === 'tiff') { outFmt = meta.hasAlpha ? 'png' : 'jpeg'; notes.push(`TIFF saved as ${outFmt.toUpperCase()}`); }
    else return { skip: `format ${srcFmt} not supported` };
  }

  let img = sharp(inputPath, { failOn: 'none' }).rotate(); // apply camera orientation
  if (opts.keepMetadata) img = img.keepMetadata();

  if (opts.max > 0) {
    const w = meta.autoOrient ? meta.autoOrient.width : meta.width;
    const h = meta.autoOrient ? meta.autoOrient.height : meta.height;
    if (Math.max(w, h) > opts.max) {
      img = img.resize({ width: opts.max, height: opts.max, fit: 'inside', withoutEnlargement: true });
      notes.push('resized');
    }
  }

  if (outFmt === 'jpeg') {
    if (meta.hasAlpha) { img = img.flatten({ background: '#ffffff' }); notes.push('transparency filled white (JPEG has none)'); }
    img = img.jpeg({ quality: q('jpeg', opts.quality), mozjpeg: true });
  } else if (outFmt === 'webp') {
    img = img.webp({ quality: q('webp', opts.quality), alphaQuality: 100, effort: 6, smartSubsample: true });
  } else if (outFmt === 'avif') {
    img = img.avif({ quality: q('avif', opts.quality), effort: 5 });
  } else if (outFmt === 'png') {
    const pq = typeof opts.quality === 'number' ? opts.quality : PRESETS.png[opts.quality];
    img = pq == null
      ? img.png({ compressionLevel: 9, effort: 10, adaptiveFiltering: true })
      : img.png({ compressionLevel: 9, effort: 10, palette: true, quality: pq, dither: 1.0 });
    if (pq != null) notes.push('colour palette reduced');
  }

  const { data, info } = await img.toBuffer({ resolveWithObject: true });
  return { data, outFmt, width: info.width, height: info.height, srcW: meta.width, srcH: meta.height, notes };
}

// ---------- main ----------
(async () => {
  const opts = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(opts.in)) fail(`Input folder not found: ${opts.in}`);
  fs.mkdirSync(opts.out, { recursive: true });

  const files = listFiles(opts.in, opts.recursive);
  const used = new Set();
  const results = [];

  for (const rel of files) {
    const src = path.join(opts.in, rel);
    const ext = path.extname(rel).toLowerCase();
    const inBytes = fs.statSync(src).size;
    const row = { file: rel, inBytes };

    if (!SUPPORTED.has(ext)) {
      row.status = 'skipped';
      row.reason = SKIP_REASONS[ext] || `${ext || 'no extension'} - not an image type this handles`;
      results.push(row);
      continue;
    }

    try {
      const r = await encode(src, opts);
      if (r.skip) { row.status = 'skipped'; row.reason = r.skip; results.push(row); continue; }

      const relDir = path.dirname(rel);
      const outDir = path.join(opts.out, relDir);
      fs.mkdirSync(outDir, { recursive: true });
      const stem = path.basename(rel, path.extname(rel));

      if (r.data.length >= inBytes) {
        // Compressed version is no smaller: hand back the original untouched.
        const name = uniqueName(outDir, path.basename(rel), used);
        fs.copyFileSync(src, path.join(outDir, name));
        Object.assign(row, { status: 'kept original', reason: 'already well compressed - compressing made it bigger', output: path.join(relDir, name), outBytes: inBytes });
      } else {
        const name = uniqueName(outDir, stem + EXT[r.outFmt], used);
        fs.writeFileSync(path.join(outDir, name), r.data);
        Object.assign(row, {
          status: 'compressed', output: path.join(relDir, name), outBytes: r.data.length,
          size: `${r.srcW}x${r.srcH}` + (r.width !== r.srcW || r.height !== r.srcH ? ` -> ${r.width}x${r.height}` : ''),
          notes: r.notes.join('; ') || undefined,
        });
      }
    } catch (e) {
      row.status = 'error';
      row.reason = e.message.split('\n')[0];
    }
    results.push(row);
  }

  // ---------- report ----------
  const done = results.filter(r => r.outBytes != null);
  const totalIn = done.reduce((s, r) => s + r.inBytes, 0);
  const totalOut = done.reduce((s, r) => s + r.outBytes, 0);
  const summary = {
    settings: { format: opts.format, quality: opts.quality, maxLongestSide: opts.max || null, metadata: opts.keepMetadata ? 'kept' : 'stripped' },
    counts: {
      compressed: results.filter(r => r.status === 'compressed').length,
      keptOriginal: results.filter(r => r.status === 'kept original').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      errors: results.filter(r => r.status === 'error').length,
    },
    totalInBytes: totalIn, totalOutBytes: totalOut,
    savedPercent: totalIn ? Math.round((1 - totalOut / totalIn) * 100) : 0,
    files: results,
  };
  if (opts.report) fs.writeFileSync(opts.report, JSON.stringify(summary, null, 2));

  for (const r of results) {
    if (r.outBytes != null) {
      const pct = Math.round((1 - r.outBytes / r.inBytes) * 100);
      console.log(`${r.status === 'compressed' ? 'OK  ' : 'KEPT'}  ${r.file} -> ${r.output}  ${fmtBytes(r.inBytes)} -> ${fmtBytes(r.outBytes)} (${pct}% smaller)${r.notes ? '  [' + r.notes + ']' : ''}`);
    } else {
      console.log(`${r.status === 'error' ? 'ERR ' : 'SKIP'}  ${r.file}  ${r.reason}`);
    }
  }
  console.log(`\nTotal: ${fmtBytes(totalIn)} -> ${fmtBytes(totalOut)} (${summary.savedPercent}% smaller). ` +
    `${summary.counts.compressed} compressed, ${summary.counts.keptOriginal} kept as original, ${summary.counts.skipped} skipped, ${summary.counts.errors} errors.`);
})();
