import React, { useContext, useMemo } from 'react';
import { DataContext } from '../providers/DataProvider';
import {
  TrendingUp,
  Flame,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  BarChart3,
  Award,
  Activity,
} from 'lucide-react';
import { habitUtils, dateUtils } from '../utils/helpers';
import { MOOD_EMOJIS } from '../data/constants';

const InsightsPage = () => {
  const { habits = [], goals = [], journalEntries = [], checkIns = [], categories = [], loading } = useContext(DataContext);

  // Calculate insights data
  const insightsData = useMemo(() => {
    const today = new Date();
    const now = new Date();
    
    // Current streak (best streak across all habits)
    const allStreaks = habits.map((h) => h.currentStreak || 0);
    const currentStreak = Math.max(...allStreaks, 0);
    const bestStreak = Math.max(...habits.map((h) => h.bestStreak || 0), 0);

    // Active days this month
    const activeHabitsThisMonth = habits.filter((h) => {
      const completedThisMonth = (h.completedDates || []).some((date) => {
        const d = new Date(date);
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      });
      return completedThisMonth;
    }).length;

    // Last 7 days data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCheckIns = checkIns.filter((c) => new Date(c.date) >= sevenDaysAgo);
    const recentJournalEntries = journalEntries.filter((j) => new Date(j.date) >= sevenDaysAgo);
    const recentHabitCompletions = habits.reduce((acc, habit) => {
      const completions = (habit.completedDates || []).filter((date) => new Date(date) >= sevenDaysAgo);
      return acc + completions.length;
    }, 0);

    // Goals with progress this week
    const goalsWithProgress = goals.filter((g) => {
      if (g.status === 'completed') return true;
      const progress = g.currentValue || 0;
      return progress > 0;
    }).length;

    // Most common mood this week
    const moodCounts = {};
    recentJournalEntries.forEach((entry) => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });
    const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Most active category
    const categoryCounts = {};
    checkIns.forEach((c) => {
      if (c.categoryId) {
        categoryCounts[c.categoryId] = (categoryCounts[c.categoryId] || 0) + 1;
      }
    });
    journalEntries.forEach((j) => {
      if (j.categoryId) {
        categoryCounts[j.categoryId] = (categoryCounts[j.categoryId] || 0) + 1;
      }
    });
    const mostActiveCategoryId = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    const mostActiveCategory = categories.find((c) => c.id === mostActiveCategoryId);

    // Goals at risk
    const atRiskGoals = goals.filter((g) => g.status === 'risk' || g.status === 'overdue');

    // Monthly stats
    const monthlyCheckIns = checkIns.filter((c) => {
      const d = new Date(c.date);
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }).length;

    const monthlyJournalEntries = journalEntries.filter((j) => {
      const d = new Date(j.date);
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }).length;

    // Active days in month (habits, check-ins ou diário)
    const activeDaysInMonth = new Set();
    habits.forEach((h) => {
      (h.completedDates || []).forEach((date) => {
        const d = new Date(date);
        if (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
          activeDaysInMonth.add(d.getDate());
        }
      });
    });
    checkIns.forEach((checkIn) => {
      const d = new Date(checkIn.date);
      if (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
        activeDaysInMonth.add(d.getDate());
      }
    });
    journalEntries.forEach((entry) => {
      const d = new Date(entry.date);
      if (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
        activeDaysInMonth.add(d.getDate());
      }
    });

    return {
      currentStreak,
      bestStreak,
      activeHabitsThisMonth,
      activeDaysInMonth: activeDaysInMonth.size,
      recentCheckIns: recentCheckIns.length,
      recentJournalEntries: recentJournalEntries.length,
      recentHabitCompletions,
      goalsWithProgress,
      dominantMood,
      mostActiveCategory,
      atRiskGoals: atRiskGoals.length,
      atRiskGoalsList: atRiskGoals,
      monthlyCheckIns,
      monthlyJournalEntries,
      totalGoals: goals.length,
      completedGoals: goals.filter((g) => g.status === 'completed').length,
      activeHabits: habits.filter((h) => h.status === 'active').length,
    };
  }, [habits, goals, journalEntries, checkIns, categories]);

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
            Carregando insights...
          </p>
        </div>
      </div>
    );
  }

  const hasEnoughData =
    insightsData.recentCheckIns > 0 ||
    insightsData.recentJournalEntries > 0 ||
    insightsData.recentHabitCompletions > 0;

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Evolução</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Acompanhe seu progresso e conquistas
        </p>
      </div>

      {!hasEnoughData ? (
        <div
          className="p-12 rounded-lg border text-center"
          style={{
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <BarChart3 size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-secondary)' }} />
          <h2 className="text-xl font-bold mb-2">Comece a registrar sua evolução</h2>
          <p style={{ color: 'var(--color-text-secondary)' }} className="mb-6">
            Registre check-ins, hábitos e diário para visualizar sua evolução.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-quick-checkin'))}
              className="px-6 py-3 rounded-lg text-white font-medium transition hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Fazer Check-in Rápido
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Streak Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className="p-6 rounded-lg border"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
                >
                  <Flame size={24} style={{ color: '#F59E0B' }} />
                </div>
                <div>
                  <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm">
                    Sequência Atual
                  </p>
                  <p className="text-3xl font-bold">{insightsData.currentStreak} dias</p>
                </div>
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Melhor sequência: {insightsData.bestStreak} dias
              </p>
            </div>

            <div
              className="p-6 rounded-lg border"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                >
                  <Calendar size={24} style={{ color: '#22C55E' }} />
                </div>
                <div>
                  <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm">
                    Dias Ativos (Mês)
                  </p>
                  <p className="text-3xl font-bold">{insightsData.activeDaysInMonth}</p>
                </div>
              </div>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Hábitos ativos: {insightsData.activeHabits}
              </p>
            </div>
          </div>

          {/* Weekly Report Card */}
          <div
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'rgba(56, 189, 248, 0.1)' }}
              >
                <BarChart3 size={24} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h2 className="text-xl font-bold">Sua semana no MetaFlow</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={20} style={{ color: '#22C55E' }} />
                  <div>
                    <p className="font-medium">Objetivos com avanço</p>
                    <p className="text-2xl font-bold">{insightsData.goalsWithProgress}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Award size={20} style={{ color: '#F59E0B' }} />
                  <div>
                    <p className="font-medium">Hábitos cumpridos</p>
                    <p className="text-2xl font-bold">{insightsData.recentHabitCompletions}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <BookOpen size={20} style={{ color: '#EC4899' }} />
                  <div>
                    <p className="font-medium">Entradas no diário</p>
                    <p className="text-2xl font-bold">{insightsData.recentJournalEntries}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {insightsData.dominantMood && (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{MOOD_EMOJIS[insightsData.dominantMood]}</span>
                    <div>
                      <p className="font-medium">Humor predominante</p>
                      <p className="text-2xl font-bold">
                        {insightsData.dominantMood.charAt(0).toUpperCase() +
                          insightsData.dominantMood.slice(1)}
                      </p>
                    </div>
                  </div>
                )}

                {insightsData.mostActiveCategory && (
                  <div className="flex items-center gap-3">
                    <Target size={20} style={{ color: 'var(--color-secondary)' }} />
                    <div>
                      <p className="font-medium">Categoria mais ativa</p>
                      <p className="text-2xl font-bold">{insightsData.mostActiveCategory.name}</p>
                    </div>
                  </div>
                )}

                {insightsData.atRiskGoals > 0 ? (
                  <div className="flex items-center gap-3">
                    <AlertCircle size={20} style={{ color: '#EF4444' }} />
                    <div>
                      <p className="font-medium">Pontos de atenção</p>
                      <p className="text-2xl font-bold" style={{ color: '#EF4444' }}>
                        {insightsData.atRiskGoals} objetivo(s) em risco
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <TrendingUp size={20} style={{ color: '#22C55E' }} />
                    <div>
                      <p className="font-medium">Status</p>
                      <p className="text-lg font-bold" style={{ color: '#22C55E' }}>
                        Tudo em dia! 🎉
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Monthly Summary */}
          <div
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
              >
                <Activity size={24} style={{ color: 'var(--color-secondary)' }} />
              </div>
              <h2 className="text-xl font-bold">Resumo do Mês</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                <p className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
                  {insightsData.monthlyCheckIns}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Check-ins
                </p>
              </div>

              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                <p className="text-3xl font-bold" style={{ color: '#EC4899' }}>
                  {insightsData.monthlyJournalEntries}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Diários
                </p>
              </div>

              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                <p className="text-3xl font-bold" style={{ color: '#22C55E' }}>
                  {insightsData.completedGoals}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Objetivos concluídos
                </p>
              </div>

              <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                <p className="text-3xl font-bold" style={{ color: '#F59E0B' }}>
                  {insightsData.activeHabits}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Hábitos ativos
                </p>
              </div>
            </div>
          </div>

          {/* At Risk Goals */}
          {insightsData.atRiskGoalsList.length > 0 && (
            <div
              className="p-6 rounded-lg border"
              style={{
                backgroundColor: 'var(--color-card)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle size={24} style={{ color: '#FACC15' }} />
                <h2 className="text-xl font-bold">Objetivos que Precisam de Atenção</h2>
              </div>
              <div className="space-y-3">
                {insightsData.atRiskGoalsList.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      borderLeft: `4px solid #FACC15`,
                    }}
                  >
                    <p className="font-medium">{goal.title}</p>
                    <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm mt-1">
                      Progresso: {goal.currentValue || 0} / {goal.targetValue}
                      {goal.endDate && ` | Prazo: ${dateUtils.formatDate(goal.endDate)}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InsightsPage;