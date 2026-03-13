import React from 'react';
import ReactDOM from 'react-dom/client';
import CustomerAppPWA from './app/CustomerAppPWA';
import './styles/fonts.css';
import './styles/theme.css';
import './styles/index.css';

/**
 * Customer PWA Entry Point
 * This loads ONLY the customer app - no landing page, business dashboard, etc.
 */

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CustomerAppPWA />
  </React.StrictMode>,
);