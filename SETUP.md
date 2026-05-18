# 🚀 Setup Rápido - MetaFlow

## 5 Passos para Colocar em Funcionamento

### Passo 1: Instalar Dependências

```bash
npm install
```

### Passo 2: Criar Projeto Firebase (2 minutos)

1. Acesse https://console.firebase.google.com
2. Clique **Criar projeto**
3. Nome: MetaFlow
4. Clique **Continuar** → **Criar projeto** (desabilite Analytics)

### Passo 3: Habilitar Google Sign-In

1. Em **Authentication** → **Sign-in method**
2. Habilite **Google**
3. Se pedir email de suporte, use seu próprio email
4. **Salvar**
5. Copie suas credenciais (veja abaixo)

### Passo 4: Copiar Credenciais

1. Clique o ícone de **engrenagem** → **Configurações do Projeto**
2. Role para baixo até "Seu apps"
3. Você verá algo assim:

```javascript
{
  "apiKey": "AIzaSyD...",
  "authDomain": "seu-projeto.firebaseapp.com",
  "projectId": "seu-projeto",
  "storageBucket": "seu-projeto.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:abc..."
}
```

### Passo 5: Configurar .env.local

1. Copie `.env.local.example` para `.env.local`:

```bash
cp .env.local.example .env.local
```

2. Abra `.env.local` e preencha:

```env
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc...
VITE_REPO_NAME=
```

### Passo 6: Ativar Firestore

1. Vá em **Firestore Database**
2. Clique **Criar banco de dados**
3. Escolha sua região
4. **Modo de teste** (você vai mudar depois)
5. **Criar**

### Passo 7: Atualizar Regras de Firestore

1. Em Firestore, clique **Regras**
2. **Copie** o conteúdo de `firestore.rules`
3. **Cole** no editor do Firebase
4. **Publicar**

### Passo 8: Rodар Localmente!

```bash
npm run dev
```

Pronto! 🎉 Acesse http://localhost:3000

---

## 📱 Publicar no GitHub Pages

### Setup (primeira vez):

1. Crie um repo vazio no GitHub
2. Clone para seu computador
3. Adicione os arquivos do MetaFlow
4. Substitua `<seu-usuario>` e `<seu-repo>`:

```bash
git remote add origin https://github.com/seu-usuario/seu-repo.git
git branch -M main
git push -u origin main
```

### Configurar Deploy Automático

Crie `.github/workflows/deploy.yml` (já está no projeto):

```bash
# Já está criado, só fazer push
git add .github
git commit -m "chore: add deploy workflow"
git push
```

### Configurar Domínio

1. Settings → Pages
2. Branch: `gh-pages`
3. Pronto! Seu app estará em `https://seu-usuario.github.io/seu-repo`

Se for GitHub Pages no root (username.github.io):
- Deixe `VITE_REPO_NAME=` vazio

Se for projeto (username.github.io/metaflow):
- Configure `VITE_REPO_NAME=metaflow`

---

## ❌ Troubleshooting

### "Não consigo fazer login"

**Problema**: Popup bloqueado ou erro de CORS

**Solução**: O app usa `signInWithPopup` com fallback para `signInWithRedirect`. Se o popup for bloqueado, automático vai para redirect (melhor no mobile).

### "Minhas alterações não salvam"

**Problema**: Erro de permissão no Firestore

**Solução**:
1. Publique as regras novamente (Firestore → Regras)
2. Certifique-se que está logado
3. Verifique o console do navegador para erros Firebase

### "Webpack ou build quebrado"

**Solução**:
```bash
rm -rf node_modules dist package-lock.json
npm install
npm run build
```

### "Service Worker não funciona"

**Solução**:
```bash
# Clear cache do navegador
# Chrome DevTools → Application → Storage → Clear site data
npm run dev
```

---

## 🎯 Próximos Passos

1. ✅ **Instalar** - Você fez!
2. ✅ **Configurar Firebase** - Você fez!
3. ✅ **Rodar** - Você fez!
4. 📱 **Instalar como PWA** - Testar no seu dispositivo
5. 🎨 **Customizar** - Adicioar seus ícones em `public/`
6. 🚀 **Deploy** - Publicar no GitHub Pages

---

## 📚 Recursos Úteis

- [Firebase Console](https://console.firebase.google.com)
- [Vite DevServer](http://localhost:3000)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Firebase Rules Simulator](https://console.firebase.google.com/project/_/firestore/rules)

---

**Está tudo pronto! Divirta-se criando seu MetaFlow! 🚀**
