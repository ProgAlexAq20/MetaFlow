# 📚 Índice de Arquivos do Projeto

## 🎯 Arquivos Principais de Configuração

| Arquivo | Descrição |
|---------|-----------|
| `package.json` | Dependências e scripts do projeto |
| `vite.config.js` | Configuração do Vite (build tool) |
| `tailwind.config.js` | Configuração do Tailwind CSS |
| `postcss.config.js` | Processador CSS (autoprefixer) |
| `index.html` | HTML principal (ponto de entrada) |
| `.env.local.example` | Template de variáveis de ambiente |
| `.gitignore` | Arquivos ignorados pelo Git |

## 🔐 Configuração Firebase

| Arquivo | Descrição |
|---------|-----------|
| `src/services/firebase/firebaseConfig.js` | Inicialização do Firebase |
| `src/services/firebase/firebaseConfig.example.js` | Exemplo de config |
| `src/services/firebase/authService.js` | Serviço de autenticação Google |
| `src/services/firebase/firestoreService.js` | Serviço CRUD do Firestore |
| `firestore.rules` | Regras de segurança do Firestore |

## 🏗️ Estrutura React

### Providers (Context API)

| Arquivo | Descrição |
|---------|-----------|
| `src/providers/AuthProvider.jsx` | Context de autenticação (usuário, login, logout) |
| `src/providers/DataProvider.jsx` | Context de dados (goals, habits, journal, etc.) |
| `src/providers/ThemeProvider.jsx` | Context de tema (applica temas dinâmicos) |

### Pages (Rotas)

| Arquivo | Descrição |
|---------|-----------|
| `src/pages/LoginPage.jsx` | Tela inicial com login Google |
| `src/pages/Dashboard.jsx` | Painel principal com resumo de dados |
| `src/pages/GoalsPage.jsx` | CRUD completo de objetivos |
| `src/pages/HabitsPage.jsx` | CRUD de hábitos com check-in diário |
| `src/pages/JournalPage.jsx` | Criação de entradas de diário |
| `src/pages/SettingsPage.jsx` | Configurações, temas, backup, perfil |

### Componentes

| Arquivo | Descrição |
|---------|-----------|
| `src/components/Navbar.jsx` | Barra de navegação (header) |

## 🛠️ Utilitários & Dados

| Arquivo | Descrição |
|---------|-----------|
| `src/hooks/useContexts.js` | Custom hooks (useAuth, useData, useTheme) |
| `src/utils/helpers.js` | Funções utilitárias (datas, cálculos de progresso) |
| `src/data/constants.js` | Constantes (temas, status, moods) |
| `src/data/defaultCategories.js` | Categorias padrão criadas ao registrar |

## 🎨 Estilos

| Arquivo | Descrição |
|---------|-----------|
| `src/styles/global.css` | Estilos globais e animações |

## 🚀 App Principal

| Arquivo | Descrição |
|---------|-----------|
| `src/main.jsx` | Ponto de entrada React (cria providers) |
| `src/App.jsx` | Componente raiz (roteamento, layout) |

## 📱 PWA (Progressive Web App)

| Arquivo | Descrição |
|---------|-----------|
| `public/manifest.json` | Configuração do instalável (PWA) |
| `public/sw.js` | Service Worker (cache, offline) |
| `public/ICONS.md` | Guia para criar ícones do PWA |

## 📖 Documentação

| Arquivo | Descrição |
|---------|-----------|
| `README.md` | Documentação completa do projeto |
| `SETUP.md` | Guia rápido de setup em 8 passos |
| `GUIDE_FIREBASE_SETUP.md` | Guia detalhado de configuração Firebase |
| `GUIDE_CHECKINS.md` | Como implementar Check-ins |
| `IMPLEMENTATION_SUMMARY.md` | Resumo do que foi implementado |
| `ICONS.md` | Como criar ícones para o PWA |
| `.github/workflows/deploy.yml` | Workflow automático de deploy |

## 📊 Estrutura de Diretórios

```
MetaFlow/
├── 📁 src/
│   ├── 📁 components/
│   │   └── Navbar.jsx
│   ├── 📁 pages/
│   │   ├── LoginPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── GoalsPage.jsx
│   │   ├── HabitsPage.jsx
│   │   ├── JournalPage.jsx
│   │   └── SettingsPage.jsx
│   ├── 📁 providers/
│   │   ├── AuthProvider.jsx
│   │   ├── DataProvider.jsx
│   │   └── ThemeProvider.jsx
│   ├── 📁 services/
│   │   └── 📁 firebase/
│   │       ├── firebaseConfig.js
│   │       ├── firebaseConfig.example.js
│   │       ├── authService.js
│   │       └── firestoreService.js
│   ├── 📁 hooks/
│   │   └── useContexts.js
│   ├── 📁 utils/
│   │   └── helpers.js
│   ├── 📁 data/
│   │   ├── constants.js
│   │   └── defaultCategories.js
│   ├── 📁 styles/
│   │   └── global.css
│   ├── main.jsx
│   └── App.jsx
├── 📁 public/
│   ├── manifest.json
│   ├── sw.js
│   └── ICONS.md
├── 📁 .github/
│   └── 📁 workflows/
│       └── deploy.yml
├── 📁 (ícones PNG aqui)
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── firestore.rules
├── .env.local.example
├── .gitignore
├── README.md
├── SETUP.md
├── GUIDE_FIREBASE_SETUP.md
├── GUIDE_CHECKINS.md
└── IMPLEMENTATION_SUMMARY.md
```

## 🔄 Fluxo de Dados

```
User Login
    ↓
AuthProvider (Firebase Auth)
    ↓
Usuário criado em Firestore
    ↓
DataProvider carrega dados
    ↓
ThemeProvider aplica tema salvo
    ↓
App renderiza página apropriada
    ↓
Usuário interage (criar objetivo, hábito, etc)
    ↓
DataProvider → Firestore Service → Firestore API
    ↓
Firestore sincroniza em tempo real com onSnapshot()
    ↓
UI atualiza automaticamente
```

## 🎓 Por Onde Começar?

### Para Iniciantes
1. Leia [SETUP.md](SETUP.md) - Setup rápido
2. Leia [GUIDE_FIREBASE_SETUP.md](GUIDE_FIREBASE_SETUP.md) - Configure Firebase
3. Rode `npm run dev` e teste

### Para Entender a Arquitetura
1. Leia [src/App.jsx](src/App.jsx) - Estrutura principal
2. Leia [src/providers/AuthProvider.jsx](src/providers/AuthProvider.jsx) - Como funciona auth
3. Leia [src/providers/DataProvider.jsx](src/providers/DataProvider.jsx) - Como funciona dados
4. Veja [src/pages/GoalsPage.jsx](src/pages/GoalsPage.jsx) - Exemplo de página

### Para Adicionar Features
1. Leia [GUIDE_CHECKINS.md](GUIDE_CHECKINS.md) - Exemplo de como adicionar feature
2. Copie o padrão de GoalsPage ou HabitsPage
3. Use o DataProvider para acessar dados

### Para Deploy
1. Leia [README.md](README.md) - Seção GitHub Pages
2. Configure `.env.local` com `VITE_REPO_NAME`
3. O GitHub Actions faz o resto automaticamente

## 💾 Como os Dados Fluem

### Criação de um Objetivo

1. Usuário clica "Novo Objetivo" em GoalsPage
2. Preenche o formulário
3. Clica "Criar Objetivo"
4. Função `createGoal()` do DataProvider é chamada
5. DataProvider chama `goalsService.createGoal()`
6. goalsService chama `addDoc()` no Firestore
7. Firestore Security Rules validam (`uid == userId`)
8. Dado é salvo no Firestore
9. `onSnapshot()` listener detecta mudança
10. DataProvider atualiza `setGoals()`
11. GoalsPage re-renderiza com novo objetivo

### Offline

Se o usuário estiver offline:
1. Firestore IndexedDB salva localmente
2. App continua funcionando normalmente
3. Quando online, Firestore sincroniza automaticamente

### Em Outro Dispositivo

Se abrir em outro dispositivo:
1. Login com mesmo usuário
2. DataProvider carrega dados do Firestore
3. `onSnapshot()` sincroniza em tempo real
4. Todos os dados aparecem imediatamente

## 🔌 APIs Externas Usadas

| API | Servidor | Seguro? |
|-----|----------|---------|
| Google OAuth | Google | ✅ Sim |
| Firestore | Google | ✅ Sim (com rules) |
| GitHub Actions | GitHub | ✅ Sim |

Nenhuma chamada para backend próprio - 100% serverless!

---

## 📝 Próximos Passos

### Funcionalidades Prontas para Usar
- ✅ Goals (Objetivos) - Completo
- ✅ Habits (Hábitos) - Completo
- ✅ Journal (Diário) - Completo
- ✅ Settings (Configurações) - Completo
- ✅ Themes (Temas) - Completo
- ✅ Login/Logout - Completo

### Funcionalidades para Implementar (fácil)
- ⏳ Check-ins - Veja [GUIDE_CHECKINS.md](GUIDE_CHECKINS.md)
- ⏳ Migração de dados locais - Use `storageUtils.getLocalData()`
- ⏳ Relatórios semanais - Crie nova página
- ⏳ Gráficos - Use Recharts (já instalado)

### Otimizações Futuras
- 🚀 Performance: Code splitting, lazy load
- 🚀 Animations: Adicione Framer Motion
- 🚀 Notificações: Firebase Push Notifications
- 🚀 Mobile: Adicione cordova para app nativo

---

**Tudo está documentado e pronto para começar! 🚀**
