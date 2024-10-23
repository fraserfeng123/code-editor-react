import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { FileNode } from '../components/FileExplorer';

interface FileStoreState {
  files: FileNode[];
}

type FileStoreAction =
  | { type: 'SET_FILES'; payload: FileNode[] }
  | { type: 'UPDATE_FILE'; payload: { realFileName: string; content: string } };

const initialState: FileStoreState = {
  files: localStorage.getItem("files") ? JSON.parse(localStorage.getItem("files") as string) : [],
};

const FileStoreContext = createContext<{
  state: FileStoreState;
  dispatch: React.Dispatch<FileStoreAction>;
}>({ state: initialState, dispatch: () => null });

const fileStoreReducer = (state: FileStoreState, action: FileStoreAction): FileStoreState => {
  switch (action.type) {
    case 'SET_FILES':
      return { ...state, files: action.payload };
    case 'UPDATE_FILE':
      return {
        ...state,
        files: updateFileContent(state.files, action.payload.realFileName, action.payload.content),
      };
    default:
      return state;
  }
};

const updateFileContent = (files: FileNode[], realFileName: string, content: string): FileNode[] => {
  return files.map(file => {
    if (file.realFileName === realFileName && file.type === 'file') {
      return { ...file, content };
    } else if (file.type === 'folder' && file.children) {
      return { ...file, children: updateFileContent(file.children, realFileName, content) };
    }
    return file;
  });
};

export const FileStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(fileStoreReducer, initialState);

  useEffect(() => {
    const storedFiles = localStorage.getItem('files');
    if (storedFiles && JSON.parse(storedFiles).length > 0) {
      dispatch({ type: 'SET_FILES', payload: JSON.parse(storedFiles) });
    } else {
      // 如果 localStorage 中没有数据，则使用 initialFiles
      dispatch({ type: 'SET_FILES', payload: initialFiles });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('files', JSON.stringify(state.files));
  }, [state.files]);

  return (
    <FileStoreContext.Provider value={{ state, dispatch }}>
      {children}
    </FileStoreContext.Provider>
  );
};

export const useFileStore = () => useContext(FileStoreContext);

// 将 initialFiles 移动到这里
const initialFiles: FileNode[] = [
  {
    name: '项目文件夹',
    realFileName: '项目文件夹',
    type: 'folder',
    children: [
      { 
        name: '项目文件夹/calculator.html', 
        realFileName: 'calculator.html',
        type: 'file', 
        content: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>简单计算器</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f0f0f0;
        }
        .calculator {
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            padding: 20px;
        }
        #display {
            width: 100%;
            height: 40px;
            font-size: 24px;
            text-align: right;
            margin-bottom: 10px;
            padding: 5px;
            box-sizing: border-box;
        }
        .buttons {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 5px;
        }
        button {
            width: 100%;
            padding: 10px;
            font-size: 18px;
            border: none;
            background-color: #e0e0e0;
            cursor: pointer;
        }
        button:hover {
            background-color: #d0d0d0;
        }
        .operator {
            background-color: #f0a030;
            color: white;
        }
        .operator:hover {
            background-color: #e09020;
        }
    </style>
</head>
<body>
    <div class="calculator">
        <input type="text" id="display" readonly>
        <div class="buttons">
            <button onclick="appendToDisplay('7')">7</button>
            <button onclick="appendToDisplay('8')">8</button>
            <button onclick="appendToDisplay('9')">9</button>
            <button class="operator" onclick="appendToDisplay('+')">+</button>
            <button onclick="appendToDisplay('4')">4</button>
            <button onclick="appendToDisplay('5')">5</button>
            <button onclick="appendToDisplay('6')">6</button>
            <button class="operator" onclick="appendToDisplay('-')">-</button>
            <button onclick="appendToDisplay('1')">1</button>
            <button onclick="appendToDisplay('2')">2</button>
            <button onclick="appendToDisplay('3')">3</button>
            <button class="operator" onclick="appendToDisplay('*')">*</button>
            <button onclick="appendToDisplay('0')">0</button>
            <button onclick="appendToDisplay('.')">.</button>
            <button onclick="calculate()">=</button>
            <button class="operator" onclick="appendToDisplay('/')">/</button>
            <button onclick="clearDisplay()">C</button>
        </div>
    </div>
    <script>
        function appendToDisplay(value) {
            document.getElementById('display').value += value;
        }
        function clearDisplay() {
            document.getElementById('display').value = '';
        }
        function calculate() {
            try {
                document.getElementById('display').value = eval(document.getElementById('display').value);
            } catch (error) {
                document.getElementById('display').value = 'Error';
            }
        }
    </script>
</body>
</html>`, 
        language: 'html' 
      },
      { 
        name: '项目文件夹/index.html', 
        realFileName: 'index.html', 
        type: 'file', 
        content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Document</title>\n</head>\n<body>\n  \n</body>\n</html>', 
        language: 'html' 
      },
      { 
        name: '项目文件夹/styles', 
        realFileName: 'styles',
        type: 'folder', 
        children: [
          { 
            name: '项目文件夹/styles/main.css', 
            realFileName: 'main.css', 
            type: 'file', 
            content: 'body {\n  font-family: Arial, sans-serif;\n}', 
            language: 'css' 
          },
          { 
            name: '项目文件夹/styles/responsive.css', 
            realFileName: 'responsive.css', 
            type: 'file', 
            content: '@media (max-width: 768px) {\n  /* 响应式样式 */\n}', 
            language: 'css' 
          },
        ]
      },
      { 
        name: '项目文件夹/scripts', 
        realFileName: 'scripts',
        type: 'folder', 
        children: [
          { 
            name: '项目文件夹/scripts/app.js', 
            realFileName: 'app.js', 
            type: 'file', 
            content: 'console.log("Hello, world!");', 
            language: 'javascript' 
          },
          { 
            name: '项目文件夹/scripts/utils.js', 
            realFileName: 'utils.js', 
            type: 'file', 
            content: 'function add(a, b) {\n  return a + b;\n}', 
            language: 'javascript' 
          },
        ]
      },
      { 
        name: '项目文件夹/about.html', 
        realFileName: 'about.html', 
        type: 'file', 
        content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>About</title>\n</head>\n<body>\n  <h1>About Us</h1>\n</body>\n</
        html>`, 
        language: 'html' 
      },
    ],
  },
  { 
    name: 'README.md', 
    realFileName: 'README.md', 
    type: 'file', 
    content: '# Project Name\n\nThis is a sample project.', 
    language: 'markdown' 
  },
];
