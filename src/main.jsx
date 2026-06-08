import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './styles.css';
import { CampaignProvider } from './context/CampaignContext';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <CampaignProvider>
          <App />
        </CampaignProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);
