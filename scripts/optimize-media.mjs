import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import sharp from 'sharp';
import ffmpegPath from 'ffmpeg-static';

const projectRoot = process.cwd();
const sourceDir = path.join(projectRoot, 'public/assets/media');
const imageOutputDir = path.join(projectRoot, 'public/assets/media-optimized/images');
const videoOutputDir = path.join(projectRoot, 'public/assets/media-optimized/videos');
const manifestPath = path.join(projectRoot, 'src/data/mediaOptimizedManifest.json');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov']);
const TARGET_WIDTHS = [640, 960, 1280];

const toUrlPath = (segments) => `/${segments.map(encodeURIComponent).join('/')}`;

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'asset';

const ensureDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
};

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const listMediaFiles = async (dirPath) => {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const nested = await listMediaFiles(path.join(dirPath, entry.name));
      files.push(...nested);
      continue;
    }

    if (!entry.isFile()) continue;
    files.push(path.join(dirPath, entry.name));
  }

  return files;
};

const runFfmpeg = (args) =>
  new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args, { stdio: 'inherit' });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });

const optimizeVideo = async (filePath, manifest) => {
  const fileName = path.basename(filePath);
  const sourceUrlPath = toUrlPath(['assets', 'media', fileName]);
  const stem = slugify(path.parse(fileName).name);
  const outputFileName = `${stem}-720.mp4`;
  const outputPath = path.join(videoOutputDir, outputFileName);
  const outputUrlPath = toUrlPath(['assets', 'media-optimized', 'videos', outputFileName]);

  if (!(await fileExists(outputPath))) {
    await runFfmpeg([
      '-loglevel',
      'error',
      '-nostats',
      '-y',
      '-i',
      filePath,
      '-map',
      '0:v:0',
      '-map',
      '0:a:0?',
      '-vf',
      "scale='if(gt(iw,1280),1280,iw)':-2",
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-crf',
      '30',
      '-movflags',
      '+faststart',
      '-c:a',
      'aac',
      '-b:a',
      '96k',
      '-ac',
      '2',
      outputPath,
    ]);
  }

  manifest[sourceUrlPath] = {
    type: 'video',
    mp4: outputUrlPath,
  };
};

const optimizeImage = async (filePath, manifest) => {
  const fileName = path.basename(filePath);
  const sourceUrlPath = toUrlPath(['assets', 'media', fileName]);
  const stem = slugify(path.parse(fileName).name);
  const image = sharp(filePath, { failOn: 'none' }).rotate();
  const metadata = await image.metadata();
  const originalWidth = metadata.width || 1280;
  const widths = TARGET_WIDTHS.filter((width) => width <= originalWidth);
  if (!widths.includes(1280)) widths.push(Math.min(originalWidth, 1280));

  const webpSrcSet = [];
  const avifSrcSet = [];
  const availableWidths = [];

  for (const width of [...new Set(widths)].sort((a, b) => a - b)) {
    const webpName = `${stem}-${width}.webp`;
    const avifName = `${stem}-${width}.avif`;
    const webpPath = path.join(imageOutputDir, webpName);
    const avifPath = path.join(imageOutputDir, avifName);
    const webpUrl = toUrlPath(['assets', 'media-optimized', 'images', webpName]);
    const avifUrl = toUrlPath(['assets', 'media-optimized', 'images', avifName]);

    if (!(await fileExists(webpPath))) {
      await image.clone().resize({ width, withoutEnlargement: true }).webp({ quality: 72 }).toFile(webpPath);
    }

    if (!(await fileExists(avifPath))) {
      await image.clone().resize({ width, withoutEnlargement: true }).avif({ quality: 55, effort: 5 }).toFile(avifPath);
    }

    webpSrcSet.push(`${webpUrl} ${width}w`);
    avifSrcSet.push(`${avifUrl} ${width}w`);
    availableWidths.push(width);
  }

  const preferredWidth = Math.max(...availableWidths);
  const fallbackWebp = toUrlPath(['assets', 'media-optimized', 'images', `${stem}-${preferredWidth}.webp`]);

  manifest[sourceUrlPath] = {
    type: 'image',
    default: fallbackWebp,
    webpSrcSet: webpSrcSet.join(', '),
    avifSrcSet: avifSrcSet.join(', '),
    sizes: '(max-width: 768px) 92vw, (max-width: 1280px) 72vw, 1280px',
  };
};

const main = async () => {
  if (!ffmpegPath) {
    throw new Error('Unable to resolve ffmpeg binary path from ffmpeg-static.');
  }

  await ensureDir(imageOutputDir);
  await ensureDir(videoOutputDir);

  const allFiles = await listMediaFiles(sourceDir);
  const manifest = {};
  let imageCount = 0;
  let videoCount = 0;

  for (const filePath of allFiles) {
    const ext = path.extname(filePath).toLowerCase();

    if (IMAGE_EXTENSIONS.has(ext)) {
      imageCount += 1;
      await optimizeImage(filePath, manifest);
      continue;
    }

    if (VIDEO_EXTENSIONS.has(ext)) {
      videoCount += 1;
      await optimizeVideo(filePath, manifest);
    }
  }

  await ensureDir(path.dirname(manifestPath));
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log(`Optimized ${imageCount} image(s) and ${videoCount} video(s).`);
  console.log(`Manifest written to ${path.relative(projectRoot, manifestPath)}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
