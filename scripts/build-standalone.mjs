import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname, extname } from 'node:path';

// Bundle the already-compiled static app into one portable, offline HTML file.
const dist = resolve('dist');
let html = await readFile(resolve(dist, 'index.html'), 'utf8');
const cssTag = /<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g;
const scripts = /<script\b[^>]*src="([^"]+)"[^>]*>\s*<\/script>/g;
async function replaceAsync(source, pattern, replacer) {
  const matches = [...source.matchAll(pattern)];
  for (const match of matches) { const replacement = await replacer(match); source = source.replace(match[0], () => replacement); }
  return source;
}
html = await replaceAsync(html, cssTag, async match => {
  const file = resolve(dist, match[1].replace(/^\//, ''));
  let css = await readFile(file, 'utf8');
  css = await replaceAsync(css, /url\((?:"|')?([^)'"\s]+)(?:"|')?\)/g, async item => {
    if (item[1].startsWith('data:')) return item[0];
    if (/^(https?:|\/\/)/.test(item[1])) throw new Error(`Unexpected remote asset: ${item[1]}`);
    const asset = item[1].startsWith('/') ? resolve(dist, '.' + item[1]) : resolve(dirname(file), item[1]);
    const mime = {'.woff2':'font/woff2','.woff':'font/woff','.png':'image/png','.svg':'image/svg+xml'}[extname(asset)];
    if (!mime) throw new Error(`Unknown asset type: ${asset}`);
    return `url("data:${mime};base64,${(await readFile(asset)).toString('base64')}")`;
  });
  return `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`;
});
html = await replaceAsync(html, scripts, async match => {
  const js = await readFile(resolve(dist, match[1].replace(/^\//, '')), 'utf8');
  return `<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>`;
});
if (/\b(?:src|href)="\/assets\//.test(html)) throw new Error('An unbundled asset remains.');
const out = resolve('release/Signal-Zero.html');
await mkdir(dirname(out), {recursive:true});
await writeFile(out, html);
console.log(`Portable app built: ${out} (${Buffer.byteLength(html).toLocaleString()} bytes)`);
