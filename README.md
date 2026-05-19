# 🚀 MetaFlow v2 - PWA com Firebase

MetaFlow é um aplicativo web progressivo (PWA) para acompanhamento de objetivos, hábitos, diário pessoal e progresso, com autenticação Google e sincronização de dados em tempo real via Firebase.

## ✨ Características

- 🔐 **Autenticação Google** - Login seguro com Firebase Authentication
- ☁️ **Sincronização em Nuvem** - Dados salvos no Firebase Firestore
- 📦 **PWA Instalável** - Funciona como app native em qualquer dispositivo
- 🎨 **6 Temas Premium** - Personalize sua experiência
- 🌙 **Modo Offline** - Continua funcionando sem internet
- 📱 **Totalmente Responsivo** - Desktop e mobile perfeitos
- ⚡ **Performance** - Carregamento rápido com Vite
- 🎯 **Objetivos** - Crie, acompanhe e complete seus objetivos
- ✅ **Hábitos** - Construa sequências e mantenha a consistência
- 📔 **Diário** - Registre seus pensamentos e reflexões
- 📊 **Progresso** - Visualize suas conquistas

## 🛠️ Stack Tecnológico

- **React 18** - UI interativa
- **Vite** - Build tool rápido
- **Tailwind CSS** - Estilo responsivo
- **Firebase Authentication** - Login com Google
- **Firebase Firestore** - Banco de dados em nuvem
- **Lucide React** - Ícones lindos
- **date-fns** - Manipulação de datas

## 📋 Pré-requisitos

- Node.js 16+ instalado
- npm ou yarn
- Conta Google
- Projeto Firebase criado

## 🚀 Setup Rápido

### 1. Clonar o Repositório

```bash
git clone <seu-repo>
cd metaflow
npm install
```

### 2. Configurar Firebase

#### 2.1 Criar um Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Clique em "Criar projeto"
3. Nome: `MetaFlow` (ou seu preferido)
4. Desative "Ativar Google Analytics" por enquanto
5. Clique em "Criar projeto"

#### 2.2 Habilitar Authentication

1. No Firebase Console, vá em **Authentication**
2. Clique em **Iniciar**
3. Vá em **Sign-in method**
4. Habilite **Google**
5. Escolha um email de suporte (pode ser seu email)
6. Clique **Salvar**

#### 2.3 Criar Firestore Database

1. No Firebase Console, vá em **Firestore Database**
2. Clique em **Criar banco de dados**
3. Localização: Escolha a mais próxima do seu usuário
4. Modo de segurança: **Iniciar no modo de teste**
   - ⚠️ **Importante**: Vamos configurar as regras depois
5. Clique **Criar**

### 3. Obter Credenciais Firebase

1. No Firebase Console, vá em **Configurações do Projeto** (ícone de engrenagem)
2. Vá em **Geral**
3. Copie as credenciais do seu app na seção "Teus apps"
4. Clique em **Copiar** para pegar as informações

### 4. Configurar Variáveis de Ambiente

1. Copie `.env.local.example` para `.env.local`:

```bash
cp .env.local.example .env.local
```

2. Abra `.env.local` e preenc ha com suas credenciais Firebase:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_REPO_NAME=
```

### 5. Configurar Regras de Firestore

1. No Firebase Console, vá em **Firestore Database**
2. Clique em **Regras**
3. Substitua o conteúdo com o do arquivo `firestore.rules`
4. Clique **Publicar**

**Conteúdo das regras de segurança:**

```firestore
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## 🏃 Desenvolvimento

### Iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

### Build para produção:

```bash
npm run build
```

Os arquivos compilados ficarão em `dist/`.

### Visualizar produção localmente:

```bash
npm run preview
```

## 📦 Deploy no GitHub Pages

### 1. Configurar o Repositório

```bash
# Se seu repo for: github.com/seu-usuario/metaflow
# Configure no .env.local ou no vite.config.js:
VITE_REPO_NAME=metaflow
```

### 2. Configure GitHub Pages

1. Vá em Settings do seu repositório
2. Vá em **Pages**
3. Em "Source", selecione **GitHub Actions**

### 3. Criar Arquivo de Auto-deploy

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 4. Deploy

```bash
git add .
git commit -m "chore: setup deploy"
git push origin main
```

Seu app estará em: `https://seu-usuario.github.io/metaflow`

## 🔐 Segurança e Boas Práticas

### ✅ Chaves Públicas vs Secretas

- **Firebase Config**: É pública (está no `.env.local`) - isso é seguro!
- **Firestore Rules**: Controlam o acesso - são essenciais

### ✅ Como Funciona a Segurança

1. **Autenticação**: Google gerencia a identidade do usuário
2. **Firestore Rules**: Garantem que cada usuário só acesse seus dados
3. **Tokens**: Firebase emite JWT seguros que são validados

### ✅ Dados Sensíveis

```javascript
// NÃO faça isso:
const apiKey = "sk_live_12345"; // Nunca no código!

// Faça assim:
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY; // Em .env.local
```

## 📊 Estrutura de Dados

### Firestore Collections:

```
users/{userId}
├── name
├── email
├── photoURL
├── createdAt
└── updatedAt

goals/{goalId}
├── title
├── description
├── categoryId
├── progressType (manual, numeric, tasks, time)
├── currentValue
├── targetValue
├── status (active, completed, overdue, risk, paused)
├── priority
├── startDate
├── endDate
└── ...

habits/{habitId}
├── title
├── description
├── categoryId
├── frequency (daily, weekly, custom)
├── weekDays (para weekly)
├── completedDates
├── currentStreak
├── bestStreak
├── status
└── ...

categories/{categoryId}
├── name
├── color
├── icon
└── ...

journalEntries/{entryId}
├── date
├── mood
├── text
├── categoryId
├── relatedGoalIds
├── relatedHabitIds
└── ...

checkIns/{checkInId}
├── date
├── goalId
├── habitId
├── note
├── progressDelta
├── completedTasks
└── ...

settings/app
├── theme
├── preferredView
├── createdAt
└── updatedAt
```

## 🎨 Temas Disponíveis

1. **Azul Premium** - Profissional e moderno
2. **Roxo Noturno** - Criativo e elegante
3. **Verde Evolução** - Calm e natural
4. **Âmbar Foco** - Energético e motivador
5. **Vermelho Energia** - Intenso e dinâmico
6. **Minimal Dark** - Limpo e minimalista

## 🔄 Sincronização em Tempo Real

O app usa `onSnapshot()` do Firestore para sincronização em tempo real:

```javascript
// Quando você abre o app
1. Faz login com Google
2. Escuta mudanças no Firestore em tempo real
3. Se outro dispositivo criar um objetivo, aparece automaticamente
4. Offline: dados são salvos localmente via IndexedDB
5. Online: sincroniza automaticamente
```

## 📱 Instalação como PWA

### No Android:
1. Abra o app no Chrome
2. Clique no menu (⋮)
3. Clique em "Instalar app"
4. Clique em "Instalar"

### No iOS:
1. Abra o app no Safari
2. Clique em Compartilhar
3. Clique em "Adicionar à Tela de Início"
4. Nome: "MetaFlow"
5. Clique em "Adicionar"

### No Desktop:
1. Abra o app no Chrome/Edge
2. Clique no ícone de instalar (canto superior direito)
3. Clique em "Instalar"

## 🐛 Troubleshooting

### "Credenciais Firebase não encontradas"

Certifique-se que `.env.local` existe e tem todas as variáveis preenchidas.

### Firebase Auth Error: "auth/popup-blocked-by-browser"

O popup foi bloqueado. O app vai automaticamente fazer um redirect (mais compatível com mobile).

### Dados não sincronizam

1. Verifique a conexão de internet
2. Verifique se as Firestore Rules estão publicadas
3. No console do navegador, procure por erros de CORS

### App não funciona offline

1. Certifique-se que o Service Worker foi instalado (Chrome DevTools → Application → Service Workers)
2. A página inicial é cached, mas usuário precisa estar autenticado

## 📚 Recursos Úteis

- [React Docs](https://react.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [PWA Docs](https://web.dev/progressive-web-apps/)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite](https://vitejs.dev)

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Criado com ❤️ para ajudar você a atingir seus objetivos.

---

**Precisa de ajuda?** Abra uma issue no GitHub ou envie um email.

**Gostou do projeto?** Deixe uma ⭐ e compartilhe com seus amigos!
