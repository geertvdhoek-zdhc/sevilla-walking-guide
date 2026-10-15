import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('src/cities');
const cityNames = await fs.readdir(root);
let saved = 0;
for (const city of cityNames) {
  const cityRoot = path.join(root, city);
  if (!(await fs.stat(cityRoot)).isDirectory()) continue;
  const names = (await fs.readdir(cityRoot)).filter(name => /^audio-source-\d{2}\.json$/.test(name)).sort();
  for (const name of names) {
    const basename = name.match(/(\d{2})\.json$/)[1] + '.mp3';
    const destination = path.join(cityRoot, 'audio', basename);
    try {
      const existing = await fs.stat(destination);
      if (existing.size > 10000) continue;
      throw Error('Existing MP3 is suspiciously small: ' + destination);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    const descriptor = JSON.parse(await fs.readFile(path.join(cityRoot, name), 'utf8'));
    const sourceUrl = new URL(descriptor.url);
    if (sourceUrl.protocol !== 'https:' || sourceUrl.hostname !== 'storage.googleapis.com')
      throw Error('Audio source must be an ElevenLabs HTTPS storage link');
    if (descriptor.file !== basename) throw Error('Filename mismatch for ' + name);
    const response = await fetch(sourceUrl, { signal: AbortSignal.timeout(90000) });
    if (!response.ok) throw Error('Audio source download failed (' + response.status + '), ' + city + ' ' + basename);
    const bytes = Buffer.from(await response.arrayBuffer());
    const id3 = bytes.toString('latin1', 0, 3) === 'ID3';
    const frameSync = bytes[0] === 255 && (bytes[1] & 224) === 224;
    if (bytes.length < 10000 || (!id3 && !frameSync))
      throw Error('Downloaded file is not a valid-looking MP3: ' + city + ' ' + basename);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, bytes);
    console.log('Stored ' + city + '/' + basename + ' (' + bytes.length + ' bytes)');
    saved++;
  }
}
console.log('New MP3 files: ' + saved);
