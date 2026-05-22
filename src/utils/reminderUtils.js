import { dateUtils } from './helpers';

export const isReminderScheduledForDate = (reminder, date) => {
  if (!reminder?.active) return false;
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

export const getReminderTriggerOccurrence = (reminder, now = new Date()) => {
  if (!reminder?.active) return null;
  const snoozedUntil = reminder.snoozedUntil ? new Date(reminder.snoozedUntil) : null;

  if (snoozedUntil) {
    const diffMs = now.getTime() - snoozedUntil.getTime();
    return diffMs >= 0 && diffMs <= 60000 ? snoozedUntil : null;
  }

  if (!isReminderScheduledForDate(reminder, now)) return null;

  const [hour, minute] = (reminder.time || '08:00').split(':').map(Number);
  const scheduled = new Date(now);
  scheduled.setHours(hour || 0, minute || 0, 0, 0);

  const notifyBeforeMs = (Number(reminder.notifyBeforeMinutes) || 0) * 60000;
  const notifyAt = new Date(scheduled.getTime() - notifyBeforeMs);
  const nowMs = now.getTime();

  if (nowMs < notifyAt.getTime() || nowMs > scheduled.getTime() + 60000) {
    return null;
  }

  return scheduled;
};

export const getReminderTriggerKey = (reminder, occurrence) => {
  if (!reminder || !occurrence) return '';
  return `${reminder.id}:${dateUtils.getDateKey(occurrence)}:${occurrence.toISOString()}`;
};

