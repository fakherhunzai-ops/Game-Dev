/**
 * Generates the app icons as real PNGs using nothing but Node's zlib.
 *
 * The icon is the game's mark: a near-black rounded square with the brand
 * question mark. Writing the encoder here keeps the repository free of binary
 * blobs that nobody can review in a diff.
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const crcTable = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** SDF-ish helpers so the icon is anti-aliased without a canvas. */
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const mix = (a, b, t) => a + (b - a) * t;

function makeIcon(size) {
  const buf = Buffer.alloc(size * size * 4);
  const S = size;
  const bg = [0x0b, 0x09, 0x12];
  const pink = [0xff, 0x5c, 0x8a];
  const amber = [0xff, 0x8a, 0x3d];
  const white = [0xf6, 0xf2, 0xff];

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const fx = (x + 0.5) / S;
      const fy = (y + 0.5) / S;
      let col = [...bg];
      let alpha = 1;

      // Rounded-square mask (about 22% corner radius, the iOS squircle feel).
      const r = 0.22;
      const dx = Math.max(r - fx, 0, fx - (1 - r));
      const dy = Math.max(r - fy, 0, fy - (1 - r));
      const corner = Math.hypot(dx, dy) - r;
      alpha = clamp01((0.5 / S - corner) * S * 0.9 + 0.5);

      // Soft radial wash of brand colour in the top-left.
      const wash = clamp01(1 - Math.hypot(fx - 0.24, fy - 0.16) * 1.5);
      col = col.map((v, i) => mix(v, mix(pink[i], amber[i], fx), wash * 0.28));

      // The brand "?" — a ring with a descender, drawn analytically.
      const cx = 0.5;
      const cy = 0.44;
      const d = Math.hypot(fx - cx, fy - cy);
      const angle = Math.atan2(fy - cy, fx - cx);
      const inRing = d > 0.145 && d < 0.235 && (angle < -0.35 || angle > 1.0 || angle < -1.0);
      const stem = Math.abs(fx - cx) < 0.032 && fy > cy + 0.14 && fy < cy + 0.34;
      const dot = d > 0.0 && Math.hypot(fx - cx, fy - (cy + 0.42)) < 0.045;
      const mark = inRing || stem || dot;
      if (mark) {
        const t = clamp01((fy - 0.15) / 0.7);
        col = col.map((v, i) => mix(v, mix(pink[i], amber[i], t), 0.96));
      }
      // Inner highlight on the mark.
      if (mark) {
        const hl = clamp01(1 - Math.hypot(fx - 0.42, fy - 0.3) * 2.2);
        col = col.map((v, i) => mix(v, white[i], hl * 0.35));
      }

      const i = (y * S + x) * 4;
      buf[i] = Math.round(col[0]);
      buf[i + 1] = Math.round(col[1]);
      buf[i + 2] = Math.round(col[2]);
      buf[i + 3] = Math.round(alpha * 255);
    }
  }
  return png(S, S, buf);
}

mkdirSync('public', { recursive: true });
mkdirSync('resources', { recursive: true });
for (const size of [192, 512, 1024]) {
  const data = makeIcon(size);
  const name = size === 1024 ? 'resources/icon.png' : `public/icon-${size}.png`;
  writeFileSync(name, data);
  console.log(`wrote ${name} (${(data.length / 1024).toFixed(1)} kB)`);
}
