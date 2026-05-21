import React, { useContext, useEffect, useMemo, useState } from 'react';
import { DataContext } from '../providers/DataProvider';
import {
  Bell,
  Plus,
  Trash2,
  CheckCircle2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { dateUtils } from '../utils/helpers';

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEKDAY_OPTIONS = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
];

const isScheduledForDate = (reminder, date) => {
  if (!reminder.active) return false;
  const day = date.getDay();

  switch (reminder.repeat) {
    case 'weekdays':
      return day >= 1 && day <= 5;
    case 'weekends':
      return day === 0 || day === 6;
    case 'custom':
      return Array.isArray(reminder.weekDays) && reminder.weekDays.includes(day);
    case 'daily':
    default:
      return true;
  }
};

const getReminderLabel = (reminder) => {
  if (!reminder) return '';
  switch (reminder.repeat) {
    case 'weekdays':
      return 'Dias úteis';
    case 'weekends':
      return 'Fins de semana';
    case 'custom':
      return Array.isArray(reminder.weekDays) && reminder.weekDays.length > 0
        ? reminder.weekDays.map((day) => WEEKDAY_OPTIONS.find((option) => option.value === day)?.label).join(', ')
        : 'Personalizado';
    case 'daily':
    default:
      return 'Diário';
  }
};

const getNextOccurrence = (reminder) => {
  if (!reminder || !reminder.active) return null;
  const now = new Date();

  for (let offset = 0; offset < 7; offset += 1) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + offset);

    if (!isScheduledForDate(reminder, candidate)) {
      continue;
    }

    const [hour, minute] = (reminder.time || '08:00').split(':').map(Number);
    candidate.setHours(hour, minute, 0, 0);

    if (candidate >= now) {
      return candidate;
    }
  }

  return null;
};

const buildMonthDays = (displayDate) => {
  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekDay = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const items = [];

  for (let i = 0; i < startWeekDay; i += 1) {
    items.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    items.push(new Date(year, month, day));
  }

  while (items.length % 7 !== 0) {
    items.push(null);
  }

  return items;
};

const RemindersPage = () => {
  const {
    reminders = [],
    habits = [],
    goals = [],
    createReminder,
    updateReminder,
    deleteReminder,
    completeReminder,
    health = {},
    updateHealth,
    addWaterIntake,
    settings = {},
    updateSettings,
    showToast,
  } = useContext(DataContext);

  const [displayDate, setDisplayDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time: '08:00',
    repeat: 'daily',
    weekDays: [],
    relatedHabitId: '',
    relatedGoalId: '',
    notifyBeforeMinutes: 0,
    active: true,
  });
  const [sleepTarget, setSleepTarget] = useState(health?.sleepTarget || 8);
  const [sleepHours, setSleepHours] = useState(health?.sleepHours || 0);
  const [mood, setMood] = useState(health?.mood || 'Bom');
  const [notifiedKeys, setNotifiedKeys] = useState({});

  useEffect(() => {
    if (health) {
      setSleepTarget(health.sleepTarget ?? 8);
      setSleepHours(health.sleepHours ?? 0);
      setMood(health.mood || 'Bom');
    }
  }, [health]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (!settings?.notificationsEnabled || typeof Notification === 'undefined') {
        return;
      }

      if (Notification.permission !== 'granted') {
        return;
      }

      const now = new Date();
      reminders
        .filter((reminder) => reminder.active)
        .forEach(async (reminder) => {
          const next = getNextOccurrence(reminder);
          if (!next) return;

          const diffMinutes = (next.getTime() - now.getTime()) / 60000;
          const shouldNotify = diffMinutes <= (reminder.notifyBeforeMinutes || 0) && diffMinutes >= 0;
          const notificationId = `${reminder.id}-${next.toISOString()}`;

          if (shouldNotify && !notifiedKeys[notificationId]) {
            const title = `Lembrete: ${reminder.title}`;
            const body = reminder.description || `${getReminderLabel(reminder)} às ${reminder.time}`;
            if ('serviceWorker' in navigator && navigator.serviceWorker.getRegistration) {
              const registration = await navigator.serviceWorker.getRegistration();
              registration?.showNotification(title, {
                body,
                icon: '/icon-192x192.png',
                badge: '/icon-96x96.png',
              });
            } else {
              new Notification(title, { body, icon: '/icon-192x192.png' });
            }
            setNotifiedKeys((prev) => ({ ...prev, [notificationId]: true }));
          }
        });
    }, 30000);

    return () => clearInterval(intervalId);
  }, [reminders, settings, notifiedKeys]);

  const visibleReminders = useMemo(
    () => reminders.filter((reminder) => reminder.active),
    [reminders]
  );

  const nextReminder = useMemo(() => {
    const upcoming = visibleReminders
      .map((reminder) => ({
        reminder,
        next: getNextOccurrence(reminder),
      }))
      .filter((item) => item.next)
      .sort((a, b) => a.next - b.next);

    return upcoming[0] || null;
  }, [visibleReminders]);

  const selectedDayReminders = useMemo(
    () => reminders.filter((reminder) => isScheduledForDate(reminder, selectedDate)),
    [reminders, selectedDate]
  );

  const monthDays = useMemo(() => buildMonthDays(displayDate), [displayDate]);

  const handleEditReminder = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title || '',
      description: reminder.description || '',
      time: reminder.time || '08:00',
      repeat: reminder.repeat || 'daily',
      weekDays: reminder.weekDays || [],
      relatedHabitId: reminder.relatedHabitId || '',
      relatedGoalId: reminder.relatedGoalId || '',
      notifyBeforeMinutes: reminder.notifyBeforeMinutes || 0,
      active: reminder.active !== false,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingReminder(null);
    setFormData({
      title: '',
      description: '',
      time: '08:00',
      repeat: 'daily',
      weekDays: [],
      relatedHabitId: '',
      relatedGoalId: '',
      notifyBeforeMinutes: 0,
      active: true,
    });
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingReminder) {
        await updateReminder(editingReminder.id, formData);
      } else {
        await createReminder(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar lembrete:', error);
    }
  };

  const handleNotificationToggle = async () => {
    if (typeof Notification === 'undefined') {
      showToast('Notificações não suportadas neste dispositivo', 'error');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await updateSettings({ notificationsEnabled: true });
      showToast('Notificações ativadas');
    } else {
      await updateSettings({ notificationsEnabled: false });
      showToast('Permissão de notificações não concedida', 'error');
    }
  };

  const handleSaveHealth = async () => {
    try {
      await updateHealth({
        sleepTarget,
        sleepHours,
        mood,
      });
    } catch (error) {
      console.error('Erro ao salvar saúde:', error);
    }
  };

  const currentMonthLabel = dateUtils.formatDate(displayDate, 'MMMM yyyy');

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Lembretes e Saúde</h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Mantenha hábitos, tarefas e metas alinhados com lembretes e notificações.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowForm((prev) => !prev)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Plus size={18} />
              {showForm ? 'Fechar' : 'Novo lembrete'}
            </button>
            <button
              onClick={handleNotificationToggle}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition hover:opacity-90"
              style={{
                backgroundColor: settings?.notificationsEnabled ? '#10B981' : 'var(--color-background)',
                color: settings?.notificationsEnabled ? 'white' : 'var(--color-text)',
                border: settings?.notificationsEnabled ? 'transparent' : '1px solid var(--color-border)',
              }}
            >
              <Bell size={18} />
              {settings?.notificationsEnabled ? 'Notificações ativas' : 'Ativar notificações'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-6">
          <div
            className="p-6 rounded-lg border"
            style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(236, 72, 153, 0.12)' }}>
                <Bell size={28} style={{ color: '#EC4899' }} />
              </div>
              <div>
                <p className="text-lg font-semibold">Próximo lembrete</p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {nextReminder?.reminder.title || 'Nenhum lembrete agendado'}
                </p>
              </div>
            </div>
            {nextReminder ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-2xl font-bold">{dateUtils.formatDate(nextReminder.next, 'dd/MM')}</p>
                  <p className="text-sm text-slate-400">Data</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{dateUtils.formatDate(nextReminder.next, 'HH:mm')}</p>
                  <p className="text-sm text-slate-400">Hora</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{getReminderLabel(nextReminder.reminder)}</p>
                  <p className="text-sm text-slate-400">Repetição</p>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Use o formulário para criar lembretes para hábitos, objetivos ou rotinas de saúde.
              </p>
            )}
          </div>

          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">Acompanhamento de saúde</p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Registre hidratação e sono direto no mesmo fluxo.
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Meta de água</p>
                <p className="text-xl font-semibold">{health?.waterIntakeToday || 0}/{health?.waterGoal || 8} copos</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 mb-4">
              <button
                onClick={() => addWaterIntake(1)}
                className="px-4 py-3 rounded-lg text-white font-medium transition hover:opacity-90"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                +1 Copo
              </button>
              <button
                onClick={() => addWaterIntake(2)}
                className="px-4 py-3 rounded-lg border font-medium transition hover:opacity-90"
                style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}
              >
                +2 Copos
              </button>
              <button
                onClick={handleSaveHealth}
                className="px-4 py-3 rounded-lg border font-medium transition hover:opacity-90"
                style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}
              >
                Salvar Sono
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium mb-2">Horas de sono</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={sleepHours}
                  onChange={(event) => setSleepHours(Number(event.target.value))}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Meta de sono</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={sleepTarget}
                  onChange={(event) => setSleepTarget(Number(event.target.value))}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Humor</label>
                <select
                  value={mood}
                  onChange={(event) => setMood(event.target.value)}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  <option>Excelente</option>
                  <option>Bom</option>
                  <option>Regular</option>
                  <option>Precisa melhorar</option>
                </select>
              </div>
            </div>
          </div>

          {showForm && (
            <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)' }}>
                  <Plus size={24} style={{ color: '#3B82F6' }} />
                </div>
                <div>
                  <p className="text-lg font-semibold">{editingReminder ? 'Editar lembrete' : 'Novo lembrete'}</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Crie lembretes para hábitos, metas ou momentos importantes.
                  </p>
                </div>
              </div>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium mb-2">Título</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                    className="w-full px-4 py-2 rounded-lg border h-24"
                    style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">Hora</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(event) => setFormData({ ...formData, time: event.target.value })}
                      className="w-full px-4 py-2 rounded-lg border"
                      style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Repetição</label>
                    <select
                      value={formData.repeat}
                      onChange={(event) => setFormData({ ...formData, repeat: event.target.value })}
                      className="w-full px-4 py-2 rounded-lg border"
                      style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    >
                      <option value="daily">Diário</option>
                      <option value="weekdays">Dias úteis</option>
                      <option value="weekends">Fins de semana</option>
                      <option value="custom">Personalizado</option>
                    </select>
                  </div>
                </div>
                {formData.repeat === 'custom' && (
                  <div className="grid grid-cols-2 gap-2">
                    {WEEKDAY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          const nextWeekDays = formData.weekDays.includes(option.value)
                            ? formData.weekDays.filter((day) => day !== option.value)
                            : [...formData.weekDays, option.value];
                          setFormData({ ...formData, weekDays: nextWeekDays });
                        }}
                        className={`rounded-lg px-3 py-2 border text-sm ${formData.weekDays.includes(option.value) ? 'text-white' : 'text-current'}`}
                        style={{
                          backgroundColor: formData.weekDays.includes(option.value) ? 'var(--color-primary)' : 'transparent',
                          borderColor: 'var(--color-border)',
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Lembrete antes</label>
                    <select
                      value={formData.notifyBeforeMinutes}
                      onChange={(event) => setFormData({ ...formData, notifyBeforeMinutes: Number(event.target.value) })}
                      className="w-full px-4 py-2 rounded-lg border"
                      style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    >
                      <option value={0}>Na hora</option>
                      <option value={5}>5 minutos antes</option>
                      <option value={10}>10 minutos antes</option>
                      <option value={15}>15 minutos antes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ativo</label>
                    <select
                      value={formData.active ? 'true' : 'false'}
                      onChange={(event) => setFormData({ ...formData, active: event.target.value === 'true' })}
                      className="w-full px-4 py-2 rounded-lg border"
                      style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    >
                      <option value="true">Sim</option>
                      <option value="false">Não</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">Hábito relacionado</label>
                    <select
                      value={formData.relatedHabitId}
                      onChange={(event) => setFormData({ ...formData, relatedHabitId: event.target.value, relatedGoalId: '' })}
                      className="w-full px-4 py-2 rounded-lg border"
                      style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    >
                      <option value="">Nenhum</option>
                      {habits.map((habit) => (
                        <option key={habit.id} value={habit.id}>
                          {habit.title || habit.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Meta relacionada</label>
                    <select
                      value={formData.relatedGoalId}
                      onChange={(event) => setFormData({ ...formData, relatedGoalId: event.target.value, relatedHabitId: '' })}
                      className="w-full px-4 py-2 rounded-lg border"
                      style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    >
                      <option value="">Nenhuma</option>
                      {goals.map((goal) => (
                        <option key={goal.id} value={goal.id}>
                          {goal.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition hover:opacity-90"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    {editingReminder ? 'Salvar lembrete' : 'Criar lembrete'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 rounded-lg border font-medium transition hover:opacity-90"
                    style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-lg font-semibold">Agenda</p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Visualize lembretes por dia e navegue pelo calendário.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDisplayDate((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))}
                  className="p-2 rounded-lg border"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayDate((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))}
                  className="p-2 rounded-lg border"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center mb-3 text-xs uppercase tracking-[0.15em] text-slate-500">
              {DAY_LABELS.map((label) => (
                <div key={label}>{label}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {monthDays.map((date, index) => {
                const isToday = date && dateUtils.isSameDay(date, new Date());
                const hasReminder = date && reminders.some((reminder) => isScheduledForDate(reminder, date));
                const isSelected = date && selectedDate && dateUtils.isSameDay(date, selectedDate);

                return (
                  <button
                    key={`${date?.toISOString() || 'empty'}-${index}`}
                    type="button"
                    onClick={() => date && setSelectedDate(date)}
                    className={`h-14 rounded-lg border text-sm transition ${date ? 'cursor-pointer' : ''}`}
                    style={{
                      backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-background)',
                      borderColor: isSelected ? 'transparent' : 'var(--color-border)',
                      color: isSelected ? 'white' : 'var(--color-text)',
                    }}
                  >
                    {date ? (
                      <div className="flex h-full flex-col items-center justify-between py-2">
                        <span>{date.getDate()}</span>
                        {hasReminder && <span className="h-2 w-2 rounded-full bg-pink-500" />}
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 rounded-lg border p-4" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-sm mb-3 font-semibold">Lembretes em {dateUtils.formatDate(selectedDate, 'dd/MM/yyyy')}</p>
              {selectedDayReminders.length === 0 ? (
                <p style={{ color: 'var(--color-text-secondary)' }}>Nenhum lembrete agendado para este dia.</p>
              ) : (
                <div className="space-y-3">
                  {selectedDayReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="rounded-xl border p-4"
                      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold">{reminder.title}</p>
                          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            {reminder.description || getReminderLabel(reminder)} · {reminder.time}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => completeReminder(reminder)}
                            className="p-2 rounded-lg text-white"
                            style={{ backgroundColor: 'var(--color-primary)' }}
                            title="Concluir lembrete"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditReminder(reminder)}
                            className="p-2 rounded-lg border"
                            style={{ borderColor: 'var(--color-border)' }}
                            title="Editar lembrete"
                          >
                            <CalendarDays size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteReminder(reminder.id)}
                            className="p-2 rounded-lg border"
                            style={{ borderColor: 'var(--color-border)' }}
                            title="Remover lembrete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-lg border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <p className="text-lg font-semibold mb-3">Próximos lembretes</p>
            {visibleReminders.length === 0 ? (
              <p style={{ color: 'var(--color-text-secondary)' }}>Nenhum lembrete ativo.</p>
            ) : (
              <div className="space-y-3">
                {visibleReminders.slice(0, 5).map((reminder) => {
                  const next = getNextOccurrence(reminder);
                  return (
                    <div key={reminder.id} className="rounded-xl border p-4" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{reminder.title}</p>
                          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            {next ? dateUtils.formatDate(next, 'dd/MM HH:mm') : 'Próxima vez não encontrada'} · {getReminderLabel(reminder)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => completeReminder(reminder)}
                          className="rounded-lg px-3 py-2 text-sm font-medium text-white"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                          Completar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemindersPage;
