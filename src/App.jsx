import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from './providers/AuthProvider';
import { DataContext } from './providers/DataProvider';
import { ThemeContext } from './providers/ThemeProvider';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import GoalsPage from './pages/GoalsPage';
import HabitsPage from './pages/HabitsPage';
import JournalPage from './pages/JournalPage';
import InsightsPage from './pages/InsightsPage';
import SettingsPage from './pages/SettingsPage';
import Navbar from './components/Navbar';
import CheckInsPage from './pages/CheckInsPage';
import OnboardingModal from './components/OnboardingModal';


function App() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { loading: dataLoading, error: dataError, settings } = useContext(DataContext);
  const { currentTheme } = useContext(ThemeContext);
  const [currentPage, setCurrentPage] = React.useState('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if onboarding should be shown after login
  useEffect(() => {
    if (user && settings !== undefined && !dataLoading) {
      const shouldShowOnboarding = !settings?.onboardingCompleted;
      setShowOnboarding(shouldShowOnboarding);
    }
  }, [user, settings, dataLoading]);

  // Handle theme application on mount
  useEffect(() => {
    if (currentTheme) {
      const root = document.documentElement;
      root.setAttribute('data-theme', currentTheme);
    }
  }, [currentTheme]);

  if (authLoading) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div className="text-center">
          <div className="inline-block animate-spin-slow mb-4">
            <div
              className="w-12 h-12 border-4 rounded-full"
              style={{
                borderColor: 'var(--color-border)',
                borderTopColor: 'var(--color-primary)',
              }}
            ></div>
          </div>
          <p style={{ color: 'var(--color-text-secondary)' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'goals':
        return <GoalsPage />;
      case 'habits':
        return <HabitsPage />;
      case 'journal':
        return <JournalPage />;
      case 'insights':
        return <InsightsPage />;
      case 'check-ins':
        return <CheckInsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}
    >
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />

      {dataLoading && (
        <div className="fixed top-16 left-0 right-0 bg-yellow-900 bg-opacity-50 p-2 text-center" style={{ color: 'var(--color-primary)' }}>
          <p className="text-sm">Sincronizando dados...</p>
        </div>
      )}

      {dataError && (
        <div className="fixed top-16 left-0 right-0 bg-red-900 bg-opacity-50 p-2 text-center" style={{ color: '#FCA5A5' }}>
          <p className="text-sm">{dataError}</p>
        </div>
      )}

      <main className="flex-1 overflow-auto pt-16">
        {renderPage()}
      </main>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  );
}

export default App;
