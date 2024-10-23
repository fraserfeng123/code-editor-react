import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { FileStoreProvider } from './store/FileStore';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <FileStoreProvider>
      <App />
    </FileStoreProvider>
  </React.StrictMode>
);
