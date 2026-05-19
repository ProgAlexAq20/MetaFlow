# 📋 Guia: Implementar Check-ins

Este guia mostra como adicionar a funcionalidade de Check-ins ao MetaFlow usando os padrões já estabelecidos.

## O Que é Check-in?

Check-in é um registro diário de progresso em um objetivo específico. Exemplo:
- Objetivo: "Ler 30 livros esse ano"
- Check-in: "14/05/2024 - Compléi capitulo 5 do livro X. 5% done"

## Estrutura Firestore

```
users/{userId}/checkIns/{checkInId}
├── date (string: YYYY-MM-DD)
├── goalId (string - opcional)
├── note (string)
├── progressDelta (number - quanto avançou)
├── createdAt (timestamp)
└── updatedAt (timestamp)
```

## Passo 1: O Serviço Já Existe!

Em `src/services/firebase/firestoreService.js`, a seguinte classe já existe:

```javascript
export const checkInsService = {
  async getCheckIns(userId) { ... }
  async createCheckIn(userId, checkInData) { ... }
  async updateCheckIn(userId, checkInId, checkInData) { ... }
  async deleteCheckIn(userId, checkInId) { ... }
};
```

**Pronto para usar!**

## Passo 2: O DataProvider Já Tem!

Em `src/providers/DataProvider.jsx`:

```javascript
// Estado
const [checkIns, setCheckIns] = useState([]);

// Funções
const createCheckIn = useCallback(async (checkInData) => { ... }, [user]);
const updateCheckIn = useCallback(async (checkInId, checkInData) => { ... }, [user]);
const deleteCheckIn = useCallback(async (checkInId) => { ... }, [user]);

// No value do contexto
value = {
  checkIns,
  createCheckIn,
  updateCheckIn,
  deleteCheckIn,
  // ... outros
};
```

**Você já pode usar `useData()` para acessar!**

## Passo 3: Criar a Página de Check-ins

Crie `src/pages/CheckInsPage.jsx`:

```jsx
import React, { useContext, useState } from 'react';
import { useData } = from '../providers/DataProvider';
import { Plus, Trash2 } from 'lucide-react';

const CheckInsPage = () => {
  const { checkIns, goals, createCheckIn, deleteCheckIn } = useData();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    goalId: '',
    note: '',
    progressDelta: 5,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCheckIn({
        ...formData,
        date: new Date(formData.date).toISOString(),
      });
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        goalId: '',
        note: '',
        progressDelta: 5,
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 pb-20">
      <h1 className="text-3xl font-bold mb-8">Check-ins</h1>
      
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <Plus size={20} />
        Novo Check-in
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 p-6 rounded-lg"
          style={{
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Data</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Objetivo (opcional)</label>
              <select
                value={formData.goalId}
                onChange={(e) => setFormData({ ...formData, goalId: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <option value="">Nenhum objetivo</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nota do Progresso</label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="O que você fez?"
                className="w-full px-4 py-2 rounded-lg border h-24"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Progresso (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progressDelta}
                onChange={(e) => setFormData({ ...formData, progressDelta: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                }}
              />
            </div>

            <button type="submit" className="w-full px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Salvar Check-in
            </button>
          </div>
        </form>
      )}

      {checkIns.length === 0 ? (
        <p>Nenhum check-in ainda</p>
      ) : (
        <div className="grid gap-4 mt-6">
          {checkIns.map((checkIn) => (
            <div
              key={checkIn.id}
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <p className="font-bold">{new Date(checkIn.date).toLocaleDateString()}</p>
              <p className="mt-2">{checkIn.note}</p>
              <p className="text-sm mt-2">Progresso: +{checkIn.progressDelta}%</p>
              <button
                onClick={() => deleteCheckIn(checkIn.id)}
                className="mt-4 p-2 rounded text-white"
                style={{ backgroundColor: '#EF4444' }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckInsPage;
```

## Passo 4: Adicionar à Navegação

Em `src/App.jsx`, adicione a página ao switch:

```jsx
const renderPage = () => {
  switch (currentPage) {
    case 'goals':
      return <GoalsPage />;
    case 'habits':
      return <HabitsPage />;
    case 'journal':
      return <JournalPage />;
    case 'check-ins':  // Novo!
      return <CheckInsPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <Dashboard />;
  }
};
```

## Passo 5: Adicionar Menu

Em `src/components/Navbar.jsx`, adicione ao navItems:

```jsx
const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'goals', label: 'Objetivos' },
  { id: 'habits', label: 'Hábitos' },
  { id: 'journal', label: 'Diário' },
  { id: 'check-ins', label: 'Check-ins' },  // Novo!
];
```

## Passo 6: Usar em Outros Lugares

### Em GoalsPage - Mostrar check-ins daquele objetivo:

```jsx
const goalCheckIns = checkIns.filter((c) => c.goalId === goal.id);
return (
  <div>
    <p>{goalCheckIns.length} check-ins</p>
  </div>
);
```

### Em Dashboard - Mostrar check-ins recentes:

```jsx
const recentCheckIns = checkIns.slice(0, 5);
return (
  <div>
    {recentCheckIns.map((checkIn) => (
      <p>{checkIn.note}</p>
    ))}
  </div>
);
```

## Padrão Completo

Se você quiser adicionar outras funcionalidades, siga este padrão:

1. **Firestore Service** - Já existe em `firestoreService.js`
2. **DataContext** - Já expõe as funções em `DataProvider.jsx`
3. **Page Component** - Crie uma página (ex: `CheckInsPage.jsx`)
4. **Navigate** - Adicione ao Navbar e App
5. **Use Context** - Acesse via `useData()` no componente

## Dicas Úteis

### Acessar o contexto:
```jsx
const { checkIns, createCheckIn, goals } = useData();
```

### Criar um check-in:
```jsx
await createCheckIn({
  date: new Date().toISOString(),
  goalId: goalId,
  note: 'Progresso feito',
  progressDelta: 10,
});
```

### Sincronização automática:
O Firestore automaticamente sincroniza todos os checkIns em tempo real!

### Offline:
Os dados são salvos localmente via IndexedDB e sincronizam quando voltar online.

## Exemplo Completo de Modal

Se quiser um modal de check-in rápido em vez de página separada:

```jsx
// Em useData hook, adicione:
const [showCheckInModal, setShowCheckInModal] = useState(false);
const [selectedGoal, setSelectedGoal] = useState(null);

// Em qualquer componente:
<button onClick={() => {
  setSelectedGoal(goalId);
  setShowCheckInModal(true);
}}>
  Check-in Rápido
</button>

<Modal open={showCheckInModal}>
  {/* Formulário de check-in */}
</Modal>
```

---

**Sucesso na implementação! 🚀**

Se tiver dúvidas, revise os padrões em `GoalsPage.jsx` ou `HabitsPage.jsx` - eles seguem exatamente a mesma estrutura!
