# Chord Pro to GigPerformer Text Editor

This is a very basic vibe-coded app created with ChatGPT to help me (Aaron Ortiz) quickly prepare files for GigPerformer's chord and lyrics viewer. Since GigPerformer uses a variation of ChordPro format, some of these actions were pain points and very time consuming for me.

# How to install

Download to a folder of you choosing, and from the terminal run:

```
npm i
```

If all goes well, you can start the editor by running the command

```
npm run dev
```

# How to use:

## Song Meta Tags

You can type in a _*Title*_, _*Artist*_, or select a _*key*_, and use the _*Insert {title} tag*_, _*Insert {artist} tag*_ and _*Insert {key} tag*_ buttons

## Search and replace

A very basic, case-sensitive search and replace, will replace all occurences of the _*Search*_ text you enter with the _*Replace*_ text.

## Quick tag insert buttons

The following buttons insert common tags:

- {comment}
- Intro
- Verse 1
- Verse 2
- Verse 3
- Verse 4
- Chorus
- Bridge
- Interlude
- Solo
- End

# Insert image

The insert image button will let you select a PNG or PDF file and embed it in the chord pro document.

This is problematic because the browser does not have access to the user's full disk. So, you have to manually put in the full path and image in the text box, and press the _*Insert Image*_ button for it to be inserted.

CAVEAT: remove any single or double quotes from the start and end of the text before pressing the button
