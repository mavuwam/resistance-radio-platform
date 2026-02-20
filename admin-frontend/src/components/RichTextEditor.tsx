import { useState } from 'react';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  label?: string;
  error?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter content...',
  minHeight = '300px',
  label,
  error
}: RichTextEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="rich-text-editor">
      {label && <label className="editor-label">{label}</label>}
      
      <div className="editor-toolbar">
        <button
          type="button"
          className={`toolbar-btn ${!showPreview ? 'active' : ''}`}
          onClick={() => setShowPreview(false)}
        >
          ✏️ Edit
        </button>
        <button
          type="button"
          className={`toolbar-btn ${showPreview ? 'active' : ''}`}
          onClick={() => setShowPreview(true)}
        >
          👁️ Preview
        </button>
      </div>

      {!showPreview ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`editor-textarea ${error ? 'error' : ''}`}
          style={{ minHeight }}
        />
      ) : (
        <div 
          className="editor-preview"
          style={{ minHeight }}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      )}

      {error && <div className="editor-error">{error}</div>}

      <div className="editor-hint">
        Supports HTML formatting. Use standard HTML tags for formatting.
      </div>
    </div>
  );
}
