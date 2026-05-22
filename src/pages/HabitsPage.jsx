import React, { useContext, useState } from 'react';
import { DataContext } from '../providers/DataProvider';
import { Plus, Trash2, Check } from 'lucide-react';
import { dateUtils, habitUtils } from '../utils/helpers';

const HabitsPage = () => {
  const { habits = [], createHabit, updateHabit, deleteHabit, categories = [], loading } = useContext(DataContext);
  const [showForm, setShowForm] = useState(false);
  const [savingHabitIds, setSavingHabitIds] = useState(new Set());
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: categories[0]?.id || '',
    frequency: 'daily',
    weekDays: [1, 2, 3, 4, 5], // Mon-Fri
    dailyTargetChecks: 1,
    status: 'active',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createHabit(formData);
      setFormData({
        title: '',
        description: '',
        categoryId: categories[0]?.id || '',
        frequency: 'daily',
        weekDays: [1, 2, 3, 4, 5],
        dailyTargetChecks: 1,
        status: 'active',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  };

  const updateHabitChecksToday = async (habit, direction = 1) => {
    if (savingHabitIds.has(habit.id)) return;

    setSavingHabitIds((prev) => new Set(prev).add(habit.id));
    const today = dateUtils.getDateKey();
    const targetChecks = habitUtils.getDailyTargetChecks(habit);
    const currentCount = habitUtils.getDailyCheckCount(habit);
    const nextCount = Math.max(0, Math.min(targetChecks, currentCount + direction));
    const dailyChecks = { ...habitUtils.getDailyChecks(habit) };
    if (nextCount > 0) {
      dailyChecks[today] = nextCount;
    } else {
      delete dailyChecks[today];
    }

    const completedDates = habit.completedDates || [];
    const completedToday = nextCount >= targetChecks;
    const updatedDates = completedToday
      ? habitUtils.uniqueCompletedDates(
          habitUtils.hasCompletionOnDate(habit) ? completedDates : [...completedDates, new Date().toISOString()]
        )
      : completedDates.filter((date) => dateUtils.getDateKey(date) !== today);

    try {
      const currentStreak = habitUtils.calculateStreak(updatedDates);
      await updateHabit(habit.id, {
        dailyTargetChecks: targetChecks,
        dailyChecks,
        completedDates: updatedDates,
        currentStreak,
        bestStreak: Math.max(habit.bestStreak || 0, currentStreak),
      });
    } finally {
      setSavingHabitIds((prev) => {
        const next = new Set(prev);
        next.delete(habit.id);
        return next;
      });
    }
  };

  if (loading) return <div className="container mx-auto p-4">Carregando...</div>;

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Meus Hábitos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition hover:opacity-90"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <Plus size={20} />
          Novo Hábito
        </button>
      </div>

      {showForm && (
        <div
          className="p-6 rounded-lg border mb-8"
          style={{
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Exercitar"
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhe seu hábito"
                className="w-full px-4 py-2 rounded-lg border h-20"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Categoria</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Frequência</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                  <option value="custom">Customizado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Checks por dia</label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.dailyTargetChecks}
                onChange={(e) => setFormData({ ...formData, dailyTargetChecks: Number(e.target.value) || 1 })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                Use 1 para hábitos simples ou mais para metas como estudar 3 vezes no dia.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition hover:opacity-90"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Criar Hábito
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg border"
                style={{ borderColor: 'var(--color-border)' }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {habits.length === 0 ? (
        <div
          className="p-12 rounded-lg border text-center"
          style={{
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <p style={{ color: 'var(--color-text-secondary)' }} className="mb-4">
            Nenhum hábito ainda
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 rounded-lg text-white transition hover:opacity-90"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Criar seu primeiro hábito
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {habits.map((habit) => {
            const targetChecks = habitUtils.getDailyTargetChecks(habit);
            const todayChecks = habitUtils.getDailyCheckCount(habit);
            const checksLeft = Math.max(0, targetChecks - todayChecks);
            const completedToday = todayChecks >= targetChecks;

            return (
            <div
              key={habit.id}
              className="p-6 rounded-lg border"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{habit.title}</h3>
                  <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm mt-1">
                    {habit.description}
                  </p>
                </div>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="p-2 rounded-lg transition hover:opacity-80"
                  style={{ backgroundColor: 'var(--color-background)', color: '#EF4444' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex justify-between items-end mt-4">
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Sequência: {habit.currentStreak || 0} dias
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Melhor: {habit.bestStreak || 0} dias
                  </p>
                  <p className="text-sm mt-3 font-medium">
                    Hoje: {Math.min(todayChecks, targetChecks)}/{targetChecks} checks
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {completedToday
                      ? 'Dia concluído'
                      : `Faltam ${checksLeft} ${checksLeft === 1 ? 'check' : 'checks'} para concluir o dia`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateHabitChecksToday(habit, -1)}
                    disabled={savingHabitIds.has(habit.id) || todayChecks <= 0}
                    className="px-3 py-2 rounded-lg border text-sm font-medium transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    Desfazer
                  </button>
                  <button
                    onClick={() => updateHabitChecksToday(habit, 1)}
                    disabled={savingHabitIds.has(habit.id) || completedToday}
                    className="px-3 py-2 rounded-lg transition hover:opacity-80 text-white disabled:cursor-not-allowed disabled:opacity-60 flex items-center gap-2"
                    style={{
                      backgroundColor: completedToday
                        ? 'var(--color-primary)'
                        : 'var(--color-secondary)',
                    }}
                  >
                    <Check size={18} />
                    {completedToday ? 'Concluído' : '+ check'}
                  </button>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
};

export default HabitsPage;
