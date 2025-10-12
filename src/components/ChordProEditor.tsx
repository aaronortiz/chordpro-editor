import React, { useState, useRef } from 'react';

// Utility: escape filename like a Bash shell would
const escapeFilenameForBash = (filename: string): string => {
  return filename.replace(/(["\s'$`\\])/g, '\\$1');
};

const chordRegex =
  /^(?:NC|nc|N\.C\.|n\.c\.|[A-G](?:#|b)?(?:m|maj|min|sus|aug|dim|add|m7b5|7)?(?:[0-9]|1[0-3])?(?:\/[A-G](?:#|b)?)?)$/;

export default function ChordProEditor() {
  const [title, setTitle] = useState<string>('');
  const [subtitle, setSubTitle] = useState<string>('');
  const [key, setKey] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [replace, setReplace] = useState<string>('');
  const [imagePath, setImagePath] = useState<string>('');
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const sectionCountsRef = useRef<Record<string, number>>({});

  const transformSelection = (transformFn: (s: string) => string) => {
    const textarea = editorRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) return;
    const before = content.substring(0, start);
    const selected = content.substring(start, end);
    const after = content.substring(end);
    const newText = transformFn(selected);
    setContent(before + newText + after);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + newText.length);
    }, 0);
  };

  const toTitleCase = (str: string): string =>
    str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());

  const handleSearchReplace = () => {
    if (!search) return;
    setContent((prev) => prev.split(search).join(replace));
  };

  const quickInsert = (text: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.substring(0, start);
    const after = content.substring(end);
    const newText = before + text + '\n' + after;
    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length + 1, start + text.length + 1);
    }, 0);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
  };

  const insertTextAtCursor = (text: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.substring(0, start);
    const after = content.substring(end);
    const newText = before + text + after;
    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const handleImageInsert = () => {
    if (!imagePath.trim()) return;
    const noQuotesPath = imagePath.replace(/^['"]|['"]$/g, '').trim();
    insertTextAtCursor(`{image: ${noQuotesPath}}\n`);
    setImagePath('');
  };

  const keyOptions = [
    'C',
    'C#',
    'Db',
    'D',
    'D#',
    'Eb',
    'E',
    'F',
    'F#',
    'Gb',
    'G',
    'G#',
    'Ab',
    'A',
    'A#',
    'Bb',
    'B',
    'Am',
    'A#m',
    'Bbm',
    'Bm',
    'Cm',
    'C#m',
    'Dbm',
    'Dm',
    'D#m',
    'Ebm',
    'Em',
    'Fm',
    'F#m',
    'Gbm',
    'Gm',
    'G#m',
    'Abm'
  ];

  const convertSquareBrackets = () => {
    sectionCountsRef.current = {};
    const newContent = content.replace(/\[([^\]]+)\]/g, (match, p1) => {
      const trimmed = p1.trim();
      if (chordRegex.test(trimmed)) return match;

      const sectionKey = trimmed.toLowerCase();
      const currentCount = sectionCountsRef.current[sectionKey] ?? 0;
      const newCount = currentCount + 1;
      sectionCountsRef.current[sectionKey] = newCount;

      const titleCaseName = toTitleCase(trimmed);
      const upperCaseName = trimmed.toUpperCase();
      const numberedTitleCase = newCount > 1 ? `${titleCaseName} ${newCount}` : titleCaseName;
      const numberedUpperCase = newCount > 1 ? `${upperCaseName} ${newCount}` : upperCaseName;

      return `{songPartName: ${numberedTitleCase}}\n{cb:${numberedUpperCase}:}\n`;
    });

    setContent(newContent);
  };

  /** --- NEW FORMAT CONVERTER FUNCTIONS --- **/

  const convertOverLyricsToBracketed = (lines: string[]): string[] => {
    const result: string[] = [];

    // Global regex to scan positions across a chord line
    const CHORD_SCAN =
      /([A-G](?:#|b)?(?:m|maj|min|sus|aug|dim|add|m7b5|7)?(?:[0-9]|1[0-3])?(?:\/[A-G](?:#|b)?)?)/g;

    const isSectionHeader = (s: string) =>
      /^\s*(verse|chorus|bridge|intro|outro|interlude|solo|end)\b/i.test(s);

    const isChordOnlyLine = (s: string) => {
      const tokens = s.trim().split(/\s+/);
      if (!tokens.length) return false;
      return tokens.every((t) => chordRegex.test(t));
    };

    for (let i = 0; i < lines.length; i++) {
      const chordLine = lines[i];

      // Only operate on true chord-only lines
      if (!isChordOnlyLine(chordLine)) {
        result.push(chordLine);
        continue;
      }

      const lyricLine = lines[i + 1] ?? '';

      // If the next line is missing or a section header, leave the chord line untouched
      if (isSectionHeader(lyricLine)) {
        result.push(chordLine);
        continue;
      }

      // Scan chord positions (column indexes)
      const chordPositions: { pos: number; chord: string }[] = [];
      let m: RegExpExecArray | null;
      while ((m = CHORD_SCAN.exec(chordLine)) !== null) {
        chordPositions.push({ pos: m.index, chord: m[1] });
      }

      // Insert chords into the lyric line at exact columns
      let out = lyricLine;
      let offset = 0; // account for earlier insertions growing the string
      for (const { pos, chord } of chordPositions) {
        // Pad lyric if chord sits beyond current length
        if (pos > out.length - offset) {
          out = out.padEnd(pos + offset, ' ');
        }
        const insertAt = pos + offset;
        out = out.slice(0, insertAt) + `[${chord}]` + out.slice(insertAt);
        offset += chord.length + 2; // "[" + chord + "]"
      }

      // Push only the converted lyric line; skip original chord line
      result.push(out);
      i++; // consume the lyric line
    }

    return result;
  };

  const convertBracketedToOverLyrics = (lines: string[]): string[] => {
    const result: string[] = [];

    for (const line of lines) {
      // Skip non-lyrics like "Verse:", "Chorus:", etc.
      if (/^\s*(verse|chorus|bridge|intro|outro|interlude|solo|end)/i.test(line)) {
        result.push(line);
        continue;
      }

      const chordPositions: { pos: number; chord: string }[] = [];
      let plainLyric = '';

      // Parse once: build plainLyric and record chord positions at the *current* plainLyric length
      const bracketRe = /\[([^\]]+)\]/g;
      let lastIdx = 0;
      let m: RegExpExecArray | null;

      while ((m = bracketRe.exec(line)) !== null) {
        const chord = m[1];
        // Add text before this chord to the lyric
        if (m.index > lastIdx) {
          plainLyric += line.slice(lastIdx, m.index);
        }
        // Record chord position at current plainLyric length
        chordPositions.push({ pos: plainLyric.length, chord });
        // Advance past the entire [CHORD]
        lastIdx = m.index + m[0].length;
      }
      // Append any remaining text after the last chord
      if (lastIdx < line.length) {
        plainLyric += line.slice(lastIdx);
      }

      if (chordPositions.length) {
        // Chord line length should be long enough to fit chords that land at/after lyric end
        const maxLen = Math.max(
          plainLyric.length,
          ...chordPositions.map(({ pos, chord }) => pos + chord.length)
        );
        const chordLineArray = Array(maxLen).fill(' ');

        chordPositions.forEach(({ pos, chord }) => {
          for (let i = 0; i < chord.length && pos + i < chordLineArray.length; i++) {
            chordLineArray[pos + i] = chord[i];
          }
        });

        const chordLine = chordLineArray.join('').replace(/\s+$/, ''); // right trim
        result.push(chordLine);
        result.push(plainLyric);
      } else {
        result.push(line);
      }
    }

    return result;
  };

  const convertChordProFormat = () => {
    const lines = content.split('\n');
    const isBracketed = lines.some((line) =>
      line.match(/\[([A-G][#b]?m?(maj7|sus|dim|add)?\d*)\]/)
    );

    const result = isBracketed
      ? convertBracketedToOverLyrics(lines)
      : convertOverLyricsToBracketed(lines);

    setContent(result.join('\n'));
  };

  return (
    <div className="container">
      <h1>Chord Pro to GigPerformer Text Editor</h1>

      <div className="top-controls">
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button onClick={() => quickInsert(`{title: ${title}}`)}>Insert {`{title}`} tag</button>
        <input
          placeholder="Artist"
          value={subtitle}
          onChange={(e) => setSubTitle(e.target.value)}
        />
        <button onClick={() => quickInsert(`{subtitle: ${subtitle}}`)}>
          Insert {`{subtitle}`} tag
        </button>
        <select value={key} onChange={(e) => setKey(e.target.value)}>
          <option value="">Select Key</option>
          {keyOptions.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <button onClick={() => quickInsert(`{key: ${key}}`)}>Insert {`{key}`} tag</button>
      </div>

      <div className="search-replace">
        <input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <input placeholder="Replace" value={replace} onChange={(e) => setReplace(e.target.value)} />
        <button onClick={handleSearchReplace}>Replace All</button>
      </div>

      <textarea
        ref={editorRef}
        value={content}
        onChange={(e) => {
          const newContent = e.target.value;
          setContent(newContent);
          if (newContent.trim() === '') sectionCountsRef.current = {};
        }}
        placeholder="Enter ChordPro content here..."
      />

      <div className="conversions">
        <button onClick={convertSquareBrackets}>Convert [Sections] to ChordPro tags</button>
        <button onClick={convertChordProFormat}>Convert Format (Chords↔Lyrics)</button>
      </div>
      <div className="quick-buttons">
        <button onClick={() => quickInsert('{comment: }')}>{'{comment}'}</button>
        <button onClick={() => quickInsert('{songPartName: Intro}\n{cb: INTRO:}')}>Intro</button>
        <button onClick={() => quickInsert('{songPartName: Verse 1}\n{cb: VERSE 1:}')}>
          Verse 1
        </button>
        <button onClick={() => quickInsert('{songPartName: Chorus}\n{cb: CHORUS:}')}>Chorus</button>
        <button onClick={() => quickInsert('{songPartName: Verse 2}\n{cb: VERSE 2:}')}>
          Verse 2
        </button>
        <button onClick={() => quickInsert('{songPartName: Chorus 2}\n{cb: CHORUS 2:}')}>
          Chorus 2
        </button>
        <button onClick={() => quickInsert('{songPartName: Verse 3}\n{cb: VERSE 3:}')}>
          Verse 3
        </button>
        <button onClick={() => quickInsert('{songPartName: Chorus 3}\n{cb: CHORUS 3:}')}>
          Chorus 3
        </button>
        <button onClick={() => quickInsert('{songPartName: Verse 4}\n{cb: VERSE 4:}')}>
          Verse 4
        </button>
        <button onClick={() => quickInsert('{songPartName: Bridge}\n{cb: BRIDGE:}')}>Bridge</button>
        <button onClick={() => quickInsert('{songPartName: Interlude}\n{cb: INTERLUDE:}')}>
          Interlude
        </button>
        <button onClick={() => quickInsert('{songPartName: Solo}\n{cb: SOLO:}')}>Solo</button>
        <button onClick={() => quickInsert('{songPartName: Chorus 4}\n{cb: CHORUS 4:}')}>
          Chorus 4
        </button>

        <button onClick={() => quickInsert('{songPartName: End}\n{cb: END:}')}>End</button>
      </div>

      <div className="image-insert">
        <input
          type="text"
          placeholder="Enter full image path"
          value={imagePath}
          onChange={(e) => setImagePath(e.target.value)}
        />
        <button onClick={handleImageInsert}>Insert Image</button>
      </div>

      <div className="actions">
        <button onClick={() => transformSelection((s) => s.toUpperCase())}>
          Transform selection to UPPERCASE
        </button>
        <button onClick={() => transformSelection(toTitleCase)}>
          Transform selection to Title Case
        </button>
        <button onClick={copyToClipboard}>Copy all to Clipboard</button>
      </div>
    </div>
  );
}
