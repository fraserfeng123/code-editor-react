import React, { useEffect, useState } from 'react';
import Editor, { Monaco } from "@monaco-editor/react";

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  fileName: string;
  isModified: boolean;
  onExecute: () => void;
  onSave: (content: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  language, 
  value, 
  onChange, 
  fileName, 
  isModified, 
  onExecute,
  onSave 
}) => {
  const [tempContent, setTempContent] = useState(value);

  useEffect(() => {
    setTempContent(value);
  }, [value]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setTempContent(value);
      onChange(value);
    }
  };

  const handleEditorWillMount = (monaco: Monaco) => {
    monaco.editor.defineTheme('customDarkTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'regexp', foreground: 'D16969' },
      ],
      colors: {
        'editor.background': '#111827',
        'editor.foreground': '#D4D4D4',
        'editor.lineHighlightBackground': '#2F3542',
        'editorCursor.foreground': '#AEAFAD',
        'editorWhitespace.foreground': '#3B3B3B'
      }
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        onSave(tempContent);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSave, tempContent]);

  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-800 text-gray-300 px-4 py-2 text-sm flex justify-between items-center">
        <span>
          {fileName}
          {isModified && <span className="ml-2 text-yellow-500">●</span>}
        </span>
        <button 
          onClick={onExecute}
          className="text-gray-300 hover:text-white focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <Editor
        height="100%"
        language={language}
        value={tempContent}
        theme="customDarkTheme"
        onChange={handleEditorChange}
        beforeMount={handleEditorWillMount}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          fontFamily: "'Fira Code', monospace",
          lineNumbers: 'on',
          roundedSelection: false,
          readOnly: false,
          cursorStyle: 'line',
          automaticLayout: true,
          padding: { top: 16 },
          suggestFontSize: 14,
          suggestLineHeight: 22,
          renderLineHighlight: 'all',
        }}
      />
    </div>
  );
};

export default CodeEditor;
