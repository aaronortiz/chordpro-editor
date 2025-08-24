import React, { useState, useRef } from 'react';

export default function ChordProEditor() {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [key, setKey] = useState('');
  const [content, setContent] = useState('');
  const [search, setSearch] = useState('');
  const [replace, setReplace] = useState('');
  const editorRef = useRef(null);

  const transformSelection = (transformFn) => {
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

  const toTitleCase = (str) =>
    str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

  const handleSearchReplace = () => {
    if (!search) return;
    setContent((prev) => prev.split(search).join(replace));
  };

  const quickInsert = (text) => {
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

  return (
    <div className="container">
      <h1>Chord Pro to GigPerformer Text Editor</h1>
      <div className="top-controls">
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button onClick={() => quickInsert(`{title: ${title}}`)}>{'Insert {title} tag'}</button>
        <input placeholder="Artist" value={artist} onChange={(e) => setArtist(e.target.value)} />
        <button onClick={() => quickInsert(`{artist: ${artist}}`)}>{'Insert {artist} tag'}</button>
        <select value={key} onChange={(e) => setKey(e.target.value)}>
          <option value="">Select Key</option>
          {keyOptions.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <button onClick={() => quickInsert(`{key: ${key}}`)}>{'Insert {key} tag'}</button>
      </div>

      <div className="search-replace">
        <input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        <input placeholder="Replace" value={replace} onChange={(e) => setReplace(e.target.value)} />
        <button onClick={handleSearchReplace}>Replace All</button>
      </div>

      <textarea
        ref={editorRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
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

      <div className="actions">
        <button onClick={() => transformSelection((s) => s.toUpperCase())}>
          Transform selection to UPPERCASE
        </button>
        <button onClick={() => transformSelection(toTitleCase)}>
          Transform selection to TitleCase
        </button>
        <button onClick={copyToClipboard}>Copy all to Clipboard</button>
      </div>
    </div>
  );
}
