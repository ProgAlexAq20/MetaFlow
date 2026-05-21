import React, { useContext, useState, useEffect } from 'react';
import { DataContext } from '../providers/DataProvider';
import { Plus, Trash2, Edit2, X } from 'lucide-react';

const GoalsPage = () => {
  const { goals = [], createGoal, updateGoal, deleteGoal, categories = [], loading } = useContext(DataContext);
  const [showForm, setShowForm] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: categories[0]?.id || '',
    progressType: 'numeric',
    targetValue: 100,
    currentValue: 0,
    priority: 'medium',
    status: 'active',
  });

  // Update form when categories change and no goal is being edited
  useEffect(() => {
    if (!showForm && categories.length > 0 && !editingGoalId) {
      setFormData(prev => ({
        ...prev,
        categoryId: prev.categoryId || categories[0]?.id || ''
      }));
    }
  }, [categories, showForm, editingGoalId]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      categoryId: categories[0]?.id || '',
      progressType: 'numeric',
      targetValue: 100,
      currentValue: 0,
      priority: 'medium',
      status: 'active',
    });
    setEditingGoalId(null);
    setShowForm(false);
  };

  const handleEdit = (goal) => {
    setFormData({
      title: goal.title || '',
      description: goal.description || '',
      categoryId: goal.categoryId || categories[0]?.id || '',
      progressType: goal.progressType || 'numeric',
      targetValue: goal.targetValue || 100,
      currentValue: goal.currentValue || 0,
      priority: goal.priority || 'medium',
      status: goal.status || 'active',
    });
    setEditingGoalId(goal.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGoalId) {
        // Update existing goal
        await updateGoal(editingGoalId, {
          ...formData,
        });
      } else {
        // Create new goal
        await createGoal({
          ...formData,
          startDate: new Date().toISOString(),
        });
      }
      resetForm();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  if (loading) return <div className="container mx-auto p-4">Carregando...</div>;

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Meus Objetivos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition hover:opacity-90"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <Plus size={20} />
          Novo Objetivo
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
                placeholder="Ex: Aprender React"
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
                placeholder="Detalhe seu objetivo"
                className="w-full px-4 py-2 rounded-lg border h-24"
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
                <label className="block text-sm font-medium mb-2">Tipo de Progresso</label>
                <select
                  value={formData.progressType}
                  onChange={(e) => setFormData({ ...formData, progressType: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  <option value="manual">Manual</option>
                  <option value="numeric">Numérico</option>
                  <option value="tasks">Tarefas</option>
                  <option value="time">Tempo</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Valor Alvo</label>
                <input
                  type="number"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Prioridade</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition hover:opacity-90"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {editingGoalId ? 'Salvar Alterações' : 'Criar Objetivo'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg border flex items-center gap-1"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <X size={16} />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {goals.length === 0 ? (
        <div
          className="p-12 rounded-lg border text-center"
          style={{
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <p style={{ color: 'var(--color-text-secondary)' }} className="mb-4">
            Nenhum objetivo ainda
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 rounded-lg text-white transition hover:opacity-90"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Criar seu primeiro objetivo
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="p-6 rounded-lg border flex justify-between items-start"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex-1">
                <h3 className="font-bold text-lg">{goal.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm mt-1">
                  {goal.description}
                </p>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progresso</span>
                    <span>{goal.currentValue}/{goal.targetValue}</span>
                  </div>
                  <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'var(--color-border)' }}
                  >
                    <div
                      className="h-full"
                      style={{
                        width: `${(goal.currentValue / goal.targetValue) * 100}%`,
                        backgroundColor: 'var(--color-primary)',
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(goal)}
                  className="p-2 rounded-lg transition hover:opacity-80"
                  style={{ backgroundColor: 'var(--color-background)' }}
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="p-2 rounded-lg transition hover:opacity-80"
                  style={{ backgroundColor: 'var(--color-background)', color: '#EF4444' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoalsPage;
