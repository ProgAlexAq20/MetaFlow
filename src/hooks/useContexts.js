import { useContext } from 'react';
import { AuthContext } from '../providers/AuthProvider';
import { DataContext } from '../providers/DataProvider';
import { ThemeContext } from '../providers/ThemeProvider';

// Hook para acessar contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook para acessar contexto de dados
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Hook para acessar contexto de tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default {
  useAuth,
  useData,
  useTheme,
};
