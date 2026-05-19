import React, { useContext, useState } from 'react';
import { AuthContext } from '../providers/AuthProvider';
import { Menu, X, LogOut, Settings } from 'lucide-react';

const Navbar = ({ currentPage, onPageChange }) => {
  const { user, signOut } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'goals', label: 'Objetivos' },
    { id: 'habits', label: 'Hábitos' },
    { id: 'journal', label: 'Diário' },
  ];

  const handlePageChange = (pageId) => {
    onPageChange(pageId);
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handlePageChange('dashboard')}
          className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition"
          style={{ color: 'var(--color-primary)' }}
        >
          <span>MetaFlow</span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handlePageChange(item.id)}
              className="px-4 py-2 rounded-lg transition font-medium text-sm"
              style={{
                color: currentPage === item.id ? 'white' : 'var(--color-text-secondary)',
                backgroundColor: currentPage === item.id ? 'var(--color-primary)' : 'transparent',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* User Info and Mobile Menu */}
        <div className="flex items-center gap-4">
          {/* User Profile */}
          <div className="hidden sm:flex items-center gap-2">
            {user?.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-8 h-8 rounded-full"
              />
            )}
            <div className="flex flex-col">
              <p className="text-sm font-medium">{user?.displayName}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {user?.email}
              </p>
            </div>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => handlePageChange('settings')}
            className="p-2 rounded-lg transition hover:opacity-80"
            style={{
              backgroundColor: currentPage === 'settings' ? 'var(--color-primary)' : 'transparent',
            }}
            aria-label="Configurações"
          >
            <Settings size={20} />
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg transition hover:opacity-80"
            style={{ color: '#EF4444' }}
            aria-label="Sair"
          >
            <LogOut size={20} />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className="md:hidden border-t flex flex-col"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handlePageChange(item.id)}
              className="px-4 py-3 text-left transition font-medium border-b"
              style={{
                backgroundColor: currentPage === item.id ? 'var(--color-primary)' : 'transparent',
                color: currentPage === item.id ? 'white' : 'var(--color-text)',
                borderColor: 'var(--color-border)',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
