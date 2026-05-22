import React, { useContext, useState, useEffect } from 'react';
import { DataContext } from '../providers/DataProvider';
import { X, Check, Plus, BookOpen, Target, Zap, Tag } from 'lucide-react';

const QUICK_CHECK_OPTIONS = [
  { id: 'studied', label: 'Estudei', icon: '📚' },
  { id: 'exercised', label: 'Treinei', icon: '💪' },
  { id: 'worked', label: 'Trabalhei no projeto', icon: '💼' },
  { id: 'read', label: 'Li', icon: '📖' },
  { id: 'finances', label: 'Cuidei das finanças', icon: '💰' },
  { id: 'organized', label: 'Organizei minha rotina', icon: '🗂️' },
  { id: 'rested', label: 'Descansei', icon: '😴' },
  { id: 'other', label: 'Outro', icon: '✨' },
];

const QuickCheckIn = ({ isOpen, onClose, initialGoalId = '' }) => {
  const {
    createCheckIn,
    createJournalEntry,
    updateGoal,
    goals = [],
    habits = [],
    categories = [],
    checkIns = [],
    journalEntries = [],
  } = useContext(DataContext);

  const [selectedActivities, setSelectedActivities] = useState([]);
  const [note, setNote] = useState('');
  const [relatedGoalId, setRelatedGoalId] = useState('');
  const [relatedHabitId, setRelatedHabitId] = useState('');
  const [relatedCategoryId, setRelatedCategoryId] = useState('');
  const [progressDelta, setProgressDelta] = useState('');
  const [completedTasksDelta, setCompletedTasksDelta] = useState('');
  const [saveToJournal, setSaveToJournal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const contextualGoal = goals.find((goal) => goal.id === initialGoalId);

  useEffect(() => {
    if (isOpen) {
      setSelectedActivities([]);
      setNote('');
      setRelatedGoalId(initialGoalId || '');
      setRelatedHabitId('');
      setRelatedCategoryId('');
      setProgressDelta('');
      setCompletedTasksDelta('');
      setSaveToJournal(false);
    }
  }, [isOpen, initialGoalId]);

  const toggleActivity = (activityId) => {
    setSelectedActivities((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contextualGoal && selectedActivities.length === 0 && !note) return;
    if (contextualGoal && !note.trim() && !progressDelta && !completedTasksDelta) return;

    setIsSaving(true);

    try {
      // Build check-in data
      const checkInData = {
        date: new Date().toISOString(),
        activities: selectedActivities,
        note: note || '',
        goalId: relatedGoalId || null,
        relatedGoalId: relatedGoalId || null,
        habitId: relatedHabitId || null,
        relatedHabitId: relatedHabitId || null,
        categoryId: relatedCategoryId || null,
        progressDelta: progressDelta ? Number(progressDelta) : relatedGoalId && !contextualGoal ? 5 : 0,
        completedTasksDelta: completedTasksDelta ? Number(completedTasksDelta) : 0,
      };

      await createCheckIn(checkInData);

      // Optionally save to journal
      if (saveToJournal) {
        const journalData = {
          date: new Date().toISOString(),
          mood: 'good',
          text: `Check-in diário:\n${note || 'Atividades: ' + selectedActivities.map((a) => QUICK_CHECK_OPTIONS.find((o) => o.id === a)?.label).join(', ')}`,
          categoryId: relatedCategoryId || categories[0]?.id || '',
        };
        await createJournalEntry(journalData);
      }
    } catch (error) {
      console.error('Error saving check-in:', error);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-6"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">
              {contextualGoal ? 'Check-in de objetivo' : 'O que você fez hoje?'}
            </h2>
            {contextualGoal && (
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                Check-in para: {contextualGoal.title}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition hover:opacity-80"
            style={{ backgroundColor: 'var(--color-background)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!contextualGoal && (
            <div>
              <label className="block text-sm font-medium mb-3">
                Atividades rápidas
              </label>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_CHECK_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleActivity(option.id)}
                    className={`p-3 rounded-lg border text-left transition flex items-center gap-2 ${
                      selectedActivities.includes(option.id)
                        ? 'border-transparent'
                        : ''
                    }`}
                    style={{
                      backgroundColor: selectedActivities.includes(option.id)
                        ? 'var(--color-primary)'
                        : 'var(--color-background)',
                      borderColor: selectedActivities.includes(option.id)
                        ? 'var(--color-primary)'
                        : 'var(--color-border)',
                      color: selectedActivities.includes(option.id)
                        ? '#fff'
                        : 'var(--color-text)',
                    }}
                  >
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-sm">{option.label}</span>
                    {selectedActivities.includes(option.id) && (
                      <Check size={16} className="ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Note */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {contextualGoal ? 'O que foi feito' : 'Observação rápida'}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={contextualGoal ? 'Descreva o avanço neste objetivo' : 'Algum detalhe importante do seu dia?'}
              className="w-full px-4 py-3 rounded-lg border h-20 resize-none"
              style={{
                backgroundColor: 'var(--color-background)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
          </div>

          {contextualGoal && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block text-sm font-medium">
                Progresso opcional
                <input
                  type="number"
                  value={progressDelta}
                  onChange={(e) => setProgressDelta(e.target.value)}
                  placeholder="Ex: 5"
                  className="mt-2 w-full px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </label>
              <label className="block text-sm font-medium">
                Tarefas concluídas opcional
                <input
                  type="number"
                  min="0"
                  value={completedTasksDelta}
                  onChange={(e) => setCompletedTasksDelta(e.target.value)}
                  placeholder="Ex: 1"
                  className="mt-2 w-full px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </label>
            </div>
          )}

          {!contextualGoal && (
          <div className="space-y-3">
            {/* Related Goal */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <span className="flex items-center gap-2">
                  <Target size={16} />
                  Relacionar com objetivo
                </span>
              </label>
              <select
                value={relatedGoalId}
                onChange={(e) => setRelatedGoalId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              >
                <option value="">Nenhum objetivo</option>
                {goals
                  .filter((g) => g.status !== 'completed')
                  .map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title}
                    </option>
                  ))}
              </select>
            </div>

            {/* Related Habit */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <span className="flex items-center gap-2">
                  <Zap size={16} />
                  Relacionar com hábito
                </span>
              </label>
              <select
                value={relatedHabitId}
                onChange={(e) => setRelatedHabitId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              >
                <option value="">Nenhum hábito</option>
                {habits
                  .filter((h) => h.status === 'active')
                  .map((habit) => (
                    <option key={habit.id} value={habit.id}>
                      {habit.title}
                    </option>
                  ))}
              </select>
            </div>

            {/* Related Category */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <span className="flex items-center gap-2">
                  <Tag size={16} />
                  Categoria
                </span>
              </label>
              <select
                value={relatedCategoryId}
                onChange={(e) => setRelatedCategoryId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              >
                <option value="">Nenhuma categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          )}

          {/* Save to Journal Option */}
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
            <button
              type="button"
              onClick={() => setSaveToJournal(!saveToJournal)}
              className={`w-5 h-5 rounded border flex items-center justify-center transition ${
                saveToJournal ? 'bg-primary' : ''
              }`}
              style={{
                backgroundColor: saveToJournal ? 'var(--color-primary)' : 'transparent',
                borderColor: 'var(--color-border)',
              }}
            >
              {saveToJournal && <Check size={14} className="text-white" />}
            </button>
            <label className="flex-1 cursor-pointer" onClick={() => setSaveToJournal(!saveToJournal)}>
              <span className="flex items-center gap-2 text-sm font-medium">
                <BookOpen size={16} />
                Salvar também no diário
              </span>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                Cria uma entrada automática no diário com este check-in
              </p>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              isSaving ||
              (!contextualGoal && selectedActivities.length === 0 && !note) ||
              (contextualGoal && !note.trim() && !progressDelta && !completedTasksDelta)
            }
            className="w-full py-3 px-4 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {isSaving ? (
              <>
                <span className="inline-block animate-spin">⏳</span>
                Salvando...
              </>
            ) : (
              <>
                <Check size={20} />
                Salvar Check-in
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QuickCheckIn;
