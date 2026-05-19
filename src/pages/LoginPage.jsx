import React, { useContext, useState } from 'react';
import { AuthContext } from '../providers/AuthProvider';
import { Zap, Target, Book, TrendingUp } from 'lucide-react';

const LoginPage = () => {
  const { signInWithGoogle, loading, error } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign-in failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Target,
      title: 'Objetivos',
      description: 'Defina e acompanhe seus objetivos pessoais',
    },
    {
      icon: Zap,
      title: 'Hábitos',
      description: 'Construa hábitos duradouros com consistência',
    },
    {
      icon: Book,
      title: 'Diário',
      description: 'Registre sua evolução e reflexões diárias',
    },
    {
      icon: TrendingUp,
      title: 'Progresso',
      description: 'Visualize seu avanço em tempo real',
    },
  ];

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden"
      style={{
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text)',
      }}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div
          className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}
        ></div>
        <div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: 'var(--color-secondary)', opacity: 0.1 }}
        ></div>
      </div>

      <div className="relative z-10 max-w-lg w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: 'var(--color-primary)',
                boxShadow: `0 0 20px rgba(56, 189, 248, 0.3)`,
              }}
            >
              <Zap size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: 'var(--color-primary)' }}>
            MetaFlow
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Acompanhe seus objetivos, registre sua evolução e transforme intenção em rotina.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-4 rounded-lg"
                style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
              >
                <Icon size={24} style={{ color: 'var(--color-primary)' }} className="mb-3" />
                <p className="font-semibold text-sm">{feature.title}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading || loading}
          className="w-full py-3 px-4 rounded-lg font-semibold text-white flex items-center justify-center gap-3 transition duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {isLoading || loading ? (
            <>
              <span className="inline-block animate-spin-slow">⏳</span>
              Conectando...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Entrar com Google
            </>
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div
            className="mt-6 p-4 rounded-lg"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #EF4444' }}
          >
            <p className="text-sm" style={{ color: '#FCA5A5' }}>
              {error}
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs mt-8" style={{ color: 'var(--color-text-secondary)' }}>
          Seus dados são salvos de forma segura no Firebase. Nunca compartilhamos seu email.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
