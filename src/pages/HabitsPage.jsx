import React, { useContext, useState } from 'react';
import { DataContext } from '../providers/DataProvider';
import { Plus, Trash2, Check } from 'lucide-react';
import { habitUtils } from '../utils/helpers';

const HabitsPage = () => {
  const { habits = [], createHabit, updateHabit, deleteHabit, categories = [], loading } = useContext(DataContext);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: categories[0]?.id || '',
    frequency: 'daily',
    weekDays: [1, 2, 3, 4, 5], // Mon-Fri
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
        status: 'active',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  };

  const toggleHabitToday = async (habit) => {
    const today = new Date().toISOString().split('T')[0];
    const isCompletedToday = habitUtils.isCompletedToday(habit);
    
    const updatedDates = isCompletedToday
      ? habit.completedDates?.filter((date) => !date.includes(today)) || []
      : [...(habit.completedDates || []), today];

    await updateHabit(habit.id, {
      completedDates: updatedDates,
      currentStreak: habitUtils.calculateStreak(updatedDates),
    });
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
          {habits.map((habit) => (
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
                </div>
                <button
                  onClick={() => toggleHabitToday(habit)}
                  className="p-2 rounded-lg transition hover:opacity-80 text-white"
                  style={{
                    backgroundColor: habitUtils.isCompletedToday(habit)
                      ? 'var(--color-primary)'
                      : 'var(--color-border)',
                  }}
                >
                  <Check size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HabitsPage;
