import React, { useContext, useState } from 'react';
import { DataContext } from '../providers/DataProvider';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { dateUtils } from '../utils/helpers';
import { MOOD_EMOJIS } from '../data/constants';

const JournalPage = () => {
  const { journalEntries, createJournalEntry, deleteJournalEntry, categories, loading } =
    useContext(DataContext);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    mood: 'good',
    text: '',
    categoryId: categories[0]?.id || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createJournalEntry({
        ...formData,
        date: new Date(formData.date).toISOString(),
      });
      setFormData({
        date: new Date().toISOString().split('T')[0],
        mood: 'good',
        text: '',
        categoryId: categories[0]?.id || '',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating journal entry:', error);
    }
  };

  if (loading) return <div className="container mx-auto p-4">Carregando...</div>;

  // Group entries by date
  const sortedEntries = [...journalEntries].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="container mx-auto p-4 pb-20 max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Meu Diário</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition hover:opacity-90"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <Plus size={20} />
          Nova Entrada
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
            <div className="grid grid-cols-2 gap-4">
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
                    color: 'var(--color-text)',
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Humor</label>
                <select
                  value={formData.mood}
                  onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  {Object.entries(MOOD_EMOJIS).map(([key, emoji]) => (
                    <option key={key} value={key}>
                      {emoji} {key.charAt(0).toUpperCase() + key.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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
              <label className="block text-sm font-medium mb-2">Sua Entrada</label>
              <textarea
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="Escreva seus pensamentos, reflexões e sentimentos..."
                className="w-full px-4 py-2 rounded-lg border h-32"
                style={{
                  backgroundColor: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition hover:opacity-90"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Salvar Entrada
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

      {sortedEntries.length === 0 ? (
        <div
          className="p-12 rounded-lg border text-center"
          style={{
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <p style={{ color: 'var(--color-text-secondary)' }} className="mb-4">
            Nenhuma entrada no diário
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 rounded-lg text-white transition hover:opacity-90"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Escrever sua primeira entrada
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedEntries.map((entry) => {
            const category = categories.find((c) => c.id === entry.categoryId);
            const moodEmoji = MOOD_EMOJIS[entry.mood] || '😐';

            return (
              <div
                key={entry.id}
                className="p-6 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{moodEmoji}</span>
                      <div>
                        <p className="text-sm font-medium">
                          {dateUtils.formatDate(entry.date, 'EEEE, dd MMMM yyyy')}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          {category?.name || 'Geral'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteJournalEntry(entry.id)}
                    className="p-2 rounded-lg transition hover:opacity-80"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      color: '#EF4444',
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <p
                  className="mt-4 whitespace-pre-wrap leading-relaxed"
                  style={{ color: 'var(--color-text)' }}
                >
                  {entry.text}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JournalPage;
