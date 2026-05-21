import React, { useContext, useMemo } from 'react';
import { Droplets, Leaf, Sparkles } from 'lucide-react';
import { DataContext } from '../providers/DataProvider';

const STAGES = [
  { id: 'semente', label: 'Semente', min: 0, next: 12, visual: '•' },
  { id: 'broto', label: 'Broto', min: 12, next: 35, visual: '♧' },
  { id: 'planta', label: 'Planta', min: 35, next: 70, visual: '♣' },
  { id: 'flor', label: 'Flor', min: 70, next: 120, visual: '✿' },
  { id: 'jardim', label: 'Jardim', min: 120, next: null, visual: '✿ ✿ ✿' },
];

const getStageInfo = (drops = 0) => {
  const stage = [...STAGES].reverse().find((item) => drops >= item.min) || STAGES[0];
  const nextStage = STAGES.find((item) => item.min > drops) || null;
  const progress = nextStage
    ? Math.round(((drops - stage.min) / (nextStage.min - stage.min)) * 100)
    : 100;
  return { stage, nextStage, progress: Math.max(0, Math.min(progress, 100)) };
};

const GardenPage = () => {
  const { garden = {}, checkIns = [], habits = [] } = useContext(DataContext);
  const drops = garden?.drops || 0;
  const { stage, nextStage, progress } = useMemo(() => getStageInfo(drops), [drops]);
  const completedHabitsToday = habits.filter((habit) =>
    (habit.completedDates || []).some((date) => date.startsWith(new Date().toISOString().split('T')[0]))
  ).length;
  const todayCheckIns = checkIns.filter((checkIn) =>
    checkIn.date?.startsWith(new Date().toISOString().split('T')[0])
  ).length;
  const missingDrops = nextStage ? nextStage.min - drops : 0;

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Pausa</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Jardim MetaFlow: uma pausa leve para visualizar seu cuidado diário.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="p-8 rounded-lg border overflow-hidden relative" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <div className="absolute inset-x-0 bottom-0 h-24" style={{ background: 'linear-gradient(180deg, transparent, rgba(34, 197, 94, 0.14))' }} />
          <div className="relative text-center">
            <div className="mx-auto mb-6 flex h-56 w-full max-w-sm items-end justify-center rounded-lg border" style={{ backgroundColor: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
              <div
                className="mb-8 text-center leading-none transition-all duration-500"
                style={{
                  color: stage.id === 'semente' ? 'var(--color-text-secondary)' : 'var(--color-primary)',
                  fontSize: stage.id === 'jardim' ? '5rem' : `${3 + progress / 25}rem`,
                  textShadow: '0 14px 30px rgba(0,0,0,0.24)',
                }}
              >
                {stage.visual}
              </div>
            </div>
            <p className="text-sm uppercase tracking-[0.16em]" style={{ color: 'var(--color-text-secondary)' }}>Fase atual</p>
            <h2 className="text-3xl font-bold mt-1">{stage.label}</h2>
            <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              {nextStage ? `Faltam ${missingDrops} gotas para a próxima fase.` : 'Seu jardim está florescendo. Continue cuidando dele.'}
            </p>
            <div className="mt-6 h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: 'var(--color-primary)' }} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-lg border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Gotas disponíveis</p>
                <p className="text-3xl font-semibold">{drops}</p>
              </div>
              <Droplets size={28} style={{ color: 'var(--color-primary)' }} />
            </div>
          </div>

          <div className="p-5 rounded-lg border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <p className="text-lg font-semibold mb-3">Como cresce</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg border p-3" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}>
                <Sparkles size={18} style={{ color: 'var(--color-secondary)' }} />
                <span>Cada check-in feito dá +1 gota.</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-3" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}>
                <Leaf size={18} style={{ color: 'var(--color-primary)' }} />
                <span>Cada hábito concluído dá +2 gotas.</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-lg border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Check-ins hoje</p>
              <p className="text-2xl font-semibold">{todayCheckIns}</p>
            </div>
            <div className="p-5 rounded-lg border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Hábitos hoje</p>
              <p className="text-2xl font-semibold">{completedHabitsToday}</p>
            </div>
          </div>

          <div className="p-5 rounded-lg border" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
            <p className="text-lg font-semibold mb-3">Fases</p>
            <div className="space-y-2">
              {STAGES.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ backgroundColor: item.id === stage.id ? 'var(--color-primary)' : 'var(--color-background)', color: item.id === stage.id ? '#fff' : 'var(--color-text)' }}>
                  <span>{item.label}</span>
                  <span>{item.min}+ gotas</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GardenPage;
