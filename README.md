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

### Insert Image

Enter the full path to a PNG or PDF file in the **Image Path** input box, then click **Insert Image**.

⚠️ Due to browser security, the full disk path must be typed manually. Beginning and ending quotes are removed automatically to ensure GigPerformer can load the image.

### Transform Selection

- Transform selection to **UPPERCASE**
- Transform selection to **Title Case**

### Clipboard

Copy the editor contents to the clipboard for easy pasting into GigPerformer's lyrics/chords editor.

---

## Acknowledgments

This code was produced with assistance from ChatGPT. Minor tweaks were made by me. Please do not use it for commercial or illegal purposes.

---

## License

[GNU General Public License version 2](https://opensource.org/license/gpl-2-0)
