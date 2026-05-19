# 🔥 Guia Completo: Configurar Firebase

Este guia passo-a-passo mostra exatamente como configurar Firebase para o MetaFlow.

## 📊 O Que é Firebase?

Firebase é uma plataforma do Google que fornece:
- **Authentication** - Login seguro
- **Firestore** - Banco de dados em nuvem
- **Hosting** - Pode hospedar seu site (opcional)

Para MetaFlow, usaremos **Authentication** + **Firestore**.

---

## 🚀 Passo 1: Criar um Projeto Firebase

### 1.1 Acessar Firebase Console

Abra [console.firebase.google.com](https://console.firebase.google.com) no navegador.

Se não estiver logado na Google, faça login com sua conta Google.

### 1.2 Criar Novo Projeto

1. Clique em **Criar Projeto**
2. Nome: Digite `MetaFlow` (ou seu projeto)
3. Clique **Continuar**
4. **Desabilite** "Google Analytics" (não é necessário)
5. Clique **Criar Projeto**
6. Aguarde a criação (leva alguns segundos)

Pronto! Você está no seu projeto Firebase.

---

## 🔐 Passo 2: Ativar Google Sign-In

### 2.1 Ir para Authentication

No menu esquerdo, você verá **Build** → **Authentication**

Clique nele.

### 2.2 Iniciar Authentication

Na página de Authentication, clique em **Iniciar**.

### 2.3 Configurar Google Sign-In

1. Em "Sign-in method", clique em **Google**
2. Ativ e o toggle (azul)
3. Se pedir um "Email de suporte do projeto":
   - Use seu próprio email Gmail
   - Ninguém verá esse email
4. Clique **Salvar**

Perfeito! Google Sign-In está ativado.

---

## 📁 Passo 3: Criar Firestore Database

### 3.1 Ir para Firestore

No menu **Build** → **Firestore Database**

### 3.2 Criar Database

1. Clique **Criar banco de dados**

### 3.3 Escolher Localização

**Cloud Firestore location** - Escolha a região mais perto de você:
- `america-south1` (Brasil)
- `us-east1` (Leste dos EUA)
- `europe-west1` (Europa)

Clique **Próximo**

### 3.4 Modo de Segurança

Você verá duas opções:
- **Modo de teste** - Qualquer um pode ler/escrever (use para desenvolvimento)
- **Modo de produção** - Ninguém pode acessar (seguro, mas precisamos de regras)

**Escolha**: Modo de teste (por enquanto)

Clique **Criar**

Aguarde a criação (1-2 minutos).

---

## 🔑 Passo 4: Obter Suas Credenciais Firebase

### 4.1 Ir para Configurações do Projeto

No menu superior direito, clique no ícone de ⚙️ **engrenagem**

Clique **Configurações do Projeto**

### 4.2 Copiar a Config

Role a página para baixo até encontrar a seção **Teus apps**

Se não houver nenhum app, clique em **Web** (ícone `</>`)

Você verá algo assim:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
};
```

**Copie** cada valor (você pode usar o botão de copiar do Firebase).

---

## 📝 Passo 5: Configurar .env.local

### 5.1 Criar o Arquivo

Na pasta do projeto, **copie** `.env.local.example` para `.env.local`:

```bash
cp .env.local.example .env.local
```

### 5.2 Preencher com Suas Credenciais

Abra `.env.local` no seu editor de código.

Preencha com os dados do Firebase:

```env
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc...
VITE_REPO_NAME=
```

**Pronto!** O app agora consegue conectar ao Firebase.

---

## 🔒 Passo 6: Configurar Firestore Security Rules

### 6.1 Ir para Regras do Firestore

No **Firestore Database** → **Regras**

Você verá um editor de texto com regras padrão.

### 6.2 Substituir as Regras

1. **Selecione tudo** (Ctrl+A)
2. **Delete**
3. **Cole** este conteúdo:

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

### 6.3 Publicar as Regras

Clique em **Publicar** (botão azul).

Você verá uma barra de carregamento e depois "Publicado com sucesso".

**Essas regras garantem que cada usuário só acesse seus próprios dados!**

---

## ✅ Verificar se Está Tudo Funcionando

### 7.1 Testar Localmente

No terminal, rodeo app:

```bash
npm run dev
```

### 7.2 Testar Login

1. Abra http://localhost:3000
2. Clique em **"Entrar com Google"**
3. Você será redirecionado para Google
4. Selecione sua conta
5. Clique **Continuar**
6. Se der erro de CORS, não se preocupe - é normal em localhost

Se você vir a Dashboard, **Parabéns!** Está funcionando! 🎉

### 7.3 Testar Criação de Dados

1. Na Dashboard, clique em **"Novo Objetivo"**
2. Preencha os dados
3. Clique **"Criar Objetivo"**
4. Ele deve aparecer na lista
5. Vá no **Firebase Console** → **Firestore**
6. Você deve ver uma coleção `users` com seus dados!

---

## 🌐 Publicar no GitHub Pages

### 8.1 Atualizar .env.local para Produção

Se seu repo for `https://github.com/seu-usuario/metaflow`:

```env
VITE_REPO_NAME=metaflow
```

Se for seu **username repo** (`seu-usuario.github.io`):

```env
VITE_REPO_NAME=
```

### 8.2 Fazer Push

```bash
git add .env.local
git commit -m "chore: configure firebase"
git push origin main
```

GitHub Actions vai automaticamente:
1. Fazer build
2. Deploy para GitHub Pages
3. Seu app estará em `https://seu-usuario.github.io/seu-repo`

---

## 🐛 Troubleshooting

### "CORS Error ao fazer login"

**Problema**: Request bloqueado pelo CORS

**Causa**: Localhost não é domínio autorizado

**Solução**:
1. No Firebase Console → **Authentication** → **Settings**
2. Em "Authorized domains", click **Adicionar domínio**
3. Digite `localhost:3000`
4. Pronto!

### "Permission denied (Firestore)"

**Problema**: Não conseguir salvar dados

**Causa**: Regras não foram publicadas ou estão erradas

**Solução**:
1. Firestore Database → Regras
2. Verifique se está bem escrito
3. Clique **Publicar** novamente
4. Aguarde a barra verde

### "Minha config está errada"

**Solução**:
1. Firebase Console → Configurações do Projeto
2. Copie novamente a config
3. Atualize `.env.local`
4. Reinicie o app (`npm run dev`)

### "Não consigo criar login"

**Problema**: Popup bloqueado ou erro "auth/operation-not-supported"

**Solução**: Automático! O app vai usar redirect em vez de popup.

---

## 🔐 Perguntas de Segurança

### "Minhas credenciais Firebase estão seguras?"

**Sim!** As credenciais do Firebase são públicas. O que as protege são:
1. **Firebase Security Rules** - Controlam o acesso
2. **Google OAuth** - Autentica o usuário
3. **User ID Matching** - Cada um só acessa seus dados

### "Alguém pode ver minha chave API?"

**Sim**, mas isso é normal com Firebase. Ela é pública.

O que **não** deve ser público:
- ~~Chaves de API de backend~~
- ~~Senhas de banco de dados~~
- ~~Tokens secretos~~

Firebase foi designado para ter a chave pública!

### "E se alguém tentar hackear?"

FirebaseRules impede. Alguém tentaria:

```javascript
// 1. Ler dados de outro usuário
db.collection('users').doc('outro-uid').get()
// ❌ Bloqueado pela rule!

// 2. Deletar dados alheios
db.collection('users').doc('outro-uid').delete()
// ❌ Bloqueado pela rule!

// 3. Criar muitos dados
db.collection('users').doc(uid).collection('goals').add(...)
db.collection('users').doc(uid).collection('goals').add(...)
// ✅ Permitido, mas Firebase limita por usuário (rate limiting)
```

---

## 📚 Referências

- [Firebase Console](https://console.firebase.google.com)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/start)

---

## 🎯 Checklist Final

- ✅ Projeto Firebase criado
- ✅ Google Sign-In ativado
- ✅ Firestore Database criado
- ✅ Credenciais copiadas para `.env.local`
- ✅ Firestore Rules publicadas
- ✅ App rodando em localhost
- ✅ Login funciona
- ✅ Dados salvam no Firestore

**Se todas as caixas estão marcadas, você está pronto!** 🚀

---

**Próximo passo**: Leia o [README.md](README.md) para conhecer todo o app!
