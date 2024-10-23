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

const FileItem: React.FC<{ node: FileNode; depth: number; onFileSelect: FileExplorerProps['onFileSelect'] }> = ({ node, depth, onFileSelect }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleOpen = () => {
    if (node.type === 'folder') {
      setIsOpen(!isOpen);
    } else if (node.type === 'file' && node.content && node.language) {
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
        className={`flex items-center cursor-pointer hover:bg-gray-700 py-1 rounded-md transition-colors duration-200 ease-in-out`}
        style={{ paddingLeft: `${depth * 12}px` }}
        onClick={toggleOpen}
      >
        <span className="w-5 text-center inline-flex justify-center items-center text-gray-400">
          {node.type === 'folder' && (
            isOpen ? '▾' : '▸'
          )}
        </span>
        <span className="w-5 text-center inline-flex justify-center items-center mr-2 text-blue-400">
          {node.type === 'folder' ? '📁' : '📄'}
        </span>
        <span className="text-sm text-gray-300">{node.realFileName}</span>
      </div>
      {node.type === 'folder' && isOpen && node.children && (
        <div className="ml-2">
          {node.children.map((child, index) => (
            <FileItem key={index} node={child} depth={depth + 1} onFileSelect={onFileSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer: React.FC<FileExplorerProps> = ({ files, onFileSelect }) => {
  // 将文件列表转换为树形结构
  const fileTree = convertToTree(files);

  return (
    <div className="bg-gray-900 text-gray-300 p-4 rounded-lg shadow-lg">
      <div className="space-y-1">
        {fileTree.map((file, index) => (
          <FileItem key={index} node={file} depth={0} onFileSelect={onFileSelect} />
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
