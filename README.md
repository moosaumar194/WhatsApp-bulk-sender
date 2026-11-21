# WhatsApp Bulk Sender

A small Node.js script that reads a list of phone numbers from a file and sends each person a **photo with a caption** followed by a **voice note** through WhatsApp Web. It is built on [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js).

> ⚠️ **Read the [disclaimer](#disclaimer) before using this.** Automating WhatsApp is against its Terms of Service and can get your number banned.

## Features

- Reads numbers from a `.txt` or `.csv` file (one per line, or separated by commas or semicolons)
- Cleans numbers automatically: removes spaces and dashes, converts a leading `0` to the country code, and removes duplicates
- Checks that each number is on WhatsApp before sending
- Sends a photo with a caption, then a voice note (as a real voice message)
- Random delay between contacts (about 1 per minute by default) to look less robotic
- Stops after a maximum number of contacts per run
- Saves progress to a log file, so you can stop and resume without messaging anyone twice
- Keeps you logged in between runs (scan the QR code only once)
- Automatically uses Chrome or Edge, whichever is installed

## Requirements

- [Node.js](https://nodejs.org) (LTS version)
- Google Chrome or Microsoft Edge installed
- A WhatsApp account on your phone

## Installation

```bash
git clone https://github.com/moosaumar194/WhatsApp-bulk-sender.git
cd WhatsApp-bulk-sender
npm install
```

**Windows PowerShell shows "running scripts is disabled"?** Run this once, then try again:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Or use Command Prompt instead of PowerShell.

## Setup

Put these files in the project folder (they are not included in the repo, on purpose):

| File | What it is |
|---|---|
| `numbers.txt` | Your list of numbers, one per line (see `numbers.example.txt`) |
| `photo.jpg` | The photo to send |
| `voice.ogg` | The voice note. `.ogg` (Opus) works best; MP3 may not show as a voice message |

Then open `send.js` and edit the settings at the top:

```js
const NUMBERS_FILE = 'numbers.txt';  // your list of numbers
const MAX_PER_RUN = 100;             // program stops after this many numbers
const PHOTO_FILE = 'photo.jpg';
const VOICE_FILE = 'voice.ogg';
const MESSAGE = 'Hello! This is my message.'; // photo caption
const MIN_DELAY = 50000;             // ms between contacts (minimum)
const MAX_DELAY = 70000;             // ms between contacts (maximum)
```

### Number format

Numbers can be written like `03001234567`, `923001234567` or `+92 300 1234567`. By default the script accepts **Pakistani mobile numbers only** and converts them to the `923XXXXXXXXX` format. To use another country, edit the `normalize()` function in `send.js` (the country code and the final pattern check).

## Usage

```bash
node send.js
```

1. A browser window opens and a QR code appears in the terminal.
2. On your phone: **WhatsApp → Settings → Linked Devices → Link a Device**, then scan the code.
3. Sending starts automatically. Each number prints ✓ (sent) or ✗ (failed or not on WhatsApp).
4. The program stops by itself when it reaches `MAX_PER_RUN` or the end of the list.

Leave the browser window open and don't click inside it while the script runs. Keep your computer awake, because sleep mode stops the script.

### Stopping and resuming

Press `Ctrl + C` to stop at any time. Finished numbers are saved in `sent_<your-file-name>.log`, and the next run skips them. Delete that log file if you want to send to the same numbers again.

### Always test first

Before using a real list, put 2 or 3 of your own numbers in a test file, set `NUMBERS_FILE` to it, and check that the photo, caption and voice note look right on your phone.

## Troubleshooting

| Problem | Fix |
|---|---|
| `Could not find Chrome` | Install Google Chrome or Edge, or set `executablePath` in `send.js` to your browser's `.exe` |
| `net::ERR_ABORTED at https://web.whatsapp.com/` | Opera and some browsers don't work. Use Chrome or Edge, and turn off any VPN or proxy |
| Every number says "not on WhatsApp" | Check the country code and that there is no extra `0` after it |
| Voice note arrives as an audio file | Convert it to OGG Opus (`ffmpeg -i voice.mp3 -c:a libopus voice.ogg`) |
| Stuck or broken login | Delete the `.wwebjs_auth` folder and scan the QR code again |
| Stopped working after a WhatsApp update | Run `npm install whatsapp-web.js@latest` |

## Disclaimer

This project is **not affiliated with, endorsed by, or connected to WhatsApp or Meta**. It uses WhatsApp Web through an unofficial library.

- Automated messaging violates WhatsApp's Terms of Service. **Your account can be restricted or permanently banned**, including your personal number.
- Only message people who know you and have agreed to receive your messages. Unwanted bulk messages are spam, may be illegal in your country, and are the fastest way to get banned.
- Keep your volume low and your delays long. For large-scale or business messaging, use the official [WhatsApp Business Platform](https://business.whatsapp.com/products/business-platform).
- You use this software at your own risk. The author is not responsible for banned accounts or misuse.

## Privacy

Never commit these files to a public repository. They are already listed in `.gitignore`:

- Your number lists (`*.csv`, `numbers.txt`, `test.txt`): they contain other people's phone numbers
- `.wwebjs_auth/`: this is your logged-in WhatsApp session, and anyone who has it can access your account
- `sent_*.log`, your photo and your voice note

## License

Released under the [Apache2.0 License](LICENSE).
