import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from 'react';
import { AuthContext } from './AuthProvider';
import {
  goalsService,
  habitsService,
  categoriesService,
  journalService,
  checkInsService,
  remindersService,
  healthService,
  settingsService,
} from '../services/firebase/firestoreService';
import { DEFAULT_CATEGORIES } from '../data/defaultCategories';
import { goalUtils, habitUtils, dateUtils } from '../utils/helpers';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [health, setHealth] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const unsubscribersRef = useRef([]);
  const toastTimeoutRef = useRef(null);

  const createOptimisticId = () => {
    return typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  };

  const showToast = useCallback((message, type = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setGoals([]);
      setHabits([]);
      setCategories([]);
      setJournalEntries([]);
      setCheckIns([]);
      setReminders([]);
      setHealth(null);
      setSettings(null);
      unsubscribersRef.current.forEach((unsub) => unsub());
      unsubscribersRef.current = [];
      return;
    }

    const initializeData = async () => {
      try {
        setLoading(true);

        const [
          goalsData,
          habitsData,
          categoriesData,
          journalData,
          checkInsData,
          remindersData,
          healthData,
          settingsData,
        ] = await Promise.all([
          goalsService.getGoals(user.uid),
          habitsService.getHabits(user.uid),
          categoriesService.getCategories(user.uid),
          journalService.getJournalEntries(user.uid),
          checkInsService.getCheckIns(user.uid),
          remindersService.getReminders(user.uid),
          healthService.getHealth(user.uid),
          settingsService.getSettings(user.uid),
        ]);

        setGoals(goalsData);
        setHabits(habitsData);
        setJournalEntries(journalData);
        setCheckIns(checkInsData);
        setReminders(remindersData);

        if (!healthData) {
          const defaultHealth = {
            waterGoal: 8,
            waterIntakeToday: 0,
            sleepTarget: 8,
            sleepHours: 0,
            mood: 'Bom',
            createdAt: new Date().toISOString(),
          };
          await healthService.updateHealth(user.uid, defaultHealth);
          setHealth(defaultHealth);
        } else {
          setHealth(healthData);
        }

        if (categoriesData.length === 0) {
          const newCategories = [];
          for (const defaultCat of DEFAULT_CATEGORIES) {
            const id = await categoriesService.createCategory(user.uid, defaultCat);
            newCategories.push({ id, ...defaultCat });
          }
          setCategories(newCategories);
        } else {
          setCategories(categoriesData);
        }

        if (!settingsData) {
          const defaultSettings = {
            theme: 'azure-premium',
            preferredView: 'dashboard',
            notificationsEnabled: false,
            createdAt: new Date().toISOString(),
          };
          await settingsService.updateSettings(user.uid, defaultSettings);
          setSettings(defaultSettings);
        } else {
          setSettings(settingsData);
        }

        unsubscribersRef.current.forEach((unsub) => unsub());
        unsubscribersRef.current = [
          goalsService.onGoalsChange(user.uid, setGoals),
          habitsService.onHabitsChange(user.uid, setHabits),
          categoriesService.onCategoriesChange(user.uid, setCategories),
          journalService.onJournalEntriesChange(user.uid, setJournalEntries),
          checkInsService.onCheckInsChange(user.uid, setCheckIns),
          remindersService.onRemindersChange(user.uid, setReminders),
          healthService.onHealthChange(user.uid, setHealth),
          settingsService.onSettingsChange(user.uid, setSettings),
        ];

        setError(null);
      } catch (err) {
        console.error('Data initialization error:', err);
        setError(err.message || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    initializeData();

    return () => {
      unsubscribersRef.current.forEach((unsub) => unsub());
      unsubscribersRef.current = [];
    };
  }, [user]);

  const createGoal = useCallback(
    async (goalData) => {
      if (!user) throw new Error('User not authenticated');
      const id = createOptimisticId();
      const optimisticGoal = {
        id,
        ...goalData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setGoals((prev) => [optimisticGoal, ...prev]);
      showToast('Objetivo criado');

      try {
        await goalsService.createGoal(user.uid, goalData, id);
        return id;
      } catch (err) {
        setGoals((prev) => prev.filter((goal) => goal.id !== id));
        const message = err?.message || 'Erro ao criar objetivo, tente novamente';
        setError(message);
        showToast(message, 'error');
        throw err;
      }
    },
    [user, showToast]
  );

  const updateGoal = useCallback(
    async (goalId, goalData) => {
      if (!user) throw new Error('User not authenticated');
      const previousGoals = goals;
      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === goalId
            ? { ...goal, ...goalData, updatedAt: new Date().toISOString() }
            : goal
        )
      );
      showToast('Objetivo atualizado');

      try {
        await goalsService.updateGoal(user.uid, goalId, goalData);
      } catch (err) {
        setGoals(previousGoals);
        const message = err?.message || 'Erro ao atualizar objetivo, tente novamente';
        setError(message);
        showToast(message, 'error');
        throw err;
      }
    },
    [user, goals, showToast]
  );

  const deleteGoal = useCallback(
    async (goalId) => {
      if (!user) throw new Error('User not authenticated');
      const previousGoals = goals;
      setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
      showToast('Objetivo removido');

      try {
        await goalsService.deleteGoal(user.uid, goalId);
      } catch (err) {
        setGoals(previousGoals);
        const message = err?.message || 'Erro ao remover objetivo, tente novamente';
        setError(message);
        showToast(message, 'error');
        throw err;
      }
    },
    [user, goals, showToast]
  );

  const createHabit = useCallback(
    async (habitData) => {
      if (!user) throw new Error('User not authenticated');
      const id = createOptimisticId();
      const optimisticHabit = {
        id,
        ...habitData,
        completedDates: [],
        currentStreak: 0,
        bestStreak: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setHabits((prev) => [optimisticHabit, ...prev]);
      showToast('Hábito criado');

      try {
        await habitsService.createHabit(user.uid, habitData, id);
        return id;
      } catch (err) {
        setHabits((prev) => prev.filter((habit) => habit.id !== id));
        const message = err?.message || 'Erro ao criar hábito, tente novamente';
        setError(message);
        showToast(message, 'error');
        throw err;
      }
    },
    [user, showToast]
  );

  const updateHabit = useCallback(
    async (habitId, habitData) => {
      if (!user) throw new Error('User not authenticated');
      const previousHabits = habits;
      setHabits((prev) =>
        prev.map((habit) =>
          habit.id === habitId
            ? { ...habit, ...habitData, updatedAt: new Date().toISOString() }
            : habit
        )
      );
      showToast('Hábito atualizado');

      try {
        await habitsService.updateHabit(user.uid, habitId, habitData);
      } catch (err) {
        setHabits(previousHabits);
        const message = err?.message || 'Erro ao atualizar hábito, tente novamente';
        setError(message);
        showToast(message, 'error');
        throw err;
      }
    },
    [user, habits, showToast]
  );

  const deleteHabit = useCallback(
    async (habitId) => {
      if (!user) throw new Error('User not authenticated');
      const previousHabits = habits;
      setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
      showToast('Hábito removido');

      try {
        await habitsService.deleteHabit(user.uid, habitId);
      } catch (err) {
        setHabits(previousHabits);
        const message = err?.message || 'Erro ao remover hábito, tente novamente';
        setError(message);
        showToast(message, 'error');
        throw err;
      }
    },
    [user, habits, showToast]
  );

  const createCategory = useCallback(
    async (categoryData) => {
      if (!user) throw new Error('User not authenticated');
      const id = createOptimisticId();
      const optimisticCategory = {
        id,
        ...categoryData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCategories((prev) => [optimisticCategory, ...prev]);
      showToast('Categoria criada');

      try {
        await categoriesService.createCategory(user.uid, categoryData, id);
        return id;
      } catch (err) {
        setCategories((prev) => prev.filter((category) => category.id !== id));
        const message = err?.message || 'Erro ao criar categoria, tente novamente';
        setError(message);
        showToast(message, 'error');
        throw err;
      }
    },
    [user, showToast]
  );

  const updateCategory = useCallback(
    async (categoryId, categoryData) => {
      if (!user) throw new Error('User not authenticated');
      const previousCategories = categories;
      setCategories((prev) =>
        prev.map((category) =>
          category.id === categoryId
            ? { ...category, ...categoryData, updatedAt: new Date().toISOString() }
            : category
        )
      );
      showToast('Categoria atualizada');

      try {
        await categoriesService.updateCategory(user.uid, categoryId, categoryData);
      } catch (err) {
        setCategories(previousCategories);
        const message = err?.message || 'Erro ao atualizar categoria, tente novamente';
        setError(message);
        showToast(message, 'error');
        throw err;
      }
    },
    [user, categories, showToast]
  );

  const deleteCategory = useCallback(
    async (categoryId) => {
      if (!user) throw new Error('User not authenticated');
      const previousCategories = categories;
      setCategories((prev) => prev.filter((category) => category.id !== categoryId));
      showToast('Categoria removida');

      try {
        await categoriesService.deleteCategory(user.uid, categoryId);
      } catch (err) {
        setCategories(previousCategories);
        const message = err?.message || 'Erro ao remover categoria, tente novamente';
        setError(message);
        showToast(message, 'error');
        throw err;
      }
    },
    [user, categories, showToast]
  );

  const createJournalEntry = useCallback(
    async (entryData) => {
      if (!user) throw new Error('User not authenticated');
      const id = createOptimisticId();
      const optimisticEntry = {
        id,
        ...entryData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setJournalEntries((prev) => [optimisticEntry, ...prev]);
      showToast('Entrada de diário salva');

      try {
        await journalService.createJournalEntry(user.uid, entryData, id);
        return id;
      } catch (err) {
        setJournalEntries((prev) => prev.filter((entry) => entry.id !== id));
        const message = err?.message || 'Erro ao salvar diário, tente novamente';
        setError(message);
        showToast(message, 'error');
        throw err;
      }
    },
    [user, showToast]
  );

  const updateJournalEntry = useCallback(
    async (entryId, entryData) => {
      if (!user) throw new Error('User not authenticated');
      const previousEntries = journalEntries;
      setJournalEntries((prev) =>
        prev.map((entry) =>
          entry.id === entryId
            ? { ...entry, ...entryData, updatedAt: new Date().toISOString() }
            : entry
        )
      );
      showToast('Diário atualizado');

      try {
        await journalService.updateJournalEntry(user.uid, entryId, entryData);
      } catch (err) {
        setJournalEntries(previousEntries);
        const message = err?.message || 'Erro ao atualizar diário, tente novamente';
        setError(message);
        showToast(message, 'error');
        throw err;
      }
    },
    [user, journalEntries, showToast]
  );

  const deleteJournalEntry = useCallback(
    async (entryId) => {
      if (!user) throw new Error('User not authenticated');
      const previousEntries = journalEntries;
      setJournalEntries((prev) => prev.filter((entry) => entry.id !== entryId));
      showToast('Diário removido');

      try {
        await journalService.deleteJournalEntry(user.uid, entryId);
      } catch (err) {
        setJournalEntries(previousEntries);
        const message = err?.message || 'Erro ao remover diário, tente novamente';
        setError(message);
        showToast(message, 'error');
        throw err;
      }
    },
    [user, journalEntries, showToast]
  );

  const createReminder = useCallback(
    async (reminderData) => {
      if (!user) throw new Error('User not authenticated');
      const id = createOptimisticId();
      const optimisticReminder = {
        id,
        ...reminderData,
        active: reminderData.active !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setReminders((prev) => [optimisticReminder, ...prev]);
      showToast('Lembrete criado');

      try {
        await remindersService.createReminder(user.uid, reminderData, id);
        return id;
      } catch (err) {
        setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
        const message = err?.message || 'Erro ao criar lembrete, tente novamente';
        setError(message);
        showToast(message, 'error');
        throw err;
      }
    },
    [user, showToast]
  );

  const updateReminder = useCallback(
    async (reminderId, reminderData) => {
      if (!user) throw new Error('User not authenticated');
      const previousReminders = reminders;
      setReminders((prev) =>
        prev.map((reminder) =>
          reminder.id === reminderId
            ? { ...reminder, ...reminderData, updatedAt: new Date().toISOString() }
            : reminder
        )
      );
      showToast('Lembrete atualizado');

      try {
        await remindersService.updateReminder(user.uid, reminderId, reminderData);
      } catch (err) {
        setReminders(previousReminders);
        const message = err?.message || 'Erro ao atualizar lembrete, tente novamente';
        setError(message);
        showToast(message, 'error');
        throw err;
      }
    },
    [user, reminders, showToast]
  );

  const deleteReminder = useCallback(
    async (reminderId) => {
      if (!user) throw new Error('User not authenticated');
      const previousReminders = reminders;
      setReminders((prev) => prev.filter((reminder) => reminder.id !== reminderId));
      showToast('Lembrete removido');

      try {
        await remindersService.deleteReminder(user.uid, reminderId);
      } catch (err) {
        setReminders(previousReminders);
        const message = err?.message || 'Erro ao remover lembrete, tente novamente';
        setError(message);
        showToast(message, 'error');
        throw err;
      }
    },
    [user, reminders, showToast]
  );

  const updateHealth = useCallback(
    async (healthData) => {
      if (!user) throw new Error('User not authenticated');
      const previousHealth = health;
      setHealth((prev) => ({ ...prev, ...healthData }));
      showToast('Saúde atualizada');

      try {
        await healthService.updateHealth(user.uid, healthData);
      } catch (err) {
        setHealth(previousHealth);
        const message = err?.message || 'Erro ao salvar dados de saúde';
        setError(message);
        showToast(message, 'error');
        throw err;
      }
    },
    [user, health, showToast]
  );

  const addWaterIntake = useCallback(
    async (amount = 1) => {
      if (!user) throw new Error('User not authenticated');
      const previousHealth = health;
      const currentIntake = previousHealth?.waterIntakeToday || 0;
      const updatedAmount = currentIntake + amount;
      setHealth((prev) => ({ ...prev, waterIntakeToday: updatedAmount }));
      showToast('Hidratação registrada');

      try {
        await healthService.updateHealth(user.uid, { waterIntakeToday: updatedAmount });
      } catch (err) {
        setHealth(previousHealth);
        const message = err?.message || 'Erro ao registrar hidratação';
        setError(message);
        showToast(message, 'error');
        throw err;
      }
    },
    [user, health, showToast]
  );

  const completeReminder = useCallback(
    async (reminder) => {
      if (!user) throw new Error('User not authenticated');
      try {
        if (reminder.relatedHabitId) {
          await createCheckIn({
            habitId: reminder.relatedHabitId,
            date: new Date().toISOString(),
            title: reminder.title,
          });
        } else if (reminder.relatedGoalId) {
          await createCheckIn({
            goalId: reminder.relatedGoalId,
            date: new Date().toISOString(),
            title: reminder.title,
            progressDelta: 1,
          });
        }
        await updateReminder(reminder.id, { lastCompletedAt: new Date().toISOString() });
      } catch (err) {
        console.error('Error completing reminder:', err);
      }
    },
    [user, createCheckIn, updateReminder]
  );

  const createCheckIn = useCallback(
    async (checkInData) => {
      if (!user) throw new Error('User not authenticated');

      const id = createOptimisticId();
      const completedAt = checkInData.date || new Date().toISOString();
      const optimisticCheckIn = {
        id,
        ...checkInData,
        date: completedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const previousCheckIns = checkIns;
      const previousHabits = habits;
      const previousGoals = goals;

      setCheckIns((prev) => [optimisticCheckIn, ...prev]);

      let habitUpdate = null;
      let goalUpdate = null;

      if (checkInData.habitId) {
        const habitToUpdate = habits.find((habit) => habit.id === checkInData.habitId);
        if (habitToUpdate) {
          const todayKey = completedAt.split('T')[0];
          const completedDates = habitToUpdate.completedDates || [];
          const alreadyCompleted = completedDates.some((date) => date.startsWith(todayKey));
          const updatedDates = alreadyCompleted
            ? completedDates
            : [...completedDates, completedAt];
          const currentStreak = habitUtils.calculateStreak(updatedDates);
          const bestStreak = Math.max(habitToUpdate.bestStreak || 0, currentStreak);
          habitUpdate = {
            completedDates: updatedDates,
            currentStreak,
            bestStreak,
            updatedAt: new Date().toISOString(),
          };
          setHabits((prev) =>
            prev.map((habit) =>
              habit.id === habitToUpdate.id ? { ...habit, ...habitUpdate } : habit
            )
          );
        }
      }

      if (checkInData.goalId) {
        const goalToUpdate = goals.find((goal) => goal.id === checkInData.goalId);
        if (goalToUpdate) {
          const currentValue = goalToUpdate.currentValue || 0;
          const progressDelta = checkInData.progressDelta || 0;
          const updatedGoal = {
            ...goalToUpdate,
            currentValue: Math.min(currentValue + progressDelta, goalToUpdate.targetValue || 100),
            checkIns: [...(goalToUpdate.checkIns || []), id],
            status: goalUtils.calculateStatus({
              ...goalToUpdate,
              currentValue: Math.min(currentValue + progressDelta, goalToUpdate.targetValue || 100),
            }),
            updatedAt: new Date().toISOString(),
          };

          if (goalToUpdate.progressType === 'tasks' && checkInData.taskId) {
            updatedGoal.completedTasks = (goalToUpdate.completedTasks || 0) + 1;
          }

          goalUpdate = updatedGoal;
          setGoals((prev) =>
            prev.map((goal) => (goal.id === goalToUpdate.id ? updatedGoal : goal))
          );
        }
      }

      showToast('Check-in salvo');

      try {
        await checkInsService.createCheckIn(user.uid, checkInData, id);
        if (habitUpdate && checkInData.habitId) {
          await habitsService.updateHabit(user.uid, checkInData.habitId, habitUpdate);
        }
        if (goalUpdate && checkInData.goalId) {
          const goalUpdateFields = {
            currentValue: goalUpdate.currentValue,
            status: goalUpdate.status,
            checkIns: goalUpdate.checkIns,
          };

          if (goalUpdate.completedTasks !== undefined) {
            goalUpdateFields.completedTasks = goalUpdate.completedTasks;
          }

          await goalsService.updateGoal(user.uid, checkInData.goalId, goalUpdateFields);
        }
        return id;
      } catch (err) {
        setCheckIns(previousCheckIns);
        setHabits(previousHabits);
        setGoals(previousGoals);
        const message = err?.message || 'Erro ao salvar check-in, tente novamente';
        setError(message);
        showToast(message, 'error');
        throw err;
      }
    },
    [user, checkIns, habits, goals, showToast]
  );

  const updateCheckIn = useCallback(
    async (checkInId, checkInData) => {
      if (!user) throw new Error('User not authenticated');
      const previousCheckIns = checkIns;
      setCheckIns((prev) =>
        prev.map((checkIn) =>
          checkIn.id === checkInId
            ? { ...checkIn, ...checkInData, updatedAt: new Date().toISOString() }
            : checkIn
        )
      );
      showToast('Check-in atualizado');

      try {
        await checkInsService.updateCheckIn(user.uid, checkInId, checkInData);
      } catch (err) {
        setCheckIns(previousCheckIns);
        const message = err?.message || 'Erro ao atualizar check-in, tente novamente';
        setError(message);
        showToast(message, 'error');
        throw err;
      }
    },
    [user, checkIns, showToast]
  );

  const deleteCheckIn = useCallback(
    async (checkInId) => {
      if (!user) throw new Error('User not authenticated');
      const prevCheckIns = checkIns;
      const prevHabits = habits;
      const prevGoals = goals;
      const targetCheckIn = checkIns.find((checkIn) => checkIn.id === checkInId);

      setCheckIns((prev) => prev.filter((checkIn) => checkIn.id !== checkInId));

      if (targetCheckIn?.habitId) {
        const habitToUpdate = habits.find((habit) => habit.id === targetCheckIn.habitId);
        if (habitToUpdate) {
          const removedDate = targetCheckIn.date.split('T')[0];
          const updatedDates = (habitToUpdate.completedDates || []).filter(
            (date) => !date.startsWith(removedDate)
          );
          const currentStreak = habitUtils.calculateStreak(updatedDates);
          const bestStreak = Math.max(habitToUpdate.bestStreak || 0, currentStreak);
          setHabits((prev) =>
            prev.map((habit) =>
              habit.id === habitToUpdate.id
                ? { ...habit, completedDates: updatedDates, currentStreak, bestStreak, updatedAt: new Date().toISOString() }
                : habit
            )
          );
        }
      }

      if (targetCheckIn?.goalId) {
        const goalToUpdate = goals.find((goal) => goal.id === targetCheckIn.goalId);
        if (goalToUpdate) {
          const updatedGoal = {
            ...goalToUpdate,
            currentValue: Math.max((goalToUpdate.currentValue || 0) - (targetCheckIn.progressDelta || 0), 0),
            checkIns: (goalToUpdate.checkIns || []).filter((id) => id !== checkInId),
            updatedAt: new Date().toISOString(),
          };
          updatedGoal.status = goalUtils.calculateStatus(updatedGoal);
          setGoals((prev) =>
            prev.map((goal) => (goal.id === goalToUpdate.id ? updatedGoal : goal))
          );
        }
      }

      showToast('Check-in removido');

      try {
        await checkInsService.deleteCheckIn(user.uid, checkInId);
        if (targetCheckIn?.habitId) {
          const habitToUpdate = habits.find((habit) => habit.id === targetCheckIn.habitId);
          if (habitToUpdate) {
            const removedDate = targetCheckIn.date.split('T')[0];
            const updatedDates = (habitToUpdate.completedDates || []).filter(
              (date) => !date.startsWith(removedDate)
            );
            const currentStreak = habitUtils.calculateStreak(updatedDates);
            const bestStreak = Math.max(habitToUpdate.bestStreak || 0, currentStreak);
            await habitsService.updateHabit(user.uid, habitToUpdate.id, {
              completedDates: updatedDates,
              currentStreak,
              bestStreak,
            });
          }
        }
        if (targetCheckIn?.goalId) {
          const goalToUpdate = goals.find((goal) => goal.id === targetCheckIn.goalId);
          if (goalToUpdate) {
            const updatedCurrentValue = Math.max((goalToUpdate.currentValue || 0) - (targetCheckIn.progressDelta || 0), 0);
            const updatedGoal = {
              currentValue: updatedCurrentValue,
              status: goalUtils.calculateStatus({ ...goalToUpdate, currentValue: updatedCurrentValue }),
              checkIns: (goalToUpdate.checkIns || []).filter((id) => id !== checkInId),
            };
            await goalsService.updateGoal(user.uid, goalToUpdate.id, updatedGoal);
          }
        }
      } catch (err) {
        setCheckIns(prevCheckIns);
        setHabits(prevHabits);
        setGoals(prevGoals);
        const message = err?.message || 'Erro ao remover check-in, tente novamente';
        setError(message);
        showToast(message, 'error');
        throw err;
      }
    },
    [user, checkIns, habits, goals, showToast]
  );

  const updateSettings = useCallback(
    async (settingsData) => {
      if (!user) throw new Error('User not authenticated');
      try {
        await settingsService.updateSettings(user.uid, settingsData);
        setSettings((prev) => ({ ...prev, ...settingsData }));
      } catch (err) {
        const message = err?.message || 'Erro ao salvar configurações';
        setError(message);
        showToast(message, 'error');
        throw err;
      }
    },
    [user, showToast]
  );

  const value = {
    goals,
    createGoal,
    updateGoal,
    deleteGoal,
    habits,
    createHabit,
    updateHabit,
    deleteHabit,
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
    journalEntries,
    createJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    checkIns,
    createCheckIn,
    updateCheckIn,
    deleteCheckIn,
    reminders,
    createReminder,
    updateReminder,
    deleteReminder,
    completeReminder,
    health,
    updateHealth,
    addWaterIntake,
    settings,
    updateSettings,
    loading,
    error,
    toast,
    showToast,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
