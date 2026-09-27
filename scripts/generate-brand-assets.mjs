import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const potato = await readFile(join(root, 'public/potato.png'));

async function squareIcon(size, background = { r: 0, g: 0, b: 0, alpha: 0 }) {
  const width = Math.round(size * .84);
  const height = Math.round(width * 1102 / 1427);
  const image = await sharp(potato).resize(width, height).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: image, left: Math.round((size - width) / 2), top: Math.round((size - height) / 2) }])
    .png().toBuffer();
}

await writeFile(join(root, 'app/icon.png'), await squareIcon(512));
await writeFile(join(root, 'app/apple-icon.png'), await squareIcon(180, '#ffffff'));

const faviconSizes = [16, 32, 48];
const faviconPngs = await Promise.all(faviconSizes.map((size) => squareIcon(size)));
const icoHeader = Buffer.alloc(6 + faviconSizes.length * 16);
icoHeader.writeUInt16LE(1, 2);
icoHeader.writeUInt16LE(faviconSizes.length, 4);
let offset = icoHeader.length;
faviconSizes.forEach((size, index) => {
  const pos = 6 + index * 16;
  icoHeader.writeUInt8(size, pos);
  icoHeader.writeUInt8(size, pos + 1);
  icoHeader.writeUInt16LE(1, pos + 4);
  icoHeader.writeUInt16LE(32, pos + 6);
  icoHeader.writeUInt32LE(faviconPngs[index].length, pos + 8);
  icoHeader.writeUInt32LE(offset, pos + 12);
  offset += faviconPngs[index].length;
});
await writeFile(join(root, 'app/favicon.ico'), Buffer.concat([icoHeader, ...faviconPngs]));

const canvas = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#fff"/>
  <path d="M74 111H1126M74 524H1126" stroke="#d9d9d9" stroke-width="2"/>
  <text x="75" y="74" fill="#171717" font-family="Helvetica Neue, Arial, sans-serif" font-size="27" font-weight="700" letter-spacing="-1">pstack</text>
  <text x="75" y="240" fill="#171717" font-family="Helvetica Neue, Arial, sans-serif" font-size="75" font-weight="700" letter-spacing="-4">The pstack</text>
  <text x="75" y="328" fill="#171717" font-family="Helvetica Neue, Arial, sans-serif" font-size="75" font-weight="700" letter-spacing="-4">guide</text>
  <text x="78" y="394" fill="#525252" font-family="Helvetica Neue, Arial, sans-serif" font-size="26">Skills, playbooks, agents, and automations</text>
  <text x="78" y="430" fill="#525252" font-family="Helvetica Neue, Arial, sans-serif" font-size="26">for rigorous engineering.</text>
  <text x="75" y="573" fill="#525252" font-family="Helvetica Neue, Arial, sans-serif" font-size="22">pstack.nishilfaldu.site</text>
</svg>`;
const heroPotato = await sharp(potato).resize(405, 313).png().toBuffer();
await sharp(Buffer.from(canvas))
  .composite([{ input: heroPotato, left: 760, top: 170 }])
  .png({ compressionLevel: 9 })
  .toFile(join(root, 'public/opengraph-image.png'));

console.log('Generated favicon, app icons, and 1200×630 share image.');
