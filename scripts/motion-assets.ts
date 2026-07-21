import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { constants, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

type PreloadPriority = "critical" | "nearby" | "lazy";

interface MotionConfigAsset {
  id: string;
  kind: "transition" | "concept";
  conceptId?: string;
  sourceFilename: string;
  filename: string;
  posterFilename?: string;
  startTrim: number;
  endTrim: number;
  loopStart?: number;
  loopEnd?: number;
  fadeDuration: number;
  preloadPriority: PreloadPriority;
  excludedRanges?: Array<{
    label: string;
    start: number;
    end: number;
  }>;
}

interface MotionConfig {
  version: number;
  assets: MotionConfigAsset[];
}

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const sourceRoot = path.join(repositoryRoot, "assets/source");
const runtimeRoot = path.join(repositoryRoot, "assets/runtime");
const configPath = path.join(repositoryRoot, "assets/motion.config.json");
const runtimeManifestPath = path.join(runtimeRoot, "motion-manifest.json");

function sha256(bytes: Buffer) {
  return createHash("sha256").update(bytes).digest("hex");
}

function readMp4Duration(bytes: Buffer): number {
  let duration: number | null = null;
  const visit = (start: number, end: number) => {
    let offset = start;
    while (offset + 8 <= end) {
      let size = bytes.readUInt32BE(offset);
      const type = bytes.toString("ascii", offset + 4, offset + 8);
      let headerSize = 8;
      if (size === 1) {
        size = Number(bytes.readBigUInt64BE(offset + 8));
        headerSize = 16;
      } else if (size === 0) {
        size = end - offset;
      }
      if (size < headerSize || offset + size > end) break;
      const contentStart = offset + headerSize;
      if (type === "moov") visit(contentStart, offset + size);
      if (type === "mvhd") {
        const version = bytes[contentStart];
        const timescale = bytes.readUInt32BE(contentStart + (version === 1 ? 20 : 12));
        const ticks =
          version === 1
            ? Number(bytes.readBigUInt64BE(contentStart + 24))
            : bytes.readUInt32BE(contentStart + 16);
        duration = ticks / timescale;
      }
      offset += size;
    }
  };
  visit(0, bytes.length);
  if (duration === null || !Number.isFinite(duration)) {
    throw new Error("MP4 is missing readable mvhd duration metadata");
  }
  return duration;
}

function assertConfig(asset: MotionConfigAsset, duration: number) {
  if (asset.startTrim < 0 || asset.endTrim <= asset.startTrim || asset.endTrim > duration) {
    throw new Error(`${asset.id}: trim ${asset.startTrim}-${asset.endTrim} exceeds ${duration}`);
  }
  if (asset.fadeDuration < 0 || asset.fadeDuration * 2 >= asset.endTrim - asset.startTrim) {
    throw new Error(`${asset.id}: invalid fade duration ${asset.fadeDuration}`);
  }
  const hasLoopStart = asset.loopStart !== undefined;
  const hasLoopEnd = asset.loopEnd !== undefined;
  if (hasLoopStart !== hasLoopEnd) throw new Error(`${asset.id}: loop bounds must be paired`);
  if (
    asset.loopStart !== undefined &&
    asset.loopEnd !== undefined &&
    (asset.loopStart < asset.startTrim ||
      asset.loopEnd > asset.endTrim ||
      asset.loopEnd <= asset.loopStart)
  ) {
    throw new Error(`${asset.id}: invalid loop ${asset.loopStart}-${asset.loopEnd}`);
  }
  if (asset.kind === "concept" && (!asset.conceptId || !asset.posterFilename)) {
    throw new Error(`${asset.id}: concept assets require conceptId and posterFilename`);
  }
  for (const excluded of asset.excludedRanges ?? []) {
    if (excluded.start < 0 || excluded.end <= excluded.start || excluded.end > duration) {
      throw new Error(`${asset.id}: invalid excluded range ${excluded.start}-${excluded.end}`);
    }
    const overlapsPlayback = asset.startTrim < excluded.end && asset.endTrim > excluded.start;
    if (overlapsPlayback) {
      throw new Error(`${asset.id}: playback overlaps excluded content '${excluded.label}'`);
    }
  }
}

function resolveFfmpeg() {
  const configured = process.env.MOTION_FFMPEG_PATH;
  if (configured && existsSync(configured)) return configured;
  const available = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  return available.status === 0 ? "ffmpeg" : null;
}

async function generatePoster(
  ffmpeg: string,
  sourcePath: string,
  posterPath: string,
  seekSeconds: number,
) {
  const result = spawnSync(
    ffmpeg,
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-ss",
      seekSeconds.toFixed(3),
      "-i",
      sourcePath,
      "-frames:v",
      "1",
      "-vf",
      "scale=960:-2",
      "-q:v",
      "3",
      posterPath,
    ],
    { stdio: "inherit" },
  );
  if (result.status !== 0) throw new Error(`Failed to generate ${path.basename(posterPath)}`);
}

async function buildExpectedManifest(config: MotionConfig) {
  const sourceHashes = new Map<string, string>();
  const assets = [];
  for (const asset of config.assets) {
    const sourcePath = path.join(sourceRoot, asset.sourceFilename);
    const sourceBytes = await readFile(sourcePath);
    const duration = readMp4Duration(sourceBytes);
    assertConfig(asset, duration);
    const sourceSha256 = sha256(sourceBytes);
    sourceHashes.set(asset.sourceFilename, sourceSha256);
    assets.push({
      ...asset,
      duration: Number(duration.toFixed(3)),
      bytes: sourceBytes.length,
      sha256: sourceSha256,
    });
  }
  if (new Set(assets.map(({ id }) => id)).size !== assets.length) {
    throw new Error("Motion asset ids must be unique");
  }
  if (new Set(assets.map(({ filename }) => filename)).size !== assets.length) {
    throw new Error("Motion runtime filenames must be unique");
  }
  return { manifest: { version: config.version, assets }, sourceHashes };
}

async function generate(config: MotionConfig) {
  const { manifest, sourceHashes } = await buildExpectedManifest(config);
  const ffmpeg = resolveFfmpeg();
  await mkdir(runtimeRoot, { recursive: true });
  for (const asset of manifest.assets) {
    const sourcePath = path.join(sourceRoot, asset.sourceFilename);
    const runtimePath = path.join(runtimeRoot, asset.filename);
    await copyFile(sourcePath, runtimePath, constants.COPYFILE_FICLONE);
    if (asset.posterFilename) {
      const posterPath = path.join(runtimeRoot, asset.posterFilename);
      if (ffmpeg) {
        await generatePoster(ffmpeg, sourcePath, posterPath, asset.loopStart ?? asset.startTrim);
      } else if (!existsSync(posterPath)) {
        throw new Error(
          `Missing ${asset.posterFilename}; set MOTION_FFMPEG_PATH to generate concept posters`,
        );
      }
    }
  }
  await writeFile(runtimeManifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  for (const [filename, before] of sourceHashes) {
    const after = sha256(await readFile(path.join(sourceRoot, filename)));
    if (after !== before) throw new Error(`Immutable source asset changed: ${filename}`);
  }
  console.log(`Generated ${manifest.assets.length} runtime motion assets.`);
}

async function verify(config: MotionConfig) {
  const { manifest } = await buildExpectedManifest(config);
  const actual = JSON.parse(await readFile(runtimeManifestPath, "utf8")) as unknown;
  if (JSON.stringify(actual) !== JSON.stringify(manifest)) {
    throw new Error("Runtime motion manifest is stale; run npm run motion:generate");
  }
  for (const asset of manifest.assets) {
    const runtimePath = path.join(runtimeRoot, asset.filename);
    const runtimeBytes = await readFile(runtimePath);
    if (sha256(runtimeBytes) !== asset.sha256) {
      throw new Error(`Runtime asset does not match immutable source: ${asset.filename}`);
    }
    if (asset.posterFilename) await stat(path.join(runtimeRoot, asset.posterFilename));
  }
  console.log(`Verified ${manifest.assets.length} runtime motion assets.`);
}

const config = JSON.parse(await readFile(configPath, "utf8")) as MotionConfig;
const command = process.argv[2] ?? "verify";
if (command === "generate") await generate(config);
else if (command === "verify") await verify(config);
else throw new Error(`Unknown motion asset command: ${command}`);
