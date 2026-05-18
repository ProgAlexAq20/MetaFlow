import {
  isAfter,
  isBefore,
  isToday,
  isSameDay,
  differenceInDays,
  format,
  parseISO,
} from 'date-fns';
import { GOAL_STATUS } from '../data/constants';

// ============================================================================
// DATE UTILITIES
// ============================================================================

export const dateUtils = {
  isToday(date) {
    return isToday(new Date(date));
  },

  isSameDay(date1, date2) {
    return isSameDay(new Date(date1), new Date(date2));
  },

  daysUntil(date) {
    return differenceInDays(new Date(date), new Date());
  },

  formatDate(date, formatStr = 'dd/MM/yyyy') {
    return format(new Date(date), formatStr);
  },

  formatDateTime(date, formatStr = 'dd/MM/yyyy HH:mm') {
    return format(new Date(date), formatStr);
  },

  formatShort(date) {
    return format(new Date(date), 'dd/MM');
  },

  formatMonth(date) {
    return format(new Date(date), 'MMMM yyyy');
  },

  isOverdue(endDate) {
    if (!endDate) return false;
    return isBefore(new Date(endDate), new Date()) && !isToday(new Date(endDate));
  },

  isExpiringSoon(endDate, daysThreshold = 7) {
    if (!endDate) return false;
    const daysRemaining = differenceInDays(new Date(endDate), new Date());
    return daysRemaining >= 0 && daysRemaining < daysThreshold;
  },
};

// ============================================================================
// GOAL UTILITIES
// ============================================================================

export const goalUtils = {
  // Calculate goal status based on dates and progress
  calculateStatus(goal) {
    const now = new Date();
    const startDate = new Date(goal.startDate);
    const endDate = goal.endDate ? new Date(goal.endDate) : null;

    if (goal.status === GOAL_STATUS.PAUSED) {
      return GOAL_STATUS.PAUSED;
    }

    if (goal.status === GOAL_STATUS.COMPLETED) {
      return GOAL_STATUS.COMPLETED;
    }

    // Check if overdue
    if (endDate && isBefore(endDate, now) && !isToday(endDate)) {
      return GOAL_STATUS.OVERDUE;
    }

    // Check if at risk (less than 7 days and progress < 50%)
    if (endDate) {
      const daysRemaining = differenceInDays(endDate, now);
      const progressPercent = goalUtils.getProgressPercent(goal);

      if (daysRemaining < 7 && progressPercent < 50 && daysRemaining > 0) {
        return GOAL_STATUS.RISK;
      }
    }

    return GOAL_STATUS.ACTIVE;
  },

  // Get progress percentage
  getProgressPercent(goal) {
    if (!goal.targetValue || goal.targetValue === 0) return 0;
    const current = goal.currentValue || 0;
    const percent = Math.min((current / goal.targetValue) * 100, 100);
    return Math.round(percent);
  },

  // Get progress display
  getProgressDisplay(goal) {
    const percent = goalUtils.getProgressPercent(goal);

    switch (goal.progressType) {
      case 'numeric':
        return `${goal.currentValue || 0} / ${goal.targetValue}`;
      case 'tasks':
        return `${goal.completedTasks || 0} / ${goal.totalTasks || 0}`;
      case 'time':
        return `${goal.currentValue || 0} / ${goal.targetValue} horas`;
      case 'manual':
      default:
        return `${percent}%`;
    }
  },

  // Check if goal is active
  isActive(goal) {
    return goal.status === GOAL_STATUS.ACTIVE;
  },

  // Check if goal is completed
  isCompleted(goal) {
    return goal.status === GOAL_STATUS.COMPLETED;
  },

  // Mark goal as completed
  markCompleted(goal) {
    return {
      ...goal,
      status: GOAL_STATUS.COMPLETED,
      currentValue: goal.targetValue,
    };
  },
};

// ============================================================================
// HABIT UTILITIES
// ============================================================================

export const habitUtils = {
  // Check if habit was completed today
  isCompletedToday(habit) {
    return habit.completedDates?.some((date) => dateUtils.isToday(date)) || false;
  },

  // Calculate current streak
  calculateStreak(completedDates = []) {
    if (!completedDates || completedDates.length === 0) return 0;

    const dates = completedDates
      .map((date) => new Date(date))
      .sort((a, b) => b - a);

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const date of dates) {
      const dateObj = new Date(date);
      dateObj.setHours(0, 0, 0, 0);

      const diffDays = differenceInDays(currentDate, dateObj);

      if (diffDays === 0 || diffDays === 1) {
        streak++;
        currentDate = dateObj;
      } else {
        break;
      }
    }

    return streak;
  },

  // Get completion rate for week
  getWeeklyCompletionRate(habit) {
    if (!habit.completedDates) return 0;

    const weekDays = habit.frequency === 'daily' ? 7 : (habit.weekDays?.length || 0);
    if (weekDays === 0) return 0;

    const thisWeekDates = habit.completedDates.filter((date) => {
      const daysAgo = differenceInDays(new Date(), new Date(date));
      return daysAgo < 7;
    });

    return Math.round((thisWeekDates.length / weekDays) * 100);
  },

  // Check if habit should be completed today
  shouldCompleteToday(habit) {
    if (habit.frequency === 'daily') return true;

    if (habit.frequency === 'weekly' && habit.weekDays) {
      const today = new Date().getDay();
      return habit.weekDays.includes(today);
    }

    return false;
  },
};

// ============================================================================
// STORAGE UTILITIES
// ============================================================================

export const storageUtils = {
  // Check if there are local stored data
  hasLocalData() {
    const keys = ['metaflow_goals', 'metaflow_habits', 'metaflow_categories'];
    return keys.some((key) => localStorage.getItem(key));
  },

  // Get local data
  getLocalData() {
    const data = {};
    data.goals = JSON.parse(localStorage.getItem('metaflow_goals') || '[]');
    data.habits = JSON.parse(localStorage.getItem('metaflow_habits') || '[]');
    data.categories = JSON.parse(localStorage.getItem('metaflow_categories') || '[]');
    data.journalEntries = JSON.parse(localStorage.getItem('metaflow_journalEntries') || '[]');
    data.settings = JSON.parse(localStorage.getItem('metaflow_settings') || '{}');
    return data;
  },

  // Clear local data
  clearLocalData() {
    localStorage.removeItem('metaflow_goals');
    localStorage.removeItem('metaflow_habits');
    localStorage.removeItem('metaflow_categories');
    localStorage.removeItem('metaflow_journalEntries');
    localStorage.removeItem('metaflow_settings');
  },

  // Export data as JSON
  exportToJSON(data, filename = 'metaflow-backup.json') {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },

  // Import data from JSON
  async importFromJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          resolve(data);
        } catch (error) {
          reject(new Error('Formato JSON inválido'));
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  },
};

export default {
  dateUtils,
  goalUtils,
  habitUtils,
  storageUtils,
};
