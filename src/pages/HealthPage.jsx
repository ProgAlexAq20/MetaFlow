import React, { useContext, useMemo, useState, useEffect } from 'react';
import {
  Activity,
  Droplets,
  Moon,
  Pill,
  Play,
  Plus,
  Pause,
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
    weightEntries = [],
    createWeightEntry,
    deleteWeightEntry,
    createReminder,
    createCheckIn,
    showToast,
  } = useContext(DataContext);

  const normalizeMedicine = (item) => {
    if (typeof item === 'string') {
      const [nameDose, time = '08:00'] = item.split('-').map((part) => part.trim());
      return {
        id: nameDose || `${Date.now()}`,
        name: nameDose || 'Remédio',
        dose: '',
        time,
        frequency: 'Diário',
        takenDates: {},
      };
    }
    return {
      id: item.id || `${item.name || 'med'}-${item.time || '08:00'}`,
      name: item.name || 'Remédio',
      dose: item.dose || '',
      time: item.time || '08:00',
      frequency: item.frequency || 'Diário',
      takenDates: item.takenDates || {},
    };
  };

  const [weightForm, setWeightForm] = useState({
    weight: '',
    date: getTodayInputValue(),
    note: '',
    targetWeight: health?.targetWeight || '',
    unit: 'kg',
  });
  const [healthForm, setHealthForm] = useState({
    waterGoal: health?.waterGoal || 8,
    waterGoalMl: health?.waterGoalMl || 2000,
    waterCupMl: health?.waterCupMl || 250,
    bedtime: health?.bedtime || '22:30',
    wakeTime: health?.wakeTime || '06:30',
    nightModeReminder: health?.nightModeReminder !== false,
    stretchBreakMinutes: health?.stretchBreakMinutes || 60,
    eyeBreakMinutes: health?.eyeBreakMinutes || 20,
    breathingMinutes: health?.breathingMinutes || 3,
  });
  const [medicineForm, setMedicineForm] = useState({
    name: '',
    dose: '',
    time: '08:00',
    frequency: 'Diário',
  });
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(0);
  const [breathStepIndex, setBreathStepIndex] = useState(0);

  useEffect(() => {
    setHealthForm({
      waterGoal: health?.waterGoal || 8,
      waterGoalMl: health?.waterGoalMl || 2000,
      waterCupMl: health?.waterCupMl || 250,
      bedtime: health?.bedtime || '22:30',
      wakeTime: health?.wakeTime || '06:30',
      nightModeReminder: health?.nightModeReminder !== false,
      stretchBreakMinutes: health?.stretchBreakMinutes || 60,
      eyeBreakMinutes: health?.eyeBreakMinutes || 20,
      breathingMinutes: health?.breathingMinutes || 3,
    });
    setWeightForm((prev) => ({
      ...prev,
      targetWeight: health?.targetWeight || prev.targetWeight || '',
    }));
  }, [health]);

  const medicines = useMemo(
    () => (health?.medicines || []).map(normalizeMedicine),
    [health?.medicines]
  );

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
  const waterMlToday = health?.waterIntakeDate === todayKey ? health?.waterIntakeMlToday || 0 : 0;
  const waterGoalMl = Number(health?.waterGoalMl || healthForm.waterGoalMl || 2000);
  const waterCupMl = Number(health?.waterCupMl || healthForm.waterCupMl || 250);
  const nextSleepText = `${health?.bedtime || healthForm.bedtime || '22:30'} → ${health?.wakeTime || healthForm.wakeTime || '06:30'}`;
  const breathCycle = [
    { label: 'Inspirar', seconds: 4 },
    { label: 'Segurar', seconds: 4 },
    { label: 'Expirar', seconds: 6 },
  ];
  const currentBreathStep = breathCycle[breathStepIndex % breathCycle.length];
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
      waterGoalMl: Number(healthForm.waterGoalMl),
      waterCupMl: Number(healthForm.waterCupMl),
      bedtime: healthForm.bedtime,
      wakeTime: healthForm.wakeTime,
      nightModeReminder: healthForm.nightModeReminder,
      stretchBreakMinutes: Number(healthForm.stretchBreakMinutes),
      eyeBreakMinutes: Number(healthForm.eyeBreakMinutes),
      breathingMinutes: Number(healthForm.breathingMinutes),
    });
  };

  useEffect(() => {
    if (!timerRunning || !activeTimer) return undefined;
    const intervalId = window.setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [timerRunning, activeTimer]);

  useEffect(() => {
    if (activeTimer !== 'breathing' || !timerRunning) return undefined;
    const intervalId = window.setInterval(() => {
      setBreathStepIndex((prev) => prev + 1);
    }, currentBreathStep.seconds * 1000);
    return () => window.clearInterval(intervalId);
  }, [activeTimer, timerRunning, currentBreathStep.seconds]);

  const startTimer = (type, seconds) => {
    setActiveTimer(type);
    setTimerSecondsLeft(seconds);
    setTimerRunning(true);
    setBreathStepIndex(0);
  };

  const stopTimer = () => {
    setTimerRunning(false);
  };

  const registerWellbeingCheckIn = async (label) => {
    await createCheckIn({
      date: new Date().toISOString(),
      categoryId: '',
      activities: ['health'],
      note: `${label} concluído`,
      title: label,
    });
    setActiveTimer(null);
    showToast(`${label} registrado`);
  };

  const addWaterCup = async () => {
    const nextMl = waterMlToday + waterCupMl;
    await updateHealth({
      waterGoalMl,
      waterCupMl,
      waterIntakeMlToday: nextMl,
      waterIntakeToday: Math.ceil(nextMl / waterCupMl),
      waterIntakeDate: todayKey,
    });
  };

  const createHealthReminder = async ({ title, description, time }) => {
    await createReminder({
      title,
      description,
      time,
      repeat: 'daily',
      weekDays: [],
      notifyBeforeMinutes: 0,
      active: true,
    });
  };

  const createSleepReminders = async () => {
    await updateHealth({
      bedtime: healthForm.bedtime,
      wakeTime: healthForm.wakeTime,
      nightModeReminder: healthForm.nightModeReminder,
    });
    await createHealthReminder({
      title: 'Hora de dormir',
      description: 'Prepare-se para dormir e preservar sua rotina de sono.',
      time: healthForm.bedtime,
    });
    if (healthForm.nightModeReminder) {
      const [hour, minute] = healthForm.bedtime.split(':').map(Number);
      const nightModeDate = new Date();
      nightModeDate.setHours(hour, minute - 30, 0, 0);
      await createHealthReminder({
        title: 'Modo noturno',
        description: 'Reduza telas e desacelere antes de dormir.',
        time: dateUtils.formatDate(nightModeDate, 'HH:mm'),
      });
    }
  };

  const handleMedicineSubmit = async (event) => {
    event.preventDefault();
    const medicine = {
      ...medicineForm,
      id: `${Date.now()}-${medicineForm.name}`,
      takenDates: {},
    };
    await updateHealth({ medicines: [...medicines, medicine] });
    await createHealthReminder({
      title: `Tomar ${medicine.name}`,
      description: `${medicine.dose || 'Dose'} · ${medicine.frequency}`,
      time: medicine.time,
    });
    setMedicineForm({ name: '', dose: '', time: '08:00', frequency: 'Diário' });
  };

  const markMedicineTaken = async (medicineId) => {
    const nextMedicines = medicines.map((medicine) =>
      medicine.id === medicineId
        ? {
            ...medicine,
            takenDates: {
              ...(medicine.takenDates || {}),
              [todayKey]: new Date().toISOString(),
            },
          }
        : medicine
    );
    await updateHealth({ medicines: nextMedicines });
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
          ['Próximo sono', nextSleepText, Moon],
          ['Água hoje', `${waterMlToday}/${waterGoalMl} ml`, Droplets],
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
                Meta água (copos)
                <input
                  type="number"
                  min="1"
                  value={healthForm.waterGoal}
                  onChange={(event) => setHealthForm({ ...healthForm, waterGoal: event.target.value })}
                  className="mt-2 w-full px-4 py-2 rounded-lg border"
                  style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </label>
              <label className="block text-sm font-medium">
                Meta em ml
                <input
                  type="number"
                  min="100"
                  step="50"
                  value={healthForm.waterGoalMl}
                  onChange={(event) => setHealthForm({ ...healthForm, waterGoalMl: event.target.value })}
                  className="mt-2 w-full px-4 py-2 rounded-lg border"
                  style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </label>
              <label className="block text-sm font-medium">
                Tamanho do copo (ml)
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={healthForm.waterCupMl}
                  onChange={(event) => setHealthForm({ ...healthForm, waterCupMl: event.target.value })}
                  className="mt-2 w-full px-4 py-2 rounded-lg border"
                  style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </label>
              <div className="flex items-end">
                <button type="button" onClick={addWaterCup} className="w-full px-4 py-2 rounded-lg text-white font-medium" style={{ backgroundColor: 'var(--color-secondary)' }}>
                  +1 copo ({waterCupMl} ml)
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
              Próximo horário de sono
              <div className="mt-2 rounded-lg border px-4 py-3" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
                {nextSleepText}
              </div>
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
            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
              <button type="button" onClick={createSleepReminders} className="rounded-lg border p-3 text-left" style={{ borderColor: 'var(--color-border)' }}><Moon size={16} /> Sono</button>
              <button type="button" onClick={() => startTimer('breathing', Number(healthForm.breathingMinutes || 3) * 60)} className="rounded-lg border p-3 text-left" style={{ borderColor: 'var(--color-border)' }}><Wind size={16} /> Respirar</button>
              <button type="button" onClick={() => createHealthReminder({ title: 'Beber água', description: 'Faça uma pausa rápida para beber água.', time: '10:00' })} className="rounded-lg border p-3 text-left" style={{ borderColor: 'var(--color-border)' }}><Droplets size={16} /> Água</button>
              <button type="button" onClick={() => startTimer('stretch', Number(healthForm.stretchBreakMinutes || 5) * 60)} className="rounded-lg border p-3 text-left" style={{ borderColor: 'var(--color-border)' }}><Activity size={16} /> Alongar</button>
              <button type="button" onClick={() => startTimer('eyes', Number(healthForm.eyeBreakMinutes || 1) * 60)} className="rounded-lg border p-3 text-left" style={{ borderColor: 'var(--color-border)' }}><Activity size={16} /> Olhos</button>
              <button type="button" onClick={() => createHealthReminder({ title: 'Pausa para os olhos', description: 'Olhe para longe por 20 segundos.', time: '15:00' })} className="rounded-lg border p-3 text-left" style={{ borderColor: 'var(--color-border)' }}><BellIconLabel /> Lembrete</button>
            </div>
            <button type="submit" className="w-full px-4 py-3 rounded-lg text-white font-medium" style={{ backgroundColor: 'var(--color-primary)' }}>
              Salvar saúde
            </button>
          </form>

          <form onSubmit={handleMedicineSubmit} className="p-6 rounded-lg border space-y-4" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2">
              <Pill size={20} style={{ color: 'var(--color-primary)' }} />
              <p className="text-lg font-semibold">Remédios</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                value={medicineForm.name}
                onChange={(event) => setMedicineForm({ ...medicineForm, name: event.target.value })}
                placeholder="Nome do remédio"
                className="w-full px-4 py-2 rounded-lg border"
                style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                required
              />
              <input
                value={medicineForm.dose}
                onChange={(event) => setMedicineForm({ ...medicineForm, dose: event.target.value })}
                placeholder="Dose"
                className="w-full px-4 py-2 rounded-lg border"
                style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              />
              <input
                type="time"
                value={medicineForm.time}
                onChange={(event) => setMedicineForm({ ...medicineForm, time: event.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              />
              <input
                value={medicineForm.frequency}
                onChange={(event) => setMedicineForm({ ...medicineForm, frequency: event.target.value })}
                placeholder="Frequência"
                className="w-full px-4 py-2 rounded-lg border"
                style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              />
            </div>
            <button type="submit" className="w-full px-4 py-3 rounded-lg text-white font-medium" style={{ backgroundColor: 'var(--color-primary)' }}>
              Adicionar remédio e lembrete
            </button>
            <div className="space-y-2">
              {medicines.map((medicine) => (
                <div key={medicine.id} className="rounded-lg border p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}>
                  <div>
                    <p className="font-semibold">{medicine.name}</p>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{medicine.dose || 'Sem dose'} · {medicine.time} · {medicine.frequency}</p>
                  </div>
                  <button type="button" onClick={() => markMedicineTaken(medicine.id)} className="px-3 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: medicine.takenDates?.[todayKey] ? '#10B981' : 'var(--color-secondary)' }}>
                    {medicine.takenDates?.[todayKey] ? 'Tomado hoje' : 'Marcar tomado'}
                  </button>
                </div>
              ))}
            </div>
          </form>
        </div>
      </div>

      {activeTimer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-2xl border p-6 sm:rounded-2xl" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <p className="text-lg font-semibold">
              {activeTimer === 'breathing' ? 'Respiração guiada' : activeTimer === 'stretch' ? 'Alongamento' : 'Pausa dos olhos'}
            </p>
            <div className="my-6 text-center">
              {activeTimer === 'breathing' && (
                <p className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>{currentBreathStep.label}</p>
              )}
              <p className="text-5xl font-bold mt-3">{Math.floor(timerSecondsLeft / 60)}:{String(timerSecondsLeft % 60).padStart(2, '0')}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setTimerRunning((prev) => !prev)} className="flex-1 px-4 py-3 rounded-lg text-white font-medium" style={{ backgroundColor: 'var(--color-primary)' }}>
                {timerRunning ? <Pause size={18} className="inline mr-1" /> : <Play size={18} className="inline mr-1" />}
                {timerRunning ? 'Pausar' : 'Iniciar'}
              </button>
              <button type="button" onClick={stopTimer} className="px-4 py-3 rounded-lg border font-medium" style={{ borderColor: 'var(--color-border)' }}>
                Parar
              </button>
            </div>
            {timerSecondsLeft === 0 && (
              <button type="button" onClick={() => registerWellbeingCheckIn(activeTimer === 'breathing' ? 'Respiração' : activeTimer === 'stretch' ? 'Alongamento' : 'Pausa dos olhos')} className="mt-3 w-full px-4 py-3 rounded-lg text-white font-medium" style={{ backgroundColor: 'var(--color-secondary)' }}>
                Registrar check-in de bem-estar
              </button>
            )}
            <button type="button" onClick={() => setActiveTimer(null)} className="mt-3 w-full px-4 py-2 rounded-lg border font-medium" style={{ borderColor: 'var(--color-border)' }}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const BellIconLabel = () => <span className="inline-block h-4 w-4 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />;

export default HealthPage;
