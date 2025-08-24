import React, { useState, useRef } from 'react';

// Utility: escape filename like a Bash shell would
const escapeFilenameForBash = (filename: string): string => {
  return filename.replace(/(["\s'$`\\])/g, '\\$1');
};

export default function ChordProEditor() {
  const [title, setTitle] = useState<string>('');
  const [artist, setArtist] = useState<string>('');
  const [key, setKey] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [replace, setReplace] = useState<string>('');
  const [imagePath, setImagePath] = useState<string>(''); // NEW: image path input
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    const escapedPath = escapeFilenameForBash(imagePath.replace(/^['"]|['"]$/g, '').trim());
    insertTextAtCursor(`{image: ${escapedPath}}\n`);
    setImagePath(''); // optional: clear input after insert
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

  const chordRegex =
    /^[A-G](#|b)?(m|5|7|maj7|sus2|sus4|dim|m7b5)?(\/[A-G](#|b)?(m|5|7|maj7|sus2|sus4|dim|m7b5)?)?$/;

  const convertSquareBrackets = () => {
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

      return `{songPartName: ${numberedTitleCase}}\n${numberedUpperCase}:\n`;
    });

    setContent(newContent);
  };

  return (
    <div className="container">
      <h1>Chord Pro to GigPerformer Text Editor</h1>

      <div className="top-controls">
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button onClick={() => quickInsert(`{title: ${title}}`)}>Insert {`{title}`} tag</button>
        <input placeholder="Artist" value={artist} onChange={(e) => setArtist(e.target.value)} />
        <button onClick={() => quickInsert(`{artist: ${artist}}`)}>Insert {`{artist}`} tag</button>
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
          if (newContent.trim() === '') {
            sectionCountsRef.current = {};
          }
        }}
        placeholder="Enter ChordPro content here..."
      />

      <div className="quick-buttons">
        <button onClick={() => quickInsert('{comment: }')}>{'{comment}'}</button>
        <button onClick={() => quickInsert('{songPartName: Intro}\nINTRO:')}>Intro</button>
        <button onClick={() => quickInsert('{songPartName: Verse 1}\nVERSE 1:')}>Verse 1</button>
        <button onClick={() => quickInsert('{songPartName: Verse 2}\nVERSE 2:')}>Verse 2</button>
        <button onClick={() => quickInsert('{songPartName: Chorus}\nCHORUS:')}>Chorus</button>
        <button onClick={() => quickInsert('{songPartName: Bridge}\nBRIDGE:')}>Bridge</button>
        <button onClick={() => quickInsert('{songPartName: Interlude}\nINTERLUDE:')}>
          Interlude
        </button>
        <button onClick={() => quickInsert('{songPartName: Solo}\nSOLO:')}>Solo</button>
        <button onClick={() => quickInsert('{songPartName: End}\nEND:')}>End</button>
      </div>

      {/* NEW: image path input */}
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
        <button onClick={convertSquareBrackets}>Convert [Sections] to ChordPro tags</button>
      </div>
    </div>
  );
}
