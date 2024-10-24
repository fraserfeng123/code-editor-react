import React, { useState } from 'react';

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
  onNewFile?: () => void;
  onNewFolder?: () => void;
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
              onClick={(e) => { e.stopPropagation(); onNewFile && onNewFile(); }}
              title="新建文件"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              className="p-0.5 rounded-md hover:bg-gray-600 transition-colors duration-200 ease-in-out"
              onClick={(e) => { e.stopPropagation(); onNewFolder && onNewFolder(); }}
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer: React.FC<FileExplorerProps> = ({ files, onFileSelect }) => {
  const fileTree = convertToTree(files);
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);

  const handleNewFile = () => {
    // 处理新建文件的逻辑
    console.log('新建文件');
  };

  const handleNewFolder = () => {
    // 处理新建文件夹的逻辑
    console.log('新建文件夹');
  };

  const handleSelect = (node: FileNode) => {
    setSelectedNode(node);
  };

  return (
    <div className="bg-gray-900 text-gray-300 p-4 rounded-lg shadow-lg h-full flex flex-col">
      <div className="space-y-1 overflow-auto flex-grow">
        {fileTree.map((file, index) => (
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
