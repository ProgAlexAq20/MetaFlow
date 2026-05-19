import React, { useContext } from 'react';
import { AuthContext } from '../providers/AuthProvider';
import { DataContext } from '../providers/DataProvider';
import {
  TrendingUp,
  Target,
  Zap,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { goalUtils } from '../utils/helpers';
import { GOAL_STATUS_COLORS } from '../data/constants';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { goals, habits, journalEntries, loading } = useContext(DataContext);

  const activeGoals = goals.filter((g) => g.status !== 'completed');
  const completedGoals = goals.filter((g) => g.status === 'completed');
  const activeHabits = habits.filter((h) => h.status !== 'paused');

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
          <p style={{ color: 'var(--color-text-secondary)' }} className="text-center py-8">
            Nenhum objetivo ativo. Crie seu primeiro objetivo para começar!
          </p>
        ) : (
          <div className="space-y-3">
            {activeGoals.slice(0, 5).map((goal) => (
              <div
                key={goal.id}
                className="p-4 rounded-lg"
                style={{ backgroundColor: 'var(--color-background)' }}
              >
                <div className="flex items-between justify-between mb-2">
                  <p className="font-medium">{goal.title}</p>
                  <span style={{ color: GOAL_STATUS_COLORS[goal.status] }} className="text-sm">
                    {goalUtils.getProgressPercent(goal)}%
                  </span>
                </div>
                <div
                  className="w-full h-2 rounded-full overflow-hidden"
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
