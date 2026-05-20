import React, { useState, useContext } from 'react';
import { DataContext } from '../providers/DataProvider';
import { Target, Zap, BookOpen, Check, ArrowRight, ArrowLeft } from 'lucide-react';

const OnboardingModal = ({ isOpen, onClose }) => {
  const { updateSettings } = useContext(DataContext);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Target,
      title: 'Crie seu primeiro objetivo',
      description: 'Defina uma meta clara com prazo e acompanhe seu progresso.',
      tip: 'Dica: Comece com objetivos pequenos e específicos para criar momentum.',
      color: 'var(--color-primary)',
      bgColor: 'rgba(56, 189, 248, 0.1)',
    },
    {
      icon: Zap,
      title: 'Marque um hábito',
      description: 'Construa consistência registrando hábitos diários.',
      tip: 'Dica: Associe novos hábitos a rotinas existentes para facilitar.',
      color: 'var(--color-secondary)',
      bgColor: 'rgba(139, 92, 246, 0.1)',
    },
    {
      icon: BookOpen,
      title: 'Registre um check-in ou diário',
      description: 'Documente sua evolução, humor e aprendizados.',
      tip: 'Dica: Mesmo uma linha por dia faz diferença a longo prazo.',
      color: '#EC4899',
      bgColor: 'rgba(236, 72, 153, 0.1)',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      await updateSettings({ onboardingCompleted: true });
    } catch (error) {
      console.error('Error updating settings:', error);
    }
    onClose();
  };

  const handleSkip = async () => {
    try {
      await updateSettings({ onboardingCompleted: true });
    } catch (error) {
      console.error('Error updating settings:', error);
    }
    onClose();
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleSkip}
      ></div>

      {/* Modal */}
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl p-8"
        style={{
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'w-8'
                  : 'w-2'
              }`}
              style={{
                backgroundColor: index === currentStep
                  ? 'var(--color-primary)'
                  : 'var(--color-border)',
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              backgroundColor: currentStepData.bgColor,
            }}
          >
            <Icon size={40} style={{ color: currentStepData.color }} />
          </div>

          <h2 className="text-2xl font-bold mb-4">{currentStepData.title}</h2>
          <p style={{ color: 'var(--color-text-secondary)' }} className="mb-6">
            {currentStepData.description}
          </p>

          <div
            className="p-4 rounded-lg text-left"
            style={{ backgroundColor: 'var(--color-background)' }}
          >
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {currentStepData.tip}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentStep > 0 ? (
            <button
              onClick={handlePrev}
              className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition hover:opacity-80 flex-1 justify-center"
              style={{
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
              }}
            >
              <ArrowLeft size={18} />
              Voltar
            </button>
          ) : (
            <button
              onClick={handleSkip}
              className="px-4 py-3 rounded-lg font-medium transition hover:opacity-80 flex-1"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--color-text-secondary)',
              }}
            >
              Pular
            </button>
          )}

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition hover:opacity-90 flex-1 justify-center"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {currentStep === steps.length - 1 ? (
              <>
                Começar
                <Check size={18} />
              </>
            ) : (
              <>
                Próximo
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;