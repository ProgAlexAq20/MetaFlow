import React, { useContext, useMemo, useState, useEffect } from 'react';
import {
  Activity,
  Droplets,
  Moon,
  Pill,
  Plus,
  Trash2,
  Wind,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { DataContext } from '../providers/DataProvider';
import { dateUtils } from '../utils/helpers';

const getTodayInputValue = () => dateUtils.getDateKey();

const calculateVariation = (entries, days) => {
  if (entries.length < 2) return 0;
  const newest = entries[0];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const older = [...entries]
    .reverse()
    .find((entry) => new Date(entry.date) <= cutoff) || entries[entries.length - 1];

  return Number((Number(newest.weight) - Number(older.weight)).toFixed(1));
};

const HealthPage = () => {
  const {
    health = {},
    updateHealth,
    addWaterIntake,
    weightEntries = [],
    createWeightEntry,
    deleteWeightEntry,
  } = useContext(DataContext);

  const [weightForm, setWeightForm] = useState({
    weight: '',
    date: getTodayInputValue(),
    note: '',
    targetWeight: health?.targetWeight || '',
    unit: 'kg',
  });
  const [healthForm, setHealthForm] = useState({
    waterGoal: health?.waterGoal || 8,
    bedtime: health?.bedtime || '22:30',
    wakeTime: health?.wakeTime || '06:30',
    nightModeReminder: health?.nightModeReminder !== false,
    medicinesText: (health?.medicines || []).join('\n'),
    stretchBreakMinutes: health?.stretchBreakMinutes || 60,
    eyeBreakMinutes: health?.eyeBreakMinutes || 20,
    breathingMinutes: health?.breathingMinutes || 3,
  });

  useEffect(() => {
    setHealthForm({
      waterGoal: health?.waterGoal || 8,
      bedtime: health?.bedtime || '22:30',
      wakeTime: health?.wakeTime || '06:30',
      nightModeReminder: health?.nightModeReminder !== false,
      medicinesText: (health?.medicines || []).join('\n'),
      stretchBreakMinutes: health?.stretchBreakMinutes || 60,
      eyeBreakMinutes: health?.eyeBreakMinutes || 20,
      breathingMinutes: health?.breathingMinutes || 3,
    });
    setWeightForm((prev) => ({
      ...prev,
      targetWeight: health?.targetWeight || prev.targetWeight || '',
    }));
  }, [health]);

  const sortedEntries = useMemo(
    () => [...weightEntries].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [weightEntries]
  );
  const currentEntry = sortedEntries[0];
  const targetWeight = Number(health?.targetWeight || weightForm.targetWeight || 0);
  const currentWeight = Number(currentEntry?.weight || health?.currentWeight || 0);
  const distanceToGoal = currentWeight && targetWeight
    ? Number((currentWeight - targetWeight).toFixed(1))
    : 0;
  const weeklyVariation = calculateVariation(sortedEntries, 7);
  const monthlyVariation = calculateVariation(sortedEntries, 30);
  const todayKey = getTodayInputValue();
  const waterToday = health?.waterIntakeDate === todayKey ? health?.waterIntakeToday || 0 : 0;
  const chartData = useMemo(
    () =>
      [...sortedEntries]
        .reverse()
        .slice(-30)
        .map((entry) => ({
          date: dateUtils.formatDate(entry.date, 'dd/MM'),
          peso: Number(entry.weight),
        })),
    [sortedEntries]
  );

  const handleWeightSubmit = async (event) => {
    event.preventDefault();
    await createWeightEntry({
      weight: Number(weightForm.weight),
      date: new Date(weightForm.date).toISOString(),
      note: weightForm.note,
      targetWeight: weightForm.targetWeight ? Number(weightForm.targetWeight) : '',
      unit: 'kg',
    });
    setWeightForm({
      weight: '',
      date: getTodayInputValue(),
      note: '',
      targetWeight: weightForm.targetWeight,
      unit: 'kg',
    });
  };

  const handleHealthSubmit = async (event) => {
    event.preventDefault();
    await updateHealth({
      waterGoal: Number(healthForm.waterGoal),
      bedtime: healthForm.bedtime,
      wakeTime: healthForm.wakeTime,
      nightModeReminder: healthForm.nightModeReminder,
      medicines: healthForm.medicinesText
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
      stretchBreakMinutes: Number(healthForm.stretchBreakMinutes),
      eyeBreakMinutes: Number(healthForm.eyeBreakMinutes),
      breathingMinutes: Number(healthForm.breathingMinutes),
    });
  };

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Saúde</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Peso, água, sono, remédios e pausas em um painel leve.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
        {[
          ['Peso atual', currentWeight ? `${currentWeight} kg` : 'Sem registro', Activity],
          ['Meta de peso', targetWeight ? `${targetWeight} kg` : 'Defina uma meta', Activity],
          ['Até a meta', currentWeight && targetWeight ? `${Math.abs(distanceToGoal)} kg` : 'Aguardando', Activity],
          ['Água hoje', `${waterToday}/${health?.waterGoal || 8} copos`, Droplets],
        ].map(([label, value, Icon]) => (
          <div key={label} className="p-5 rounded-lg border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
                <p className="text-2xl font-semibold">{value}</p>
              </div>
              <Icon size={24} style={{ color: 'var(--color-primary)' }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-lg font-semibold">Evolução de peso</p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Variação semanal: {weeklyVariation > 0 ? '+' : ''}{weeklyVariation} kg · mensal: {monthlyVariation > 0 ? '+' : ''}{monthlyVariation} kg
                </p>
              </div>
              <Activity style={{ color: 'var(--color-secondary)' }} />
            </div>
            <div className="h-64">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" />
                    <XAxis dataKey="date" stroke="var(--color-text-secondary)" />
                    <YAxis stroke="var(--color-text-secondary)" domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text)',
                      }}
                    />
                    <Line type="monotone" dataKey="peso" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full rounded-lg border flex items-center justify-center" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  Registre seu primeiro peso para ver o gráfico.
                </div>
              )}
            </div>
          </div>

          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <p className="text-lg font-semibold mb-4">Histórico de peso</p>
            {sortedEntries.length === 0 ? (
              <p style={{ color: 'var(--color-text-secondary)' }}>Nenhum registro ainda.</p>
            ) : (
              <div className="space-y-3">
                {sortedEntries.slice(0, 8).map((entry) => (
                  <div key={entry.id} className="rounded-lg border p-4 flex items-start justify-between gap-3" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}>
                    <div>
                      <p className="font-semibold">{entry.weight} kg</p>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {dateUtils.formatDate(entry.date, 'dd/MM/yyyy')}
                        {entry.note ? ` · ${entry.note}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteWeightEntry(entry.id)}
                      className="p-2 rounded-lg border"
                      style={{ borderColor: 'var(--color-border)', color: '#EF4444' }}
                      aria-label="Remover registro de peso"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <form onSubmit={handleWeightSubmit} className="p-6 rounded-lg border space-y-4" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2">
              <Plus size={20} style={{ color: 'var(--color-primary)' }} />
              <p className="text-lg font-semibold">Registrar peso</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium">
                Peso atual
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={weightForm.weight}
                  onChange={(event) => setWeightForm({ ...weightForm, weight: event.target.value })}
                  className="mt-2 w-full px-4 py-2 rounded-lg border"
                  style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  required
                />
              </label>
              <label className="block text-sm font-medium">
                Data
                <input
                  type="date"
                  value={weightForm.date}
                  onChange={(event) => setWeightForm({ ...weightForm, date: event.target.value })}
                  className="mt-2 w-full px-4 py-2 rounded-lg border"
                  style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </label>
            </div>
            <label className="block text-sm font-medium">
              Meta de peso
              <input
                type="number"
                step="0.1"
                min="1"
                value={weightForm.targetWeight}
                onChange={(event) => setWeightForm({ ...weightForm, targetWeight: event.target.value })}
                className="mt-2 w-full px-4 py-2 rounded-lg border"
                style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              />
            </label>
            <label className="block text-sm font-medium">
              Observação
              <textarea
                value={weightForm.note}
                onChange={(event) => setWeightForm({ ...weightForm, note: event.target.value })}
                className="mt-2 w-full px-4 py-2 rounded-lg border h-20"
                style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              />
            </label>
            <button type="submit" className="w-full px-4 py-3 rounded-lg text-white font-medium" style={{ backgroundColor: 'var(--color-primary)' }}>
              Registrar peso
            </button>
          </form>

          <form onSubmit={handleHealthSubmit} className="p-6 rounded-lg border space-y-4" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <p className="text-lg font-semibold">Rotina saudável</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium">
                Meta água
                <input
                  type="number"
                  min="1"
                  value={healthForm.waterGoal}
                  onChange={(event) => setHealthForm({ ...healthForm, waterGoal: event.target.value })}
                  className="mt-2 w-full px-4 py-2 rounded-lg border"
                  style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </label>
              <div className="flex items-end">
                <button type="button" onClick={() => addWaterIntake(1)} className="w-full px-4 py-2 rounded-lg text-white font-medium" style={{ backgroundColor: 'var(--color-secondary)' }}>
                  +1 copo
                </button>
              </div>
              <label className="block text-sm font-medium">
                Dormir
                <input
                  type="time"
                  value={healthForm.bedtime}
                  onChange={(event) => setHealthForm({ ...healthForm, bedtime: event.target.value })}
                  className="mt-2 w-full px-4 py-2 rounded-lg border"
                  style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </label>
              <label className="block text-sm font-medium">
                Acordar
                <input
                  type="time"
                  value={healthForm.wakeTime}
                  onChange={(event) => setHealthForm({ ...healthForm, wakeTime: event.target.value })}
                  className="mt-2 w-full px-4 py-2 rounded-lg border"
                  style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </label>
            </div>
            <label className="flex items-center gap-3 rounded-lg border p-3" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}>
              <input
                type="checkbox"
                checked={healthForm.nightModeReminder}
                onChange={(event) => setHealthForm({ ...healthForm, nightModeReminder: event.target.checked })}
              />
              <span>Lembrete de modo noturno</span>
            </label>
            <label className="block text-sm font-medium">
              Remédios
              <textarea
                value={healthForm.medicinesText}
                onChange={(event) => setHealthForm({ ...healthForm, medicinesText: event.target.value })}
                placeholder="Um remédio por linha, ex: Vitamina D - 08:00"
                className="mt-2 w-full px-4 py-2 rounded-lg border h-24"
                style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              />
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className="block text-sm font-medium">
                Alongar
                <input
                  type="number"
                  min="5"
                  value={healthForm.stretchBreakMinutes}
                  onChange={(event) => setHealthForm({ ...healthForm, stretchBreakMinutes: event.target.value })}
                  className="mt-2 w-full px-3 py-2 rounded-lg border"
                  style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </label>
              <label className="block text-sm font-medium">
                Olhos
                <input
                  type="number"
                  min="5"
                  value={healthForm.eyeBreakMinutes}
                  onChange={(event) => setHealthForm({ ...healthForm, eyeBreakMinutes: event.target.value })}
                  className="mt-2 w-full px-3 py-2 rounded-lg border"
                  style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </label>
              <label className="block text-sm font-medium">
                Respirar
                <input
                  type="number"
                  min="1"
                  value={healthForm.breathingMinutes}
                  onChange={(event) => setHealthForm({ ...healthForm, breathingMinutes: event.target.value })}
                  className="mt-2 w-full px-3 py-2 rounded-lg border"
                  style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-lg border p-3" style={{ borderColor: 'var(--color-border)' }}><Moon size={16} /> Sono</div>
              <div className="rounded-lg border p-3" style={{ borderColor: 'var(--color-border)' }}><Pill size={16} /> Remédios</div>
              <div className="rounded-lg border p-3" style={{ borderColor: 'var(--color-border)' }}><Wind size={16} /> Respiração</div>
            </div>
            <button type="submit" className="w-full px-4 py-3 rounded-lg text-white font-medium" style={{ backgroundColor: 'var(--color-primary)' }}>
              Salvar saúde
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HealthPage;
