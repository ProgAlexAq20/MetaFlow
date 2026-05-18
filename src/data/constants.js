export const THEMES = {
  'azure-premium': {
    name: 'Azul Premium',
    primary: '#38BDF8',
    secondary: '#8B5CF6',
    background: '#0F172A',
    card: '#111827',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    border: '#1E293B',
  },
  'purple-night': {
    name: 'Roxo Noturno',
    primary: '#8B5CF6',
    secondary: '#EC4899',
    background: '#0B1020',
    card: '#151A2E',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    border: '#1E1B4B',
  },
  'green-evolution': {
    name: 'Verde Evolução',
    primary: '#22C55E',
    secondary: '#14B8A6',
    background: '#071A13',
    card: '#10231B',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    border: '#065F46',
  },
  'amber-focus': {
    name: 'Âmbar Foco',
    primary: '#FACC15',
    secondary: '#F97316',
    background: '#17120A',
    card: '#241A0F',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    border: '#78350F',
  },
  'red-energy': {
    name: 'Vermelho Energia',
    primary: '#EF4444',
    secondary: '#F97316',
    background: '#160B0B',
    card: '#251111',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    border: '#7F1D1D',
  },
  'minimal-dark': {
    name: 'Minimal Dark',
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    background: '#020617',
    card: '#0F172A',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    border: '#1E293B',
  },
};

export const STATUS_COLORS = {
  success: '#22C55E',
  warning: '#FACC15',
  danger: '#EF4444',
  info: '#38BDF8',
};

export const GOAL_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  OVERDUE: 'overdue',
  RISK: 'risk',
};

export const GOAL_STATUS_COLORS = {
  active: '#38BDF8',
  completed: '#22C55E',
  paused: '#94A3B8',
  overdue: '#EF4444',
  risk: '#FACC15',
};

export const GOAL_PROGRESS_TYPES = {
  MANUAL: 'manual',
  NUMERIC: 'numeric',
  TASKS: 'tasks',
  TIME: 'time',
};

export const HABIT_FREQUENCY = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  CUSTOM: 'custom',
};

export const MOOD_EMOJIS = {
  excellent: '😄',
  good: '🙂',
  neutral: '😐',
  bad: '😕',
  terrible: '😢',
};

export default {
  THEMES,
  STATUS_COLORS,
  GOAL_STATUS,
  GOAL_STATUS_COLORS,
  GOAL_PROGRESS_TYPES,
  HABIT_FREQUENCY,
  MOOD_EMOJIS,
};
