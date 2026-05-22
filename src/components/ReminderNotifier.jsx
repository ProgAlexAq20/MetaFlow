import { useContext, useEffect, useRef, useState } from 'react';
import { DataContext } from '../providers/DataProvider';
import { getReminderTriggerKey, getReminderTriggerOccurrence } from '../utils/reminderUtils';

const getNotificationIcon = () => `${import.meta.env.BASE_URL}icon-192x192.png`;
const getNotificationBadge = () => `${import.meta.env.BASE_URL}icon-96x96.png`;
const attachOpenHandler = (notification) => {
  if (!notification) return;
  notification.onclick = () => {
    window.focus();
    window.dispatchEvent(new CustomEvent('nav-to-page', { detail: 'reminders' }));
    notification.close();
  };
};

const ReminderNotifier = () => {
  const {
    reminders = [],
    settings = {},
    updateReminder,
    showToast,
  } = useContext(DataContext);
  const triggeredRef = useRef(new Set());
  const [visualReminder, setVisualReminder] = useState(null);

  useEffect(() => {
    const notify = async () => {
      const now = new Date();
      const dueReminders = reminders
        .filter((reminder) => reminder?.active)
        .map((reminder) => ({
          reminder,
          occurrence: getReminderTriggerOccurrence(reminder, now),
        }))
        .filter((item) => item.occurrence);

      for (const { reminder, occurrence } of dueReminders) {
        const triggerKey = getReminderTriggerKey(reminder, occurrence);
        const alreadyTriggered =
          triggeredRef.current.has(triggerKey) ||
          reminder.lastTriggeredKey === triggerKey ||
          (reminder.lastTriggeredAt &&
            reminder.lastTriggeredOccurrence === occurrence.toISOString());

        if (alreadyTriggered) continue;
        triggeredRef.current.add(triggerKey);

        const body = reminder.description || reminder.title || 'Você tem um lembrete agora.';
        const notificationAllowed =
          settings?.notificationsEnabled &&
          typeof Notification !== 'undefined' &&
          Notification.permission === 'granted';

        showToast(`Lembrete: ${body}`);

        try {
          if (notificationAllowed) {
            const options = {
              body,
              icon: getNotificationIcon(),
              badge: getNotificationBadge(),
              tag: triggerKey,
              renotify: false,
              data: {
                page: 'reminders',
                reminderId: reminder.id,
              },
            };

            if ('serviceWorker' in navigator) {
              const registration = await navigator.serviceWorker.ready.catch(() => null);
              if (registration?.showNotification) {
                await registration.showNotification('MetaFlow', options);
              } else {
                attachOpenHandler(new Notification('MetaFlow', options));
              }
            } else {
              attachOpenHandler(new Notification('MetaFlow', options));
            }
          } else {
            setVisualReminder(reminder);
          }

          await updateReminder(
            reminder.id,
            {
              lastTriggeredAt: new Date().toISOString(),
              lastTriggeredOccurrence: occurrence.toISOString(),
              lastTriggeredKey: triggerKey,
            },
            { silent: true }
          );
        } catch (error) {
          console.error('Erro ao disparar lembrete:', error);
          setVisualReminder(reminder);
          showToast('Lembrete vencido. Não foi possível abrir a notificação do navegador.', 'error');
        }
      }
    };

    notify();
    const intervalId = window.setInterval(notify, 30000);
    return () => window.clearInterval(intervalId);
  }, [reminders, settings, showToast, updateReminder]);

  if (!visualReminder) return null;

  return (
    <div
      className="fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-md rounded-xl border p-4 shadow-2xl md:bottom-6"
      style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-primary)' }}
    >
      <p className="text-xs uppercase tracking-[0.14em]" style={{ color: 'var(--color-text-secondary)' }}>
        Lembrete agora
      </p>
      <p className="mt-1 font-semibold">{visualReminder.title || 'MetaFlow'}</p>
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        {visualReminder.description || 'Você tem uma ação agendada.'}
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('nav-to-page', { detail: 'reminders' }));
            setVisualReminder(null);
          }}
          className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Abrir lembretes
        </button>
        <button
          type="button"
          onClick={() => setVisualReminder(null)}
          className="rounded-lg border px-3 py-2 text-sm font-semibold"
          style={{ borderColor: 'var(--color-border)' }}
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

export default ReminderNotifier;
