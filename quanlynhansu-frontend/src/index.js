import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

// 1. Import cả hai Provider
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 2. Bọc ứng dụng theo thứ tự này */}
      <AuthProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);