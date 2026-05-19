# Guia de Deploy do MetaFlow

## Pré-requisitos

1. **Node.js 18+** instalado
2. **Conta no Firebase** com projeto criado
3. **Repositório no GitHub**

## Configuração do Firebase

### 1. Criar Projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto chamado "MetaFlow" (ou use um existente)
3. Registre um app Web no projeto

### 2. Configurar Autenticação

1. No Firebase Console, vá em **Authentication**
2. Ative o provedor **Google**
3. Adicione o domínio do GitHub Pages nasAuthorized domains:
   - Para desenvolvimento: `localhost`
   - Para produção: `seu-usuario.github.io`

### 3. Configurar Firestore

1. No Firebase Console, vá em **Firestore Database**
2. Crie um banco de dados no modo **production**
3. Escolha a região mais próxima (ex: `southamerica-east1` para Brasil)

### 4. Obter Credenciais

No Firebase Console:
1. Vá em **Project Settings** (engrenagem)
2. Em **Your apps**, selecione o app Web
3. Copie as credenciais da configuração do SDK

## Configuração Local

### 1. Clonar Repositório

```bash
git clone https://github.com/seu-usuario/MetaFlow.git
cd MetaFlow
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.local.example .env.local

# Edite .env.local com suas credenciais do Firebase
nano .env.local
```

Preencha as variáveis:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
VITE_REPO_NAME=MetaFlow  # Nome do repositório no GitHub
```

### 4. Testar Localmente

```bash
# Modo desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

## Deploy no GitHub Pages

### 1. Configurar Secrets no GitHub

No seu repositório GitHub:
1. Vá em **Settings** > **Secrets and variables** > **Actions**
2. Adicione as seguintes secrets:

| Name | Value |
|------|-------|
| `VITE_FIREBASE_API_KEY` | Sua API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Seu Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | Seu Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Seu Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Seu Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Seu App ID |

### 2. Deploy Automático

O GitHub Actions está configurado para fazer deploy automático ao fazer push na branch `main`:

```bash
# Fazer commit e push
git add .
git commit -m "Atualização do MetaFlow"
git push origin main
```

O workflow irá:
1. Instalar dependências
2. Fazer build do projeto
3. Publicar no GitHub Pages

### 3. Acessar o App

Após o deploy, seu app estará disponível em:
```
https://seu-usuario.github.io/MetaFlow/
```

## Regras de Segurança do Firestore

As regras já estão configuradas no arquivo `firestore.rules`. Para aplicar:

1. No Firebase Console, vá em **Firestore Database** > **Rules**
2. Copie o conteúdo do arquivo `firestore.rules`
3. Cole e publique

## Solução de Problemas

### Erro: "Missing Firebase configuration variables"

- Verifique se o arquivo `.env.local` existe e está preenchido corretamente
- No GitHub Actions, verifique se as secrets estão configuradas

### Erro: "auth/operation-not-allowed"

- Ative o provedor Google no Firebase Authentication
- Adicione o domínio nasAuthorized domains

### Erro: "404 Not Found" no GitHub Pages

- Verifique se o `VITE_REPO_NAME` está configurado corretamente
- Aguarde alguns minutos após o deploy

### Build falhando no GitHub Actions

- Verifique se todas as secrets estão configuradas
- Tente executar `npm run build` localmente para identificar erros

## Atualizar Deploy

Para atualizar o app:

```bash
# Fazer alterações
# ...

# Commit e push
git add .
git commit -m "Nova funcionalidade"
git push origin main
```

O GitHub Actions fará o deploy automático.

## Ícones PWA

Para que o app seja instalável, é necessário ter os seguintes arquivos na pasta `public/`:

- `icon-192x192.png` (192x192 pixels)
- `icon-512x512.png` (512x512 pixels)
- `icon-maskable-192x192.png` (192x192 pixels)
- `icon-maskable-512x512.png` (512x512 pixels)
- `favicon.ico`

Gere os ícones em [favicon.io](https://favicon.io/) ou use uma ferramenta similar.

## Domínio Próprio (Opcional)

Para usar um domínio próprio:

1. No GitHub Pages settings, adicione seu domínio no campo **Custom domain**
2. No arquivo `.env.local`, deixe `VITE_REPO_NAME=` vazio
3. No `manifest.json`, altere `start_url` e `scope` para `/`