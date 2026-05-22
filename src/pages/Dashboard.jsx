import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../providers/AuthProvider';
import { DataContext } from '../providers/DataProvider';
import {
  TrendingUp,
  Target,
  Zap,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  ArrowRight,
  Plus,
  Sparkles,
  Bell,
  HeartPulse,
  Droplets,
  Moon,
  Leaf,
} from 'lucide-react';
import { goalUtils, habitUtils, dateUtils } from '../utils/helpers';
import { GOAL_STATUS_COLORS } from '../data/constants';
import QuickCheckIn from '../components/QuickCheckIn';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const {
    goals = [],
    habits = [],
    journalEntries = [],
    checkIns = [],
    categories = [],
    reminders = [],
    health = {},
    weightEntries = [],
    garden = {},
    updateHabit,
    loading,
  } = useContext(DataContext);
  const [isQuickCheckInOpen, setIsQuickCheckInOpen] = useState(false);
  const [quickCheckInGoalId, setQuickCheckInGoalId] = useState('');

  // Listen for custom event to open quick check-in
  useEffect(() => {
    const handleOpenQuickCheckIn = (event) => {
      setQuickCheckInGoalId(event.detail?.goalId || '');
      setIsQuickCheckInOpen(true);
    };

    window.addEventListener('open-quick-checkin', handleOpenQuickCheckIn);
    return () => {
      window.removeEventListener('open-quick-checkin', handleOpenQuickCheckIn);
    };
  }, []);

  const activeGoals = goals.filter((g) => g.status !== 'completed');
  const completedGoals = goals.filter((g) => g.status === 'completed');
  const activeHabits = habits.filter((h) => h.status !== 'paused');
  const latestWeight = [...weightEntries].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const nextMedicine = (health?.medicines || [])[0] || 'Nenhum remédio';
  const todayKey = dateUtils.getDateKey();
  const waterToday = health?.waterIntakeDate === todayKey ? health?.waterIntakeToday || 0 : 0;

  const averageProgress =
    goals.length > 0
      ? Math.round(
          goals.reduce((sum, goal) => sum + goalUtils.getProgressPercent(goal), 0) /
            goals.length
        )
      : 0;

  const todayJournal = journalEntries.find((e) => {
    const entryDate = new Date(e.date);
    const today = new Date();
    return (
      entryDate.getDate() === today.getDate() &&
      entryDate.getMonth() === today.getMonth() &&
      entryDate.getFullYear() === today.getFullYear()
    );
  });

  const markFirstPendingHabit = () => {
    const today = new Date();
    const pendingHabit = activeHabits.find((h) => {
      return !habitUtils.isDailyTargetMet(h, today) && habitUtils.shouldCompleteToday(h);
    });

    if (pendingHabit) {
      const todayKey = dateUtils.getDateKey(today);
      const targetChecks = habitUtils.getDailyTargetChecks(pendingHabit);
      const nextCount = Math.min(targetChecks, habitUtils.getDailyCheckCount(pendingHabit, today) + 1);
      const dailyChecks = { ...habitUtils.getDailyChecks(pendingHabit), [todayKey]: nextCount };
      const completedDates = pendingHabit.completedDates || [];
      const updatedDates = nextCount >= targetChecks && !habitUtils.hasCompletionOnDate(pendingHabit, today)
        ? habitUtils.uniqueCompletedDates([...completedDates, today.toISOString()])
        : completedDates;
      const currentStreak = habitUtils.calculateStreak(updatedDates);
      const bestStreak = Math.max(pendingHabit.bestStreak || 0, currentStreak);
      updateHabit(pendingHabit.id, {
        dailyTargetChecks: targetChecks,
        dailyChecks,
        completedDates: updatedDates,
        currentStreak,
        bestStreak,
      });
    }
  };

  // Calculate "Hoje" card data
  const todayData = (() => {
    const today = new Date();

    // Pending habits (active habits not completed today)
    const pendingHabits = activeHabits.filter((h) => {
      return !habitUtils.isDailyTargetMet(h, today) && habitUtils.shouldCompleteToday(h);
    });

    // Goals at risk
    const atRiskGoals = goals.filter(
      (g) => g.status === 'risk' || g.status === 'overdue'
    );

    // Last journal entry
    const sortedEntries = [...journalEntries].sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastJournal = sortedEntries[0];

    // Determine suggestion
    let suggestion = 'Você está no ritmo. Continue assim!';
    let suggestionIcon = '✨';

    if (pendingHabits.length > 0) {
      suggestion = 'Marque um hábito concluído.';
      suggestionIcon = '✅';
    } else if (atRiskGoals.length > 0) {
      suggestion = 'Registre avanço em um objetivo em risco.';
      suggestionIcon = '⚠️';
    } else if (!todayJournal) {
      suggestion = 'Escreva uma breve nota no diário.';
      suggestionIcon = '📝';
    }

    // Format last journal date
    let lastJournalText = 'Nenhum diário registrado ainda';
    if (lastJournal) {
      const lastDate = new Date(lastJournal.date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (
        lastDate.getDate() === today.getDate() &&
        lastDate.getMonth() === today.getMonth() &&
        lastDate.getFullYear() === today.getFullYear()
      ) {
        lastJournalText = 'hoje';
      } else if (
        lastDate.getDate() === yesterday.getDate() &&
        lastDate.getMonth() === yesterday.getMonth() &&
        lastDate.getFullYear() === yesterday.getFullYear()
      ) {
        lastJournalText = 'ontem';
      } else {
        lastJournalText = dateUtils.formatDate(lastJournal.date, 'dd/MM');
      }
    }

    return {
      pendingHabits: pendingHabits.length,
      atRiskGoals: atRiskGoals.length,
      lastJournal: lastJournalText,
      suggestion,
      suggestionIcon,
      activeReminders: (reminders || []).filter((reminder) => reminder?.active).length,
    };
  })();

  if (loading) {
    return (
      <div className="container mx-auto p-4 h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className="inline-block w-16 h-16 border-4 rounded-full animate-spin"
            style={{
              borderColor: 'var(--color-border)',
              borderTopColor: 'var(--color-primary)',
            }}
          ></div>
          <p className="mt-4" style={{ color: 'var(--color-text-secondary)' }}>
            Carregando seu painel...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Bem-vindo, {user?.displayName?.split(' ')[0]}! 👋
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Aqui está o resumo do seu progresso
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div
          className="p-5 rounded-lg border"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-slate-500">Objetivos</p>
              <p className="text-2xl font-semibold">{goals.length}</p>
            </div>
            <Target size={24} style={{ color: 'var(--color-primary)' }} />
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {completedGoals.length} concluído(s)
          </p>
        </div>

        <div
          className="p-5 rounded-lg border"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-slate-500">Hábitos ativos</p>
              <p className="text-2xl font-semibold">{activeHabits.length}</p>
            </div>
            <Zap size={24} style={{ color: 'var(--color-secondary)' }} />
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {habits.filter((h) => h.status === 'paused').length} pausado(s)
          </p>
        </div>

        <div
          className="p-5 rounded-lg border"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-slate-500">Lembretes ativos</p>
              <p className="text-2xl font-semibold">{reminders.filter((reminder) => reminder.active).length}</p>
            </div>
            <Bell size={24} style={{ color: '#EC4899' }} />
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Fique atento às próximas ações
          </p>
        </div>

        <div
          className="p-5 rounded-lg border"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-slate-500">Diário hoje</p>
              <p className="text-2xl font-semibold">{todayJournal ? 'Sim' : 'Não'}</p>
            </div>
            <Sparkles size={24} style={{ color: '#F59E0B' }} />
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Registre seu próximo pensamento ainda hoje
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-lg border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Peso atual</p>
              <p className="text-2xl font-semibold">{latestWeight ? `${latestWeight.weight} kg` : 'Sem registro'}</p>
            </div>
            <HeartPulse size={24} style={{ color: 'var(--color-primary)' }} />
          </div>
        </div>

        <div className="p-5 rounded-lg border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Água do dia</p>
              <p className="text-2xl font-semibold">{waterToday}/{health?.waterGoal || 8}</p>
            </div>
            <Droplets size={24} style={{ color: '#38BDF8' }} />
          </div>
        </div>

        <div className="p-5 rounded-lg border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Saúde</p>
              <p className="text-lg font-semibold truncate">{nextMedicine}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Dormir {health?.bedtime || '22:30'}</p>
            </div>
            <Moon size={24} style={{ color: 'var(--color-secondary)' }} />
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('nav-to-page', { detail: 'garden' }))}
          className="p-5 rounded-lg border text-left transition hover:opacity-90"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Jardim MetaFlow</p>
              <p className="text-2xl font-semibold">{garden?.drops || 0} gotas</p>
            </div>
            <Leaf size={24} style={{ color: '#22C55E' }} />
          </div>
        </button>
      </div>

      {/* "Hoje" Card - Today Summary */}
      <div
        className="p-6 rounded-lg border mb-8"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
          borderLeft: `4px solid var(--color-primary)`,
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)' }}
          >
            <Clock size={24} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h2 className="text-xl font-bold">Hoje</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
              >
                <Zap size={20} style={{ color: '#F59E0B' }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayData.pendingHabits}</p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Hábitos pendentes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              >
                <AlertCircle size={20} style={{ color: '#EF4444' }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayData.atRiskGoals}</p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Objetivos em risco
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)' }}
              >
                <BookOpen size={20} style={{ color: '#EC4899' }} />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayData.lastJournal}</p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Último diário
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
          <span className="text-xl">{todayData.suggestionIcon}</span>
          <p className="text-sm font-medium">{todayData.suggestion}</p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              setQuickCheckInGoalId('');
              setIsQuickCheckInOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition hover:opacity-90"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Plus size={18} />
            Check-in rápido
          </button>

          {todayData.pendingHabits > 0 && (
            <button
              onClick={markFirstPendingHabit}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition hover:opacity-90"
              style={{
                backgroundColor: 'var(--color-secondary)',
                color: '#fff',
              }}
            >
              <CheckCircle2 size={18} />
              Marcar hábito
            </button>
          )}

          {!todayJournal && (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('nav-to-page', { detail: 'journal' }))}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition hover:opacity-80"
              style={{
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
              }}
            >
              <BookOpen size={18} />
              Escrever diário
            </button>
          )}

          {todayData.atRiskGoals > 0 && (
            <button
              onClick={() => {
                setQuickCheckInGoalId('');
                setIsQuickCheckInOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition hover:opacity-80"
              style={{
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
              }}
            >
              <AlertCircle size={18} />
              Registrar avanço
            </button>
          )}

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('nav-to-page', { detail: 'habits' }))}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition hover:opacity-80"
            style={{
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
            }}
          >
            <Zap size={18} />
            Ver hábitos
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Goals */}
        <div
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm mb-1">
                Objetivos Ativos
              </p>
              <p className="text-3xl font-bold">{activeGoals.length}</p>
            </div>
            <Target size={24} style={{ color: 'var(--color-primary)' }} />
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {completedGoals.length} concluído(s)
          </p>
        </div>

        {/* Total Habits */}
        <div
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm mb-1">
                Hábitos Ativos
              </p>
              <p className="text-3xl font-bold">{activeHabits.length}</p>
            </div>
            <Zap size={24} style={{ color: 'var(--color-secondary)' }} />
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {habits.filter((h) => h.status === 'paused').length} pausado(s)
          </p>
        </div>

        {/* Average Progress */}
        <div
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm mb-1">
                Progresso Médio
              </p>
              <p className="text-3xl font-bold">{averageProgress}%</p>
            </div>
            <TrendingUp size={24} style={{ color: '#22C55E' }} />
          </div>
          <div
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--color-border)' }}
          >
            <div
              className="h-full"
              style={{
                width: `${averageProgress}%`,
                backgroundColor: 'var(--color-primary)',
              }}
            ></div>
          </div>
        </div>

        {/* Journal Entries */}
        <div
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm mb-1">
                Entradas no Diário
              </p>
              <p className="text-3xl font-bold">{journalEntries.length}</p>
            </div>
            <Calendar size={24} style={{ color: '#EC4899' }} />
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {todayJournal ? 'Hoje escrito ✓' : 'Registre hoje'}
          </p>
        </div>
      </div>

      {/* Objectives at Risk */}
      {goals.some((g) => g.status === 'risk' || g.status === 'overdue') && (
        <div
          className="p-6 rounded-lg border mb-8"
          style={{
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={20} style={{ color: '#FACC15' }} />
            <h2 className="text-xl font-bold">Objetivos que Precisam de Atenção</h2>
          </div>
          <div className="space-y-3">
            {goals
              .filter((g) => g.status === 'risk' || g.status === 'overdue')
              .map((goal) => (
                <div
                  key={goal.id}
                  className="p-4 rounded-lg flex items-between justify-between"
                  style={{
                    backgroundColor: 'var(--color-background)',
                    borderLeft: `4px solid ${GOAL_STATUS_COLORS[goal.status]}`,
                  }}
                >
                  <div className="flex-1">
                    <p className="font-medium">{goal.title}</p>
                    <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm mt-1">
                      Progresso: {goalUtils.getProgressDisplay(goal)}
                    </p>
                  </div>
                  <span
                    className="px-3 py-1 rounded text-sm font-medium"
                    style={{
                      backgroundColor: GOAL_STATUS_COLORS[goal.status] + '20',
                      color: GOAL_STATUS_COLORS[goal.status],
                    }}
                  >
                    {goal.status === 'risk' ? 'Em Risco' : 'Atrasado'}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Goals */}
      <div
        className="p-6 rounded-lg border"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <h2 className="text-xl font-bold mb-4">Objetivos Recentes</h2>
        {activeGoals.length === 0 ? (
          <div className="text-center py-8">
            <Target size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-secondary)' }} />
            <p style={{ color: 'var(--color-text-secondary)' }} className="mb-4">
              Nenhum objetivo ativo. Crie seu primeiro objetivo para começar!
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('nav-to-page', { detail: 'goals' }))}
              className="px-6 py-2 rounded-lg text-white font-medium transition hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Criar Objetivo
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeGoals.slice(0, 5).map((goal) => {
              const category = categories.find((cat) => cat.id === goal.categoryId);
              const recentGoalCheckIns = checkIns
                .filter((checkIn) => checkIn.goalId === goal.id)
                .sort((a, b) => new Date(b.date) - new Date(a.date));
              const lastCheckIn = recentGoalCheckIns[0];
              const daysRemaining = goal.endDate ? dateUtils.daysUntil(goal.endDate) : null;

              return (
                <div
                  key={goal.id}
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--color-background)' }}
                >
                  <div className="flex items-between justify-between mb-2">
                    <div>
                      <p className="font-medium">{goal.title}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        {category ? category.name : 'Sem categoria'} • {goal.status}
                      </p>
                    </div>
                    <span style={{ color: GOAL_STATUS_COLORS[goal.status] }} className="text-sm">
                      {goalUtils.getProgressPercent(goal)}%
                    </span>
                  </div>

                  <div className="mb-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {goal.endDate
                      ? `Prazo: ${dateUtils.formatDate(goal.endDate)} (${daysRemaining >= 0 ? `${daysRemaining} dias` : 'atrase'})`
                      : 'Sem prazo definido'}
                  </div>

                  <div
                    className="w-full h-2 rounded-full overflow-hidden mb-3"
                    style={{ backgroundColor: 'var(--color-border)' }}
                  >
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${goalUtils.getProgressPercent(goal)}%`,
                        backgroundColor: GOAL_STATUS_COLORS[goal.status],
                      }}
                    ></div>
                  </div>

                  {lastCheckIn && (
                    <p className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                      Último check-in: {dateUtils.formatDate(lastCheckIn.date)}
                    </p>
                  )}

                  <button
                    onClick={() => {
                      setQuickCheckInGoalId(goal.id);
                      setIsQuickCheckInOpen(true);
                    }}
                    className="px-3 py-2 rounded-lg text-sm font-medium transition hover:opacity-90"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    Check-in rápido
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Check-In Modal */}
      <QuickCheckIn
        isOpen={isQuickCheckInOpen}
        initialGoalId={quickCheckInGoalId}
        onClose={() => {
          setIsQuickCheckInOpen(false);
          setQuickCheckInGoalId('');
        }}
      />
    </div>
  );
};

export default Dashboard;
