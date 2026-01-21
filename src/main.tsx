import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './styles/index.css';
import { registerServiceWorker, setupInstallPrompt } from '@/utils/pwa';

// Register service worker
registerServiceWorker();

// Setup install prompt
setupInstallPrompt();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);