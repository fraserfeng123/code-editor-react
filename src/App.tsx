import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import FileExplorer, { FileNode } from './components/FileExplorer';
import CodeEditor from './components/CodeEditor';
import Debugger from './components/Debugger';
import Markdown from 'markdown-to-jsx';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FileStoreProvider, useFileStore } from './store/FileStore';

interface FileContent {
  name: string;
  realFileName: string;
  content: string;
  language: string;
  isModified: boolean;
}

function AppContent() {
  const { state, dispatch } = useFileStore();
  const [files, setFiles] = useState<FileContent[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileContent | null>(null);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<{ type: 'Info' | 'Error' | 'Warning'; message: string }[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const convertedFiles = convertToFileContent(state.files);
    setFiles(convertedFiles);
  }, [state.files]);

  const handleFileSelect = (file: FileContent) => {
    if (selectedFile && selectedFile.isModified) {
      updateFileInList(selectedFile);
    }
    const updatedFile = files.find(f => f.realFileName === file.realFileName) || file;
    setSelectedFile(updatedFile);
    setDebugLogs([]);
    setExecutionResult(null);
  };

  const updateFileInList = (updatedFile: FileContent) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.realFileName === updatedFile.realFileName ? { ...updatedFile } : file
      )
    );
  };

  const handleContentChange = () => {
    if (selectedFile) {
      setSelectedFile(prevFile => {
        if (prevFile) {
          return {
            ...prevFile,
            isModified: true
          };
        }
        return prevFile;
      });
    }
  };

  const handleExecute = () => {
    if (selectedFile) {
      let result = '';
      setDebugLogs([]);
      switch (selectedFile.language) {
        case 'javascript':
          try {
            const originalConsoleLog = console.log;
            const logs: string[] = [];
            console.log = (...args) => {
              logs.push(args.map(arg => JSON.stringify(arg)).join(' '));
            };
            
            const func = new Function(selectedFile.content);
            result = func();
            
            console.log = originalConsoleLog;
            
            setDebugLogs(logs.map(log => ({ type: 'Info', message: log })));
            result = JSON.stringify(result, null, 2);
          } catch (error) {
            result = `Error: ${error}`;
            setDebugLogs([{ type: 'Error', message: result }]);
          }
          break;
        case 'html':
          result = selectedFile.content;
          if (iframeRef.current) {
            const iframe = iframeRef.current;
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
              iframeDoc.open();
              iframeDoc.write(result);
              iframeDoc.close();
            }
          }
          break;
        case 'markdown':
          result = selectedFile.content;
          break;
        default:
          result = `Execution not supported for ${selectedFile.language} files.`;
      }
      setExecutionResult(result);
    }
  };

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write('');
        iframeDoc.close();
      }
    }
  }, [selectedFile]);

  const CodeBlock = ({ className, children }: { className?: string; children: string }) => {
    const language = className ? className.replace(/language-/, '') : 'text';
    return (
      <SyntaxHighlighter language={language} style={vscDarkPlus as any}>
        {children}
      </SyntaxHighlighter>
    );
  };

  const renderPreview = () => {
    if (!selectedFile) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          请选择一个文件以开始编辑
        </div>
      );
    }

    switch (selectedFile.language) {
      case 'html':
        return <iframe ref={iframeRef} className="w-full h-full border-none" title="HTML Preview" />;
      case 'markdown':
        return (
          <div className="p-4 overflow-auto h-full bg-white text-gray-800 markdown-preview">
            <Markdown
              options={{
                overrides: {
                  code: {
                    component: CodeBlock,
                  },
                },
              }}
            >
              {executionResult || selectedFile.content}
            </Markdown>
          </div>
        );
      default:
        return (
          <pre className="p-4 text-gray-800 overflow-auto h-full">
            {executionResult || selectedFile.content}
          </pre>
        );
    }
  };

  const handleSave = (newContent: string) => {
    if (selectedFile) {
      const savedFile = { ...selectedFile, content: newContent, isModified: false };
      setSelectedFile(savedFile);
      updateFileInList(savedFile);
      dispatch({ type: 'UPDATE_FILE', payload: { realFileName: savedFile.realFileName, content: newContent } });
    }
  };

  const convertToFileContent = (nodes: FileNode[]): FileContent[] => {
    const result: FileContent[] = [];
    const traverse = (node: FileNode, path: string = '') => {
      const newPath = path ? `${path}/${node.name}` : node.name;
      if (node.type === 'file') {
        result.push({
          name: node.name,
          realFileName: node.realFileName,
          content: node.content || '',
          language: node.language || 'text',
          isModified: false
        });
      } else if (node.children) {
        node.children.forEach(child => traverse(child, newPath));
      }
    };
    nodes.forEach(node => traverse(node));
    return result;
  };

  return (
    <div className="flex h-screen bg-gray-800">
      <div className="w-[250px] p-4 overflow-auto">
        <FileExplorer files={files} onFileSelect={handleFileSelect} />
      </div>
      
      <div className="flex-1 bg-gray-900">
        <div className="h-full w-full">
          {selectedFile ? (
            <CodeEditor
              key={selectedFile.name}
              language={selectedFile.language}
              value={selectedFile.content}
              onChange={handleContentChange}
              fileName={selectedFile.name}
              isModified={selectedFile.isModified}
              onExecute={handleExecute}
              onSave={handleSave}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
               请选择一个文件以开始编辑
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 bg-gray-900 p-4 overflow-auto flex flex-col">
        <div className="bg-white flex-1 rounded-lg shadow-lg overflow-hidden mb-4">
          {renderPreview()}
        </div>
        <div className="h-[300px]">
          <Debugger language={selectedFile?.language || 'none'} logs={debugLogs} />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <FileStoreProvider>
      <AppContent />
    </FileStoreProvider>
  );
}

export default App;
