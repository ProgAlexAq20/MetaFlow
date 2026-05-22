import React, { useContext, useMemo, useState } from 'react';
import { Droplets, Leaf, Sparkles } from 'lucide-react';
import { DataContext } from '../providers/DataProvider';
import { dateUtils, habitUtils } from '../utils/helpers';

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
  const { garden = {}, checkIns = [], habits = [], waterGardenToday } = useContext(DataContext);
  const [isDraggingDrop, setIsDraggingDrop] = useState(false);
  const [isDropOverGarden, setIsDropOverGarden] = useState(false);
  const [waterPulse, setWaterPulse] = useState(false);
  const drops = garden?.drops || 0;
  const { stage, nextStage, progress } = useMemo(() => getStageInfo(drops), [drops]);
  const todayKey = dateUtils.getDateKey();
  const completedHabitsToday = habits.filter((habit) =>
    habitUtils.hasCompletionOnDate(habit)
  ).length;
  const todayCheckIns = checkIns.filter((checkIn) =>
    checkIn.date && dateUtils.getDateKey(checkIn.date) === todayKey
  ).length;
  const missingDrops = nextStage ? nextStage.min - drops : 0;
  const todayRewards = garden?.gardenDailyRewards?.[todayKey] || { drops: 0 };

  const waterGarden = async () => {
    await waterGardenToday();
    setWaterPulse(true);
    window.setTimeout(() => setWaterPulse(false), 700);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDraggingDrop(false);
    setIsDropOverGarden(false);
    await waterGarden();
  };

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
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDropOverGarden(true);
              }}
              onDragLeave={() => setIsDropOverGarden(false)}
              onDrop={handleDrop}
              className="mx-auto mb-6 flex h-56 w-full max-w-sm items-end justify-center rounded-lg border transition-all duration-300"
              style={{
                backgroundColor: 'var(--color-background)',
                borderColor: isDropOverGarden ? 'var(--color-primary)' : 'var(--color-border)',
                boxShadow: isDropOverGarden ? '0 0 0 4px color-mix(in srgb, var(--color-primary) 24%, transparent)' : 'none',
                transform: waterPulse ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {waterPulse && (
                <div className="absolute mt-[-8rem] rounded-full px-4 py-2 text-sm font-semibold text-white animate-pulse-soft" style={{ backgroundColor: 'var(--color-primary)' }}>
                  Gotinha recebida
                </div>
              )}
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
            <p className="text-lg font-semibold mb-2">Regar com gotinha</p>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Toque na gotinha para sincronizar as recompensas do dia. O limite é 3 gotas por dia.
            </p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                draggable
                onDragStart={() => setIsDraggingDrop(true)}
                onDragEnd={() => {
                  setIsDraggingDrop(false);
                  setIsDropOverGarden(false);
                }}
                onClick={waterGarden}
                className="flex h-16 w-16 items-center justify-center rounded-full border transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-55"
                style={{
                  color: '#fff',
                  borderColor: isDraggingDrop ? 'var(--color-primary)' : 'var(--color-border)',
                  background: 'linear-gradient(135deg, #38BDF8, #2563EB)',
                  transform: isDraggingDrop ? 'scale(1.08) rotate(-6deg)' : 'scale(1)',
                  boxShadow: '0 18px 40px rgba(37, 99, 235, 0.28)',
                }}
                aria-label="Arrastar gotinha para regar o jardim"
              >
                <span
                  className="block h-9 w-7 rotate-45"
                  style={{
                    borderRadius: '70% 70% 70% 12%',
                    background: 'linear-gradient(135deg, #E0F2FE, #38BDF8 58%, #1D4ED8)',
                    boxShadow: 'inset -5px -6px 10px rgba(30, 64, 175, 0.32)',
                  }}
                />
              </button>
              <div>
                <p className="font-medium">{todayRewards.drops || 0}/3 gotas hoje</p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Objetivos, hábitos e metas de checks alimentam o jardim.
                </p>
              </div>
            </div>
          </div>

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
                <span>Objetivo/check-in de objetivo no dia dá +1 gota.</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-3" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}>
                <Leaf size={18} style={{ color: 'var(--color-primary)' }} />
                <span>Hábito concluído dá +1 gota; meta múltipla completa dá +1 extra. Máximo: 3/dia.</span>
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
