import React, { useContext, useState } from 'react';
import { AuthContext } from '../providers/AuthProvider';
import { DataContext } from '../providers/DataProvider';
import { ThemeContext } from '../providers/ThemeProvider';
import { Download, Upload, LogOut, Mail } from 'lucide-react';
import { storageUtils } from '../utils/helpers';

const SettingsPage = () => {
  const { user, signOut } = useContext(AuthContext);
  const { settings = {}, updateSettings, goals = [], habits = [], categories = [] } = useContext(DataContext);
  const { currentTheme, themes, changeTheme } = useContext(ThemeContext);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportError, setSupportError] = useState('');

  const handleExport = () => {
    const data = {
      user: user,
      settings: settings,
      goals: goals,
      habits: habits,
      categories: categories,
      exportedAt: new Date().toISOString(),
    };

    storageUtils.exportToJSON(
      data,
      `metaflow-backup-${new Date().getTime()}.json`
    );
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await storageUtils.importFromJSON(file);
      
      if (!data.user || !data.goals) {
        alert('Arquivo de backup inválido');
        return;
      }

      if (
        confirm(
          'Você tem certeza? Esta ação irá sobrescrever seus dados atuais. Recomenda-se fazer um backup primeiro.'
        )
      ) {
        // Import logic would go here
        alert('Importação não está completamente implementada. Em produção, adicione a lógica de importação.');
      }
    } catch (error) {
      alert('Erro ao importar arquivo: ' + error.message);
    }
  };

  const handleSignOut = async () => {
    if (confirm('Você tem certeza que deseja sair?')) {
      try {
        setIsSigningOut(true);
        await signOut();
      } catch (error) {
        console.error('Sign-out error:', error);
      } finally {
        setIsSigningOut(false);
      }
    }
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    
    // Validate message
    if (!supportMessage.trim()) {
      setSupportError('Digite uma mensagem antes de enviar.');
      return;
    }
    
    setSupportError('');
    
    // Prepare email data
    const subject = supportSubject.trim() || 'Suporte MetaFlow';
    const now = new Date();
    const formattedDate = now.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    
    const body = `Usuário: ${user?.displayName || 'Não informado'}
E-mail: ${user?.email || 'Não informado'}
Data: ${formattedDate}

Mensagem:
${supportMessage.trim()}`;
    
    // Open email client
    const mailtoLink = `mailto:imperiosuporte76@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    
    // Clear form after sending
    setSupportSubject('');
    setSupportMessage('');
  };

  return (
    <div className="container mx-auto p-4 pb-20 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Configurações</h1>

      {/* User Profile Section */}
      <div
        className="p-6 rounded-lg border mb-8"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <h2 className="text-xl font-bold mb-4">Seu Perfil</h2>
        
        <div className="flex items-center gap-4 mb-6">
          {user?.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-20 h-20 rounded-full"
            />
          )}
          <div>
            <p className="text-lg font-medium">{user?.displayName}</p>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: '#EF4444' }}
        >
          <LogOut size={18} />
          {isSigningOut ? 'Saindo...' : 'Sair da Conta'}
        </button>
      </div>

      {/* Theme Section */}
      <div
        className="p-6 rounded-lg border mb-8"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <h2 className="text-xl font-bold mb-4">Tema</h2>
        
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => changeTheme(key)}
              className="p-4 rounded-lg border-2 transition"
              style={{
                backgroundColor: theme.background,
                borderColor: currentTheme === key ? theme.primary : 'var(--color-border)',
                borderWidth: currentTheme === key ? '2px' : '1px',
              }}
            >
              <p className="font-medium text-sm">{theme.name}</p>
              <div className="flex gap-2 mt-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: theme.primary }}
                ></div>
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: theme.secondary }}
                ></div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Backup Section */}
      <div
        className="p-6 rounded-lg border mb-8"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <h2 className="text-xl font-bold mb-4">Backup</h2>
        
        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white transition hover:opacity-90"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Download size={18} />
            Exportar Dados
          </button>

          <label className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white transition hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: 'var(--color-secondary)' }}
          >
            <Upload size={18} />
            Importar Dados
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>

        <p
          className="text-xs mt-4"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Seus dados são salvos no Firebase Cloud Firestore. Você pode exportar um backup
          em JSON para armazenar localmente.
        </p>
      </div>

      {/* Support Section */}
      <div
        className="p-6 rounded-lg border mb-8"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <h2 className="text-xl font-bold mb-4">Suporte</h2>
        <p style={{ color: 'var(--color-text-secondary)' }} className="mb-4">
          Precisa de ajuda, encontrou um erro ou quer enviar uma sugestão?
        </p>
        
        <form onSubmit={handleSupportSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Assunto</label>
            <input
              type="text"
              value={supportSubject}
              onChange={(e) => setSupportSubject(e.target.value)}
              placeholder="Ex: Sugestão de melhoria"
              className="w-full px-4 py-2 rounded-lg border"
              style={{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Mensagem</label>
            <textarea
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              placeholder="Descreva sua dúvida, erro ou sugestão..."
              className="w-full px-4 py-2 rounded-lg border h-32"
              style={{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
              required
            />
          </div>
          
          {supportError && (
            <p style={{ color: '#FCA5A5' }} className="text-sm">
              {supportError}
            </p>
          )}
          
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white transition hover:opacity-90"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Mail size={18} />
            Enviar para suporte
          </button>
        </form>
      </div>

      {/* Data Stats Section */}
      <div
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <h2 className="text-xl font-bold mb-4">Estatísticas dos Dados</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm">
              Objetivos
            </p>
            <p className="text-2xl font-bold">{goals.length}</p>
          </div>
          <div>
            <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm">
              Hábitos
            </p>
            <p className="text-2xl font-bold">{habits.length}</p>
          </div>
          <div>
            <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm">
              Categorias
            </p>
            <p className="text-2xl font-bold">{categories.length}</p>
          </div>
          <div>
            <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm">
              Tema Atual
            </p>
            <p className="text-lg font-bold">{themes[currentTheme]?.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
