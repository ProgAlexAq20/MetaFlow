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