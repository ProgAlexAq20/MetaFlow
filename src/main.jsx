import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AuthProvider from './providers/AuthProvider';
import DataProvider from './providers/DataProvider';
import ThemeProvider from './providers/ThemeProvider';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <DataProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </DataProvider>
    </AuthProvider>
  </React.StrictMode>
);
