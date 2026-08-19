// アイコン PNG の生成器。
// sandbox / CI に SVG ラスタライザを前提できないため、図形を直接ラスタライズして
// PNG を書き出す。依存はゼロ（node:zlib のみ）。
//
//   node scripts/generate-icons.mjs
//
// 図案: 3本の横線（＝持ち物のリスト）と、最下段に置いた琥珀色の点（＝期限の警告）。
// このアプリで最初に見せたい情報がストックの期限であることをそのまま形にしている。

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

const INK = [0x13, 0x12, 0x11];
const PAPER = [0xfa, 0xf9, 0xf7];
const ACCENT = [0xe8, 0xa3, 0x3d];

/* ---------- PNG エンコード ---------- */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

const crc32 = (buffer) => {
  let c = -1;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};

const chunk = (type, data) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
};

const encodePng = (size, rgba) => {
  // 全面が不透明なら RGB で書き出す。
  // Apple は touch icon に透明チャンネルを推奨していないうえ、ファイルも小さくなる。
  let opaque = true;
  for (let i = 3; i < rgba.length; i += 4) {
    if (rgba[i] !== 255) {
      opaque = false;
      break;
    }
  }
  const channels = opaque ? 3 : 4;

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = opaque ? 2 : 6; // 2: RGB, 6: RGBA
  const stride = size * channels;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y += 1) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0; // filter: none
    for (let x = 0; x < size; x += 1) {
      const source = (y * size + x) * 4;
      const target = rowStart + 1 + x * channels;
      raw[target] = rgba[source];
      raw[target + 1] = rgba[source + 1];
      raw[target + 2] = rgba[source + 2];
      if (!opaque) raw[target + 3] = rgba[source + 3];
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
};

/* ---------- 図形（すべて 0..1 の正規化座標） ---------- */

const insideRoundRect = (x, y, x0, y0, x1, y1, r) => {
  const qx = Math.max(x0 + r - x, 0, x - (x1 - r));
  const qy = Math.max(y0 + r - y, 0, y - (y1 - r));
  return Math.hypot(qx, qy) <= r;
};

const insideCapsule = (x, y, ax, ay, bx, by, r) => {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy;
  const t =
    lengthSq === 0 ? 0 : Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / lengthSq));
  return Math.hypot(x - (ax + dx * t), y - (ay + dy * t)) <= r;
};

const insideCircle = (x, y, cx, cy, r) => Math.hypot(x - cx, y - cy) <= r;

/**
 * @param {number} scale     前景を中心基準で縮小する率（maskable の安全域確保用）
 * @param {number|null} radius 背景の角丸半径。null なら全面塗り（マスク前提）
 */
const buildScene = (scale, radius) => {
  const at = (v) => 0.5 + (v - 0.5) * scale;
  const thickness = 0.038 * scale;
  const bars = [
    [0.26, 0.335, 0.74],
    [0.26, 0.5, 0.6],
    [0.26, 0.665, 0.46],
  ].map(([x0, y, x1]) => [at(x0), at(y), at(x1), at(y)]);
  const dot = [at(0.565), at(0.665), 0.05 * scale];

  return (x, y) => {
    if (insideCircle(x, y, dot[0], dot[1], dot[2])) return ACCENT;
    for (const [ax, ay, bx, by] of bars) {
      if (insideCapsule(x, y, ax, ay, bx, by, thickness)) return PAPER;
    }
    if (radius === null) return INK;
    return insideRoundRect(x, y, 0, 0, 1, 1, radius) ? INK : null;
  };
};

/* ---------- ラスタライズ（4x4 スーパーサンプリング） ---------- */

const SAMPLES = 4;

const rasterize = (size, scene) => {
  const rgba = Buffer.alloc(size * size * 4);
  const step = 1 / (size * SAMPLES);
  const offset = step / 2;

  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      // 透明部分のフリンジを防ぐため、乗算済みアルファで平均してから戻す
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < SAMPLES; sy += 1) {
        for (let sx = 0; sx < SAMPLES; sx += 1) {
          const x = (px * SAMPLES + sx) * step + offset;
          const y = (py * SAMPLES + sy) * step + offset;
          const color = scene(x, y);
          if (color === null) continue;
          r += color[0];
          g += color[1];
          b += color[2];
          a += 1;
        }
      }
      const index = (py * size + px) * 4;
      if (a === 0) {
        // 縮小時に黒がにじまないよう、透明ピクセルにも地の色を置いておく
        rgba[index] = INK[0];
        rgba[index + 1] = INK[1];
        rgba[index + 2] = INK[2];
        continue;
      }
      rgba[index] = Math.round(r / a);
      rgba[index + 1] = Math.round(g / a);
      rgba[index + 2] = Math.round(b / a);
      rgba[index + 3] = Math.round((a / (SAMPLES * SAMPLES)) * 255);
    }
  }
  return rgba;
};

/* ---------- 出力 ---------- */

const TARGETS = [
  // 通常アイコン: 角丸を自前で描き、外側は透明にする
  { file: "icon-192.png", size: 192, scale: 1, radius: 0.22 },
  { file: "icon-512.png", size: 512, scale: 1, radius: 0.22 },
  // maskable: ランチャーが円形に切る前提で全面塗り、前景は中央 90% に収める
  { file: "icon-maskable-512.png", size: 512, scale: 0.9, radius: null },
  // iOS はホーム画面側で角を丸めるため、こちらは全面塗りで渡す
  { file: "apple-touch-icon.png", size: 180, scale: 1, radius: null },
];

for (const { file, size, scale, radius } of TARGETS) {
  const png = encodePng(size, rasterize(size, buildScene(scale, radius)));
  writeFileSync(join(OUT_DIR, file), png);
  console.log(`${file.padEnd(24)} ${size}x${size}  ${String(png.length).padStart(6)} B`);
}
