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
    name: 'code-editor-react',
    realFileName: 'code-editor-react',
    type: 'folder',
    children: [
      {
        name: 'code-editor-react/src',
        realFileName: 'src',
        type: 'folder',
        children: [
          {
            name: 'code-editor-react/src/components',
            realFileName: 'components',
            type: 'folder',
            children: [
              {
                name: 'code-editor-react/src/components/App.tsx',
                realFileName: 'App.tsx',
                type: 'file',
                content: `import React from 'react';
import Header from './Header';
import Footer from './Footer';

const App: React.FC = () => {
  return (
    <div className="App">
      <Header />
      <main>
        <h1>Welcome to Code Editor React</h1>
        <p>This is a simple React + TypeScript project.</p>
      </main>
      <Footer />
    </div>
  );
};

export default App;`,
                language: 'typescript'
              },
              {
                name: 'code-editor-react/src/components/Header.tsx',
                realFileName: 'Header.tsx',
                type: 'file',
                content: `import React from 'react';

const Header: React.FC = () => {
  return (
    <header>
      <h1>Code Editor React</h1>
      <nav>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;`,
                language: 'typescript'
              },
              {
                name: 'code-editor-react/src/components/Footer.tsx',
                realFileName: 'Footer.tsx',
                type: 'file',
                content: `import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer>
      <p>&copy; 2023 Code Editor React. All rights reserved.</p>
    </footer>
  );
};

export default Footer;`,
                language: 'typescript'
              }
            ]
          },
          {
            name: 'code-editor-react/src/index.tsx',
            realFileName: 'index.tsx',
            type: 'file',
            content: `import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);`,
            language: 'typescript'
          },
          {
            name: 'code-editor-react/src/index.css',
            realFileName: 'index.css',
            type: 'file',
            content: `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}`,
            language: 'css'
          }
        ]
      },
      {
        name: 'code-editor-react/public',
        realFileName: 'public',
        type: 'folder',
        children: [
          {
            name: 'code-editor-react/public/index.html',
            realFileName: 'index.html',
            type: 'file',
            content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Code Editor React - A simple React + TypeScript project" />
    <title>Code Editor React</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`,
            language: 'html'
          }
        ]
      },
      {
        name: 'code-editor-react/package.json',
        realFileName: 'package.json',
        type: 'file',
        content: `{
  "name": "code-editor-react",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@types/node": "^12.0.0",
    "@types/react": "^17.0.0",
    "@types/react-dom": "^17.0.0",
    "react": "^17.0.2",
    "react-dom": "^17.0.2",
    "react-scripts": "4.0.3",
    "typescript": "^4.1.2"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`,
        language: 'json'
      },
      {
        name: 'code-editor-react/tsconfig.json',
        realFileName: 'tsconfig.json',
        type: 'file',
        content: `{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ]
}`,
        language: 'json'
      },
      {
        name: 'code-editor-react/README.md',
        realFileName: 'README.md',
        type: 'file',
        content: `# Code Editor React

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### \`npm start\`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### \`npm test\`

Launches the test runner in the interactive watch mode.

### \`npm run build\`

Builds the app for production to the \`build\` folder.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).`,
        language: 'markdown'
      }
    ]
  }
];
