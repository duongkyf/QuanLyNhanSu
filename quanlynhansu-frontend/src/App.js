import React from 'react';
import AppRouter from './routes/AppRouter';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext'; // <-- 1. Import AuthProvider
import 'antd/dist/reset.css';

function App() {
  return (
    // 2. Bọc AuthProvider bên ngoài cùng
    <AuthProvider>
      <DataProvider>
        <AppRouter />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;