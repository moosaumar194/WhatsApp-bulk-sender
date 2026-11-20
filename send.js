// Setup:
//   npm init -y && npm install whatsapp-web.js qrcode-terminal
//   Create numbers.txt (one number per line, with country code, digits only, e.g. 201012345678)
//   Put your photo next to this file (e.g. photo.jpg)
//   Run: node send.js

const fs = require('fs');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const NUMBERS_FILE = 'Kite_Flying_Salemans_number.csv'; // real list (use 'test.txt' for tests)
const MAX_PER_RUN = 500; // program stops after this many numbers per run
const PHOTO_FILE = 'photo.jpg';
const VOICE_FILE = 'voice.ogg'; // best format: .ogg (opus). .mp3 may also work
const MESSAGE = 'Contact: 03214282966'; // used as the photo caption
const MIN_DELAY = 50000;  // ms (50 s)
const MAX_DELAY = 70000;  // ms (70 s) -> about 1 contact per minute

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const randomDelay = () => MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);

// Turn 03134295666 / +92 313 4295666 / 923134295666 into 923134295666
function normalize(raw) {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('0092')) d = d.slice(2);
  if (d.startsWith('0')) d = '92' + d.slice(1);
  if (d.length === 10 && d.startsWith('3')) d = '92' + d;
  return /^923\d{9}$/.test(d) ? d : null; // valid Pakistani mobile only
}

const sentFile = `sent_${NUMBERS_FILE}.log`; // progress log, so reruns skip finished numbers
const alreadySent = new Set(
  fs.existsSync(sentFile) ? fs.readFileSync(sentFile, 'utf8').split('\n').filter(Boolean) : []
);

const allNumbers = [
  ...new Set(
    fs
      .readFileSync(NUMBERS_FILE, 'utf8')
      .split(/[\r\n,;]+/) // handles lines with several numbers separated by commas
      .map(normalize)
      .filter(Boolean)
  ),
].filter((n) => !alreadySent.has(n));

const numbers = allNumbers.slice(0, MAX_PER_RUN);
console.log(`${allNumbers.length} numbers left to send, sending ${numbers.length} this run.`);

// Pick the first browser found on this PC (Chrome > Edge > Opera GX)
const browserPaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Users\\moosa\\AppData\\Local\\Programs\\Opera GX\\opera.exe',
];
const browserPath = browserPaths.find((p) => fs.existsSync(p));
if (!browserPath) {
  console.log('No browser found. Install Google Chrome and run again.');
  process.exit(1);
}
console.log('Using browser:', browserPath);

const client = new Client({
  authStrategy: new LocalAuth(), // keeps you logged in between runs
  puppeteer: {
    executablePath: browserPath,
    args: ['--no-sandbox'],
  },
});

client.on('qr', (qr) => qrcode.generate(qr, { small: true }));

client.on('ready', async () => {
  console.log(`Logged in. Sending to ${numbers.length} numbers...`);
  const media = MessageMedia.fromFilePath(PHOTO_FILE);
  const voice = MessageMedia.fromFilePath(VOICE_FILE);

  for (const number of numbers) {
    try {
      const id = await client.getNumberId(number); // checks the number is on WhatsApp
      if (!id) {
        console.log(`✗ ${number}: not on WhatsApp`);
        continue;
      }
      await client.sendMessage(id._serialized, media, { caption: MESSAGE });
      await sleep(2000 + Math.random() * 2000); // short pause between photo and voice note
      await client.sendMessage(id._serialized, voice, { sendAudioAsVoice: true });
      fs.appendFileSync(sentFile, number + '\n');
      console.log(`✓ ${number}: photo + voice note sent`);
    } catch (err) {
      console.log(`✗ ${number}: ${err.message}`);
    }
    await sleep(randomDelay());
  }

  console.log('Done.');
  await client.destroy();
  process.exit(0);
});

client.initialize();