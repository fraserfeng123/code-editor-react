import React, { useState, useRef, useEffect } from 'react';
import { useFileStore } from '../store/FileStore';

interface FileContent {
  name: string;
  content: string;
  language: string;
  realFileName: string;
  isModified: boolean;
}

interface FileExplorerProps {
  files: FileContent[];
  onFileSelect: (file: FileContent) => void;
}

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  realFileName: string;
  children?: FileNode[];
  content?: string;
  language?: string;
}

const FileItem: React.FC<{
  node: FileNode;
  depth: number;
  onFileSelect: FileExplorerProps['onFileSelect'];
  isSelected: boolean;
  selectedNode: FileNode | null;
  onSelect: (node: FileNode) => void;
  onNewFile: (parentPath: string) => void;
  onNewFolder: (parentPath: string) => void;
}> = ({ node, depth, onFileSelect, isSelected, selectedNode, onSelect, onNewFile, onNewFolder }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'folder') {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = () => {
    onSelect(node);
    if (node.type === 'file' && node.content && node.language) {
      onFileSelect({ 
        name: node.name, 
        realFileName: node.realFileName,
        content: node.content, 
        language: node.language, 
        isModified: false 
      });
    }
  };

  const handleNewFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNewFile(node.name);
  };

  const handleNewFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNewFolder(node.name);
  };

  return (
    <div>
      <div 
        className={`flex items-center cursor-pointer hover:bg-gray-700 py-0.5 px-1 rounded-md transition-colors duration-200 ease-in-out ${
          isSelected ? 'bg-indigo-600 text-white' : 'text-gray-300'
        }`}
        style={{ paddingLeft: `${depth * 8 + 4}px` }}
        onClick={handleSelect}
      >
        <span className="w-4 text-center inline-flex justify-center items-center" onClick={toggleOpen}>
          {node.type === 'folder' && (
            isOpen ? '▾' : '▸'
          )}
        </span>
        <span className="w-4 text-center inline-flex justify-center items-center mr-1">
          {node.type === 'folder' ? '📁' : '📄'}
        </span>
        <span className="text-xs truncate flex-grow">{node.realFileName}</span>
        {depth === 0 && node.type === 'folder' && (
          <div className="flex space-x-1">
            <button
              className="p-0.5 rounded-md hover:bg-gray-600 transition-colors duration-200 ease-in-out"
              onClick={handleNewFile}
              title="新建文件"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              className="p-0.5 rounded-md hover:bg-gray-600 transition-colors duration-200 ease-in-out"
              onClick={handleNewFolder}
              title="新建文件夹"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm7 5a1 1 0 10-2 0v1H8a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
      {node.type === 'folder' && isOpen && node.children && (
        <div className="ml-2">
          {node.children.map((child, index) => (
            <FileItem
              key={index}
              node={child}
              depth={depth + 1}
              onFileSelect={onFileSelect}
              selectedNode={selectedNode}
              isSelected={child.realFileName === selectedNode?.realFileName}
              onSelect={onSelect}
              onNewFile={onNewFile}
              onNewFolder={onNewFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer: React.FC<FileExplorerProps> = ({ files, onFileSelect }) => {
  const { state, dispatch } = useFileStore();
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);
  const [editingNode, setEditingNode] = useState<{ path: string; type: 'file' | 'folder' } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getParentPath = (node: FileNode | null): string => {
    if (!node) return 'code-editor-react';
    if (node.type === 'folder') return node.name;
    return node.name.split('/').slice(0, -1).join('/');
  };

  const handleNewFile = () => {
    const parentPath = getParentPath(selectedNode);
    setEditingNode({ path: parentPath, type: 'file' });
  };

  const handleNewFolder = () => {
    const parentPath = getParentPath(selectedNode);
    setEditingNode({ path: parentPath, type: 'folder' });
  };

  const handleSelect = (node: FileNode) => {
    setSelectedNode(node);
  };

  const handleCreateNode = (path: string, type: 'file' | 'folder', name: string) => {
    if (!name.trim()) {
      setEditingNode(null);
      return;
    }

    const newNode: FileNode = {
      name: `${path}/${name}`,
      realFileName: name,
      type: type,
      content: type === 'file' ? '' : undefined,
      language: type === 'file' ? 'plaintext' : undefined,
      children: type === 'folder' ? [] : undefined
    };

    const updatedFiles = addNodeToTree(state.files, newNode);
    dispatch({ type: 'SET_FILES', payload: updatedFiles });
    setEditingNode(null);
  };

  const addNodeToTree = (tree: FileNode[], newNode: FileNode): FileNode[] => {
    return tree.map(node => {
      if (node.name === newNode.name.split('/').slice(0, -1).join('/')) {
        return {
          ...node,
          children: [...(node.children || []), newNode].sort((a, b) => 
            a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1
          )
        };
      } else if (node.children) {
        return {
          ...node,
          children: addNodeToTree(node.children, newNode)
        };
      }
      return node;
    });
  };

  useEffect(() => {
    if (editingNode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingNode]);

  return (
    <div className="bg-gray-900 text-gray-300 p-4 rounded-lg shadow-lg h-full flex flex-col">
      <div className="space-y-1 overflow-auto flex-grow">
        {state.files.map((file, index) => (
          <FileItem
            key={index}
            node={file}
            depth={0}
            onFileSelect={onFileSelect}
            selectedNode={selectedNode}
            isSelected={selectedNode?.realFileName === file.realFileName}
            onSelect={handleSelect}
            onNewFile={handleNewFile}
            onNewFolder={handleNewFolder}
          />
        ))}
      </div>
      {editingNode && (
        <input
          ref={inputRef}
          type="text"
          className="mt-2 p-1 bg-gray-800 text-white rounded"
          placeholder={editingNode.type === 'file' ? 'Enter file name' : 'Enter folder name'}
          onBlur={(e) => handleCreateNode(editingNode.path, editingNode.type, e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleCreateNode(editingNode.path, editingNode.type, e.currentTarget.value);
            }
          }}
          autoFocus
        />
      )}
    </div>
  );
};

// 辅助函数：将扁平的文件列表转换为树形结构
function convertToTree(files: FileContent[]): FileNode[] {
  const root: FileNode[] = [];
  const map = new Map<string, FileNode>();

  files.forEach(file => {
    const parts = file.name.split('/');
    let currentLevel = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      const path = parts.slice(0, index + 1).join('/');

      if (!map.has(path)) {
        const newNode: FileNode = isFile
          ? { name: part, type: 'file', realFileName: file.realFileName, content: file.content, language: file.language }
          : { name: part, type: 'folder', realFileName: part, children: [] };

        map.set(path, newNode);
        currentLevel.push(newNode);
      }

      if (!isFile) {
        currentLevel = (map.get(path) as FileNode & { children: FileNode[] }).children;
      }
    });
  });

  return root;
}

export default FileExplorer;
