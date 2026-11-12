const decoder = new TextDecoder();
const encoder = new TextEncoder();

const HEAD = /^P5\s+(\d+)\s+(\d+)\s+255\s/;
const ANGLES = Array.from({ length: 41 }, (unused, index) => (index - 20) / 4).sort(
  (one, other) => Math.abs(one) - Math.abs(other),
);

const radians = (angle) => (angle * Math.PI) / 180;

export function unpack(pixmap) {
  const [head, wide, tall] = decoder.decode(pixmap.subarray(0, 40)).match(HEAD);
  return { wide: Number(wide), tall: Number(tall), shades: pixmap.subarray(head.length) };
}

export function pack({ wide, tall, shades }) {
  const head = encoder.encode(`P5\n${wide} ${tall}\n255\n`);
  const pixmap = new Uint8Array(head.length + shades.length);
  pixmap.set(head);
  pixmap.set(shades, head.length);
  return pixmap;
}

export function bitmap(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const [from, wide, rising] = [view.getUint32(10, true), view.getInt32(18, true), view.getInt32(22, true)];
  const [depth, packing] = [view.getUint16(28, true), view.getUint32(30, true)];
  if (![24, 32].includes(depth) || ![0, 3].includes(packing)) {
    throw new Error(`ocr: this bmp is ${depth} bit, packing ${packing} — read here: 24 and 32 bit, unpacked`);
  }
  const tall = Math.abs(rising);
  const stride = Math.ceil((wide * depth) / 32) * 4;
  const shades = new Uint8Array(wide * tall);
  for (let down = 0; down < tall; down++) {
    const record = from + (rising > 0 ? tall - 1 - down : down) * stride;
    for (let across = 0; across < wide; across++) {
      const here = record + (across * depth) / 8;
      shades[down * wide + across] = (bytes[here] * 114 + bytes[here + 1] * 587 + bytes[here + 2] * 299) / 1000;
    }
  }
  return { wide, tall, shades };
}

function sharpness({ wide, tall, shades }, stride, angle) {
  const slope = Math.tan(radians(angle));
  const reach = Math.ceil((wide * Math.abs(slope)) / stride) + 1;
  const bands = new Float64Array(Math.ceil(tall / stride) + 2 * reach + 1);
  for (let down = 0; down < tall; down += stride) {
    for (let across = 0; across < wide; across += stride) {
      bands[Math.round((down - across * slope) / stride) + reach] += 255 - shades[down * wide + across];
    }
  }
  let sharp = 0;
  for (let band = 1; band < bands.length; band++) sharp += (bands[band] - bands[band - 1]) ** 2;
  return sharp;
}

export function skew(gray) {
  const stride = Math.ceil(Math.max(gray.wide, gray.tall) / 600);
  const [[, flat], ...leaning] = ANGLES.map((angle) => [angle, sharpness(gray, stride, angle)]);
  const [angle, sharp] = leaning.reduce((best, here) => (here[1] > best[1] ? here : best));
  return sharp > 2 * flat ? angle : 0;
}

export function level({ wide, tall, shades }, angle) {
  const sine = Math.sin(radians(angle));
  const cosine = Math.cos(radians(angle));
  const paper = shades[0];
  const levelled = new Uint8Array(shades.length).fill(paper);
  for (let down = 0; down < tall; down++) {
    for (let across = 0; across < wide; across++) {
      const right = across - wide / 2;
      const below = down - tall / 2;
      const from = wide / 2 + right * cosine - below * sine;
      const above = tall / 2 + right * sine + below * cosine;
      const column = Math.floor(from);
      const rank = Math.floor(above);
      if (column < 0 || rank < 0 || column >= wide - 1 || rank >= tall - 1) continue;
      const along = from - column;
      const beneath = above - rank;
      const here = rank * wide + column;
      levelled[down * wide + across] =
        (shades[here] * (1 - along) + shades[here + 1] * along) * (1 - beneath) +
        (shades[here + wide] * (1 - along) + shades[here + wide + 1] * along) * beneath;
    }
  }
  return { wide, tall, shades: levelled };
}

const within = (share) => Math.round(Math.min(1, Math.max(0, share)) * 10000) / 10000;

export const tilted = ({ wide, tall }, angle) => {
  const sine = Math.sin(radians(angle));
  const cosine = Math.cos(radians(angle));
  return ([left, top, width, height]) => {
    const right = (left + width / 2 - 0.5) * wide;
    const below = (top + height / 2 - 0.5) * tall;
    return [
      within(0.5 + (right * cosine - below * sine) / wide - width / 2),
      within(0.5 + (right * sine + below * cosine) / tall - height / 2),
      width,
      height,
    ];
  };
};
