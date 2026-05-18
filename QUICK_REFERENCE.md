# ⚡ MetaFlow - Quick Reference Card

## 🚀 Comandos Essenciais

```bash
# Instalar dependências
npm install

# Rodar em desarrollo (com hot reload)
npm run dev

# Build para produção
npm run build

# Visualizar build localmente
npm run preview

# Deploy (requer gh-pages configurado)
npm run deploy
```

## 📍 URLs Importantes

| URL | Descrição |
|-----|-----------|
| `http://localhost:3000` | Dev server local |
| `https://console.firebase.google.com` | Firebase Console |
| `https://github.com/seu-usuario/seu-repo/settings` | GitHub Pages settings |

## 🎯 Como Usar os Contextos

### useAuth - Autenticação

```javascript
import { useAuth } from '../hooks/useContexts';

const MyComponent = () => {
  const { user, loading, error, signInWithGoogle, signOut } = useAuth();
  
  return (
    <>
      {user ? (
        <>
          <p>Olá {user.displayName}</p>
          <button onClick={signOut}>Sair</button>
        </>
      ) : (
        <button onClick={signInWithGoogle}>Login Google</button>
      )}
    </>
  );
};
```

### useData - Dados Firestore

```javascript
import { useData } from '../hooks/useContexts';

const GoalsComponent = () => {
  const { 
    goals, 
    createGoal, 
    updateGoal, 
    deleteGoal,
    loading 
  } = useData();
  
  const handleCreate = async () => {
    await createGoal({
      title: 'Novo objetivo',
      description: 'Descrição',
      categoryId: 'cat-123',
      progressType: 'numeric',
      targetValue: 100,
      currentValue: 0,
      priority: 'high',
      status: 'active',
      startDate: new Date().toISOString(),
    });
  };
  
  return (
    <>
      {loading ? 'Carregando...' : goals.map(g => <p>{g.title}</p>)}
    </>
  );
};
```

### useTheme - Temas

```javascript
import { useTheme } from '../hooks/useContexts';

const ThemeSwitcher = () => {
  const { currentTheme, themes, changeTheme } = useTheme();
  
  return (
    <>
      <p>Tema: {currentTheme}</p>
      {Object.keys(themes).map(themeName => (
        <button 
          key={themeName}
          onClick={() => changeTheme(themeName)}
        >
          {themes[themeName].name}
        </button>
      ))}
    </>
  );
};
```

## 📊 Estrutura de Dados (Firestore)

### Goals
```javascript
{
  title: "Aprender React",
  description: "Completar curso de React avançado",
  categoryId: "cat-123",
  progressType: "numeric",      // manual, numeric, tasks, time
  currentValue: 50,
  targetValue: 100,
  priority: "high",              // low, medium, high
  status: "active",              // active, completed, overdue, risk, paused
  startDate: "2024-05-14T00:00:00.000Z",
  endDate: "2024-12-31T23:59:59.999Z",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

### Habits
```javascript
{
  title: "Exercitar",
  description: "30 minutos de exercício",
  categoryId: "cat-123",
  frequency: "daily",            // daily, weekly, custom
  weekDays: [1,2,3,4,5],         // 0=Sun, 1=Mon, ... 6=Sat
  completedDates: ["2024-05-14", "2024-05-15"],
  currentStreak: 2,
  bestStreak: 15,
  status: "active",              // active, paused
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

### Journal Entries
```javascript
{
  date: "2024-05-14T00:00:00.000Z",
  mood: "good",                  // excellent, good, neutral, bad, terrible
  text: "Texto da entrada...",
  categoryId: "cat-123",
  relatedGoalIds: ["goal-123"],
  relatedHabitIds: ["habit-456"],
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

### Categories
```javascript
{
  name: "Saúde",
  color: "#EF4444",
  icon: "Heart",                 // Lucide icon name
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

### Settings
```javascript
{
  theme: "azure-premium",        // Tema atual
  preferredView: "dashboard",    // dashboard, goals, habits, journal
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

## 🎨 Temas Disponíveis

```javascript
import { THEMES } from '../data/constants';

Object.keys(THEMES) // retorna:
// [
//   'azure-premium',
//   'purple-night',
//   'green-evolution',
//   'amber-focus',
//   'red-energy',
//   'minimal-dark'
// ]

// Acessar cores
THEMES['azure-premium'].primary      // '#38BDF8'
THEMES['azure-premium'].secondary    // '#8B5CF6'
THEMES['azure-premium'].background   // '#0F172A'
THEMES['azure-premium'].card         // '#111827'
THEMES['azure-premium'].text         // '#F8FAFC'
```

## 📈 Utilitários Úteis

### goalUtils - Cálculos de Objetivos

```javascript
import { goalUtils } from '../utils/helpers';

// Calcular status automaticamente
const status = goalUtils.calculateStatus(goal);

// Obter percentual de progresso
const percent = goalUtils.getProgressPercent(goal);

// Formatar display do progresso
const display = goalUtils.getProgressDisplay(goal);
// Retorna "50/100", "5/10 horas", "50%", etc
```

### habitUtils - Cálculos de Hábitos

```javascript
import { habitUtils } from '../utils/helpers';

// Verificar se foi completado hoje
const completedToday = habitUtils.isCompletedToday(habit);

// Calcular sequência atual
const streak = habitUtils.calculateStreak(completedDates);

// Taxa de conclusão da semana
const weekRate = habitUtils.getWeeklyCompletionRate(habit);
```

### dateUtils - Datas

```javascript
import { dateUtils } from '../utils/helpers';

// Formatar data
dateUtils.formatDate(date)           // "14/05/2024"
dateUtils.formatDate(date, 'MMM dd') // "May 14"
dateUtils.formatShort(date)          // "14/05"
dateUtils.formatMonth(date)          // "Maio 2024"

// Comparações
dateUtils.isToday(date)              // true/false
dateUtils.isOverdue(endDate)         // true/false
dateUtils.isExpiringSoon(endDate)    // true/false (< 7 dias)
dateUtils.daysUntil(date)            // número de dias
```

### storageUtils - Backup/Importar

```javascript
import { storageUtils } from '../utils/helpers';

// Exportar dados em JSON
storageUtils.exportToJSON({
  goals: [],
  habits: [],
  settings: {}
}, 'meu-backup.json');

// Importar de JSON
const file = inputElement.files[0];
const data = await storageUtils.importFromJSON(file);

// Detectar dados locais antigos
if (storageUtils.hasLocalData()) {
  // Migrar de localStorage para Firestore
}
```

## 🔄 Padrão de Criação de Feature

Quer adicionar uma nova feature? Siga este padrão:

### 1. Criar Serviço (se novo tipo de dado)

```javascript
// src/services/firebase/firestoreService.js
export const myService = {
  async getAll(userId) { ... },
  async getOne(userId, id) { ... },
  async create(userId, data) { ... },
  async update(userId, id, data) { ... },
  async delete(userId, id) { ... },
};
```

### 2. Adicionar ao DataProvider

```javascript
// src/providers/DataProvider.jsx
const [myData, setMyData] = useState([]);

const createMyData = useCallback(async (data) => {
  await myService.create(user.uid, data);
}, [user]);

value = {
  myData,
  createMyData,
  // ...
};
```

### 3. Criar Página

```javascript
// src/pages/MyPage.jsx
import { useData } from '../hooks/useContexts';

const MyPage = () => {
  const { myData, createMyData } = useData();
  
  return (
    <div>
      {/* Seu conteúdo */}
    </div>
  );
};
```

### 4. Adicionar Rota

```javascript
// src/App.jsx
case 'my-page':
  return <MyPage />;

// src/components/Navbar.jsx
{ id: 'my-page', label: 'Minha Page' }
```

## 🌐 CSS Variables (Temas)

Use essas variáveis em qualquer lugar:

```css
/* global.css ou styled components */
background-color: var(--color-primary);
color: var(--color-text);
border: 1px solid var(--color-border);
```

Ou em React:

```jsx
<div style={{ backgroundColor: 'var(--color-primary)' }}>
  ...
</div>
```

## 🔒 Firebase Rules (Cheat Sheet)

```firestore
// Apenas legue do usuário acessa seus dados
match /users/{userId} {
  allow read, write: if 
    request.auth != null && 
    request.auth.uid == userId;
}

// Subcoleções herdam as mesmas regras
match /users/{userId}/{document=**} {
  allow read, write: if 
    request.auth != null && 
    request.auth.uid == userId;
}
```

## 📱 CSS Responsive (Tailwind)

```javascript
// Mobile first
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

// Breakpoints
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
```

## 🐛 Debug Tips

```javascript
// Logar user
console.log('Current user:', authService.getCurrentUser());

// Logar contextos
useAuth(); // Se não render, algo está errado

// Verificar Firestore
// Firebase Console → Firestore → Coleções
// Veja os dados em tempo real

// Verificar Service Worker
// DevTools → Application → Service Workers

// Limpar cache
// DevTools → Storage → Clear site data
```

## 📚 Imports Mais Comuns

```javascript
// Contextos
import { useAuth } from '../hooks/useContexts';
import { useData } from '../hooks/useContexts';
import { useTheme } from '../hooks/useContexts';

// Utilitários
import { goalUtils, habitUtils, dateUtils } from '../utils/helpers';
import { THEMES, GOAL_STATUS, MOODS } from '../data/constants';

// Ícones existentes no Lucide
import { Plus, Trash2, Edit2, Settings, Check, Calendar } from 'lucide-react';

// Firebase
import { firebase } from '../services/firebase/firebaseConfig';
```

## ✅ Checklist Antes de Deploy

- [ ] Variáveis de ambiente configuradas (`.env.local`)
- [ ] Firebase Rules publicadas
- [ ] Testes locais OK (`npm run dev`)
- [ ] Build OK (`npm run build`)
- [ ] Service Worker registrado (DevTools)
- [ ] `VITE_REPO_NAME` setado se GitHub Pages
- [ ] Commit e push feito
- [ ] GitHub Actions rodou com sucesso

---

**Salve este arquivo nos favoritos! 🔖**
