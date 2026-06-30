# ChordPro to GigPerformer Text Editor

A lightweight web app created with ChatGPT to help me (Aaron Ortiz) quickly prepare files for GigPerformer's chord and lyrics viewer. Since GigPerformer uses a variation of the ChordPro format, some of these tasks were previously time-consuming.

---

## Installation

You must have [Node.js](https://nodejs.org/en) installed.

Clone the repository:

```bash
git clone https://github.com/aaronortiz/chordpro-editor.git
```

Or download the ZIP and extract it.

Navigate to the project folder:

```bash
cd chordpro-editor
```

Install dependencies:

```bash
npm install
```

Start the editor:

```bash
npm run dev
```

Now go to the link that appears in the terminal:
`http://localhost:some-port-number-here`

---

## Usage

### Song Meta Tags

Type in a **Title**, **Artist**, or select a **Key**, then click:

- **Insert {title} tag**
- **Insert {artist} tag**
- **Insert {key} tag**

### Search and Replace

Case-sensitive search and replace. All occurrences of the text in **Search** will be replaced with the text in **Replace**.

### Quick Tag Insert Buttons

Common tags you can quickly insert:

- {comment}
- Intro
- Verse 1, Verse 2, Verse 3, Verse 4
- Chorus
- Bridge
- Interlude
- Solo
- End

### Insert Image Button

Enter the full path to a PNG or PDF file in the **Image Path** input box, then click **Insert Image**.

⚠️ Due to browser security, the full disk path must be entered manually. Beginning and ending quotes are removed automatically to ensure GigPerformer can load the image.

#### Quick Tip:

- On a Mac, you can select a file, and press [Option]+[Command]+[C] and the full path and filename will be copied to the clipboard.
- On Windows, in the file Explorer, hold [Shift] and right-click a file, then select "Copy as path", and the full path and file name will be copied to the clipboard.

### Transform Selection Buttons

- Transform selection to **UPPERCASE**
- Transform selection to **Title Case**

### Copy all to Clipboard Button

Copy the editor contents to the clipboard for easy pasting into GigPerformer's lyrics/chords editor.

### My favorite trick: Convert [Sections] to ChordPro tags

This is actually quite nice. Sometimes when you find chords online, they will have their sections with square brackets `[Like this]`. This button searches the text for any instance of text that is not a chord, and replaces it with a `{songPartName: }` tag instead.

### ✨ Convert from Ultimate Guitar (AI)

Paste a raw chord sheet (e.g. straight from an Ultimate Guitar page) into the editor and click **✨ Convert from Ultimate Guitar (AI)**. It calls Claude to clean up the mess and emit a Gig Performer `.pro` file in the exact format used here:

- `{songPartName: ...}` + `{cb: ...:}` section tags, numbered by content (verses from 1; repeated choruses leave the first un-numbered)
- inline `[chord]` placement, chord-only intro/turnaround lines
- strips `[tab]`/`[ch]` tags, fretboard diagrams, tabber banners and chatter
- keeps capo notes as a `{c: Capo N}` comment

After conversion the result drops back into the editor, so you can still use the buttons above for any final touch-ups.

**Setup (one time):** copy `.env.example` to `.env` and set your `ANTHROPIC_API_KEY`, then `npm run dev`. The key is read only by the local dev server (`vite.config.js` → `server/ug-convert-plugin.js`) and is never bundled into the browser. The conversion prompt lives in `prompts/ultimate-guitar-to-gigperformer.md` — edit it to tweak the rules. Set `UG_CONVERT_MODEL` in `.env` to override the model (defaults to `claude-opus-4-8`).

---

## Acknowledgments

This code was produced with assistance from ChatGPT. Minor tweaks were made by me. Please do not use it for commercial or illegal purposes.

---

## License

[GNU General Public License version 2](https://opensource.org/license/gpl-2-0)
