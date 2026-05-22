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
  gardenService,
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
  const [weightEntries, setWeightEntries] = useState([]);
  const [garden, setGarden] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const unsubscribersRef = useRef([]);
  const toastTimeoutRef = useRef(null);
  const gardenSyncLocksRef = useRef(new Set());

  const createOptimisticId = () => {
    return typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  };

  const getGardenStage = (drops = 0) => {
    if (drops >= 120) return 'jardim';
    if (drops >= 70) return 'flor';
    if (drops >= 35) return 'planta';
    if (drops >= 12) return 'broto';
    return 'semente';
  };

  const getDefaultHealth = () => ({
    waterGoal: 8,
    waterGoalMl: 2000,
    waterCupMl: 250,
    waterIntakeToday: 0,
    waterIntakeMlToday: 0,
    waterIntakeDate: dateUtils.getDateKey(),
    sleepTarget: 8,
    sleepHours: 0,
    mood: 'Bom',
    targetWeight: '',
    weightUnit: 'kg',
    bedtime: '22:30',
    wakeTime: '06:30',
    nightModeReminder: true,
    medicines: [],
    stretchBreakMinutes: 60,
    eyeBreakMinutes: 20,
    breathingMinutes: 3,
    createdAt: new Date().toISOString(),
  });

  const getDefaultGarden = () => ({
    drops: 0,
    totalDrops: 0,
    stage: 'semente',
    lastRewardAt: null,
    gardenDailyRewards: {},
    createdAt: new Date().toISOString(),
  });

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
      setWeightEntries([]);
      setGarden(null);
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
          weightEntriesData,
          gardenData,
          settingsData,
        ] = await Promise.all([
          goalsService.getGoals(user.uid),
          habitsService.getHabits(user.uid),
          categoriesService.getCategories(user.uid),
          journalService.getJournalEntries(user.uid),
          checkInsService.getCheckIns(user.uid),
          remindersService.getReminders(user.uid),
          healthService.getHealth(user.uid),
          healthService.getWeightEntries(user.uid),
          gardenService.getGarden(user.uid),
          settingsService.getSettings(user.uid),
        ]);

        setGoals(goalsData);
        setHabits(habitsData);
        setJournalEntries(journalData);
        setCheckIns(checkInsData);
        setReminders(remindersData);
        setWeightEntries(weightEntriesData);

        if (!healthData) {
          const defaultHealth = getDefaultHealth();
          await healthService.updateHealth(user.uid, defaultHealth);
          setHealth(defaultHealth);
        } else {
          setHealth({ ...getDefaultHealth(), ...healthData });
        }

        if (!gardenData) {
          const defaultGarden = getDefaultGarden();
          await gardenService.updateGarden(user.uid, defaultGarden);
          setGarden(defaultGarden);
        } else {
          const normalizedGarden = {
            ...getDefaultGarden(),
            ...gardenData,
            stage: gardenData.stage || getGardenStage(gardenData.drops || 0),
          };
          setGarden(normalizedGarden);
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
             notificationPermission: typeof Notification !== 'undefined' ? Notification.permission : 'unsupported',
             createdAt: new Date().toISOString(),
           };
           await settingsService.updateSettings(user.uid, defaultSettings);
           setSettings(defaultSettings);
           localStorage.setItem('metaflow_theme', defaultSettings.theme);
         } else {
           setSettings(settingsData);
           if (settingsData.theme) {
             localStorage.setItem('metaflow_theme', settingsData.theme);
           }
         }

        unsubscribersRef.current.forEach((unsub) => unsub());
        unsubscribersRef.current = [
          goalsService.onGoalsChange(user.uid, setGoals),
          habitsService.onHabitsChange(user.uid, setHabits),
          categoriesService.onCategoriesChange(user.uid, setCategories),
          journalService.onJournalEntriesChange(user.uid, setJournalEntries),
          checkInsService.onCheckInsChange(user.uid, setCheckIns),
          remindersService.onRemindersChange(user.uid, setReminders),
          healthService.onHealthChange(user.uid, (nextHealth) => {
            setHealth(nextHealth ? { ...getDefaultHealth(), ...nextHealth } : null);
          }),
          healthService.onWeightEntriesChange(user.uid, setWeightEntries),
          gardenService.onGardenChange(user.uid, (nextGarden) => {
            setGarden(nextGarden ? { ...getDefaultGarden(), ...nextGarden } : null);
          }),
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

  const calculateGardenDailyReward = useCallback((sourceCheckIns = checkIns, sourceHabits = habits, date = new Date()) => {
    const dayKey = dateUtils.getDateKey(date);
    const goalDone = sourceCheckIns.some((checkIn) => {
      const checkInGoalId = checkIn.goalId || checkIn.relatedGoalId;
      return checkInGoalId && checkIn.date && dateUtils.getDateKey(checkIn.date) === dayKey;
    });
    const habitDone = sourceHabits.some((habit) => habitUtils.isDailyTargetMet(habit, dayKey));
    const habitDailyChecksDone = sourceHabits.some(
      (habit) => habitUtils.getDailyTargetChecks(habit) > 1 && habitUtils.isDailyTargetMet(habit, dayKey)
    );
    const drops = [goalDone, habitDone, habitDailyChecksDone].filter(Boolean).length;

    return {
      goalDone,
      habitDone,
      habitDailyChecksDone,
      drops: Math.min(3, drops),
    };
  }, [checkIns, habits]);

  const syncGardenRewardsForToday = useCallback(
    async (sourceCheckIns = checkIns, sourceHabits = habits) => {
      if (!user) return;
      const dayKey = dateUtils.getDateKey();
      const previousGarden = garden || getDefaultGarden();
      const previousRewards = previousGarden.gardenDailyRewards || {};
      const previousDayReward = previousRewards[dayKey] || {
        goalDone: false,
        habitDone: false,
        habitDailyChecksDone: false,
        drops: 0,
      };
      const nextDayReward = calculateGardenDailyReward(sourceCheckIns, sourceHabits);
      const sameReward =
        previousDayReward.goalDone === nextDayReward.goalDone &&
        previousDayReward.habitDone === nextDayReward.habitDone &&
        previousDayReward.habitDailyChecksDone === nextDayReward.habitDailyChecksDone &&
        Number(previousDayReward.drops || 0) === nextDayReward.drops;

      if (sameReward) return;

      const lockKey = `${dayKey}:${JSON.stringify(nextDayReward)}`;
      if (gardenSyncLocksRef.current.has(lockKey)) return;
      gardenSyncLocksRef.current.add(lockKey);

      const delta = nextDayReward.drops - Number(previousDayReward.drops || 0);
      const nextDrops = Math.max(0, (previousGarden.drops || 0) + delta);
      const nextGarden = {
        ...previousGarden,
        drops: nextDrops,
        totalDrops: Math.max(0, (previousGarden.totalDrops || previousGarden.drops || 0) + Math.max(delta, 0)),
        stage: getGardenStage(nextDrops),
        lastRewardAt: delta > 0 ? new Date().toISOString() : previousGarden.lastRewardAt || null,
        gardenDailyRewards: {
          ...previousRewards,
          [dayKey]: nextDayReward,
        },
      };

      setGarden(nextGarden);

      try {
        await gardenService.updateGarden(user.uid, nextGarden);
      } catch (err) {
        setGarden(previousGarden);
        const message = err?.message || 'Erro ao atualizar o Jardim MetaFlow';
        setError(message);
        showToast(message, 'error');
        throw err;
      } finally {
        gardenSyncLocksRef.current.delete(lockKey);
      }
    },
    [user, garden, checkIns, habits, calculateGardenDailyReward, showToast]
  );

  const awardGardenDrops = useCallback(
    async (amount) => {
      if (!user || !amount) return;
      const previousGarden = garden || getDefaultGarden();
      const todayKey = dateUtils.getDateKey();
      const previousRewards = previousGarden.gardenDailyRewards || {};
      const previousDayReward = previousRewards[todayKey] || {};
      const availableToday = Math.max(0, 3 - Number(previousDayReward.drops || 0));
      const safeAmount = Math.min(Number(amount) || 0, availableToday);
      if (safeAmount <= 0) return;
      const nextDrops = (previousGarden.drops || 0) + safeAmount;
      const nextGarden = {
        ...previousGarden,
        drops: (previousGarden.drops || 0) + safeAmount,
        totalDrops: (previousGarden.totalDrops || 0) + safeAmount,
        stage: getGardenStage(nextDrops),
        lastRewardAt: new Date().toISOString(),
        gardenDailyRewards: {
          ...previousRewards,
          [todayKey]: {
            goalDone: Boolean(previousDayReward.goalDone),
            habitDone: Boolean(previousDayReward.habitDone),
            habitDailyChecksDone: Boolean(previousDayReward.habitDailyChecksDone),
            drops: Math.min(3, Number(previousDayReward.drops || 0) + safeAmount),
          },
        },
      };

      setGarden(nextGarden);

      try {
        await gardenService.updateGarden(user.uid, nextGarden);
      } catch (err) {
        setGarden(previousGarden);
        console.error('Error updating garden:', err);
      }
    },
    [user, garden]
  );

  const waterGardenToday = useCallback(
    async () => {
      if (!user) throw new Error('User not authenticated');
      try {
        await syncGardenRewardsForToday();
        showToast('Jardim sincronizado com as ações de hoje');
      } catch (err) {
        throw err;
      }
    },
    [user, syncGardenRewardsForToday, showToast]
  );

  useEffect(() => {
    if (!user || !garden) return;
    syncGardenRewardsForToday().catch((err) => {
      console.error('Garden reward sync error:', err);
    });
  }, [user, garden, checkIns, habits, syncGardenRewardsForToday]);

  const createHabit = useCallback(
    async (habitData) => {
      if (!user) throw new Error('User not authenticated');
      const id = createOptimisticId();
      const optimisticHabit = {
        id,
        ...habitData,
        dailyTargetChecks: habitUtils.getDailyTargetChecks(habitData),
        dailyChecks: habitData.dailyChecks || {},
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
      const normalizedHabitData = habitData.completedDates
        ? { ...habitData, completedDates: habitUtils.uniqueCompletedDates(habitData.completedDates) }
        : habitData;
      const nextHabits = habits.map((habit) =>
        habit.id === habitId ? { ...habit, ...normalizedHabitData, updatedAt: new Date().toISOString() } : habit
      );

      setHabits(nextHabits);
      showToast('Hábito atualizado');

      try {
        await habitsService.updateHabit(user.uid, habitId, normalizedHabitData);
        await syncGardenRewardsForToday(checkIns, nextHabits);
      } catch (err) {
        setHabits(previousHabits);
        const message = err?.message || 'Erro ao atualizar hábito, tente novamente';
        setError(message);
        showToast(message, 'error');
        throw err;
      }
    },
    [user, habits, checkIns, showToast, syncGardenRewardsForToday]
  );

  const deleteHabit = useCallback(
    async (habitId) => {
      if (!user) throw new Error('User not authenticated');
      const previousHabits = habits;
      const nextHabits = habits.filter((habit) => habit.id !== habitId);
      setHabits(nextHabits);
      showToast('Hábito removido');

      try {
        await habitsService.deleteHabit(user.uid, habitId);
        await syncGardenRewardsForToday(checkIns, nextHabits);
      } catch (err) {
        setHabits(previousHabits);
        const message = err?.message || 'Erro ao remover hábito, tente novamente';
        setError(message);
        showToast(message, 'error');
        throw err;
      }
    },
    [user, habits, checkIns, showToast, syncGardenRewardsForToday]
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
    async (reminderId, reminderData, options = {}) => {
      if (!user) throw new Error('User not authenticated');
      const previousReminders = reminders;
      setReminders((prev) =>
        prev.map((reminder) =>
          reminder.id === reminderId
            ? { ...reminder, ...reminderData, updatedAt: new Date().toISOString() }
            : reminder
        )
      );
      if (!options.silent) {
        showToast('Lembrete atualizado');
      }

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
      const todayKey = dateUtils.getDateKey();
      const currentIntake = previousHealth?.waterIntakeDate === todayKey
        ? previousHealth?.waterIntakeToday || 0
        : 0;
      const currentMl = previousHealth?.waterIntakeDate === todayKey
        ? previousHealth?.waterIntakeMlToday || 0
        : 0;
      const cupMl = Number(previousHealth?.waterCupMl || 250);
      const updatedAmount = currentIntake + amount;
      const updatedMl = currentMl + (Number(amount) || 1) * cupMl;
      setHealth((prev) => ({
        ...prev,
        waterIntakeToday: updatedAmount,
        waterIntakeMlToday: updatedMl,
        waterIntakeDate: todayKey,
      }));
      showToast('Hidratação registrada');

      try {
        await healthService.updateHealth(user.uid, {
          waterIntakeToday: updatedAmount,
          waterIntakeMlToday: updatedMl,
          waterIntakeDate: todayKey,
        });
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

  const createWeightEntry = useCallback(
    async (entryData) => {
      if (!user) throw new Error('User not authenticated');
      const id = createOptimisticId();
      const now = new Date().toISOString();
      const optimisticEntry = {
        id,
        ...entryData,
        unit: entryData.unit || 'kg',
        createdAt: now,
        updatedAt: now,
      };
      const previousEntries = weightEntries;
      const previousHealth = health;

      setWeightEntries((prev) =>
        [optimisticEntry, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date))
      );
      setHealth((prev) => ({
        ...prev,
        currentWeight: Number(entryData.weight),
        targetWeight: entryData.targetWeight ?? prev?.targetWeight ?? '',
        weightUnit: entryData.unit || 'kg',
      }));
      showToast('Peso registrado');

      try {
        await healthService.createWeightEntry(user.uid, entryData, id);
        await healthService.updateHealth(user.uid, {
          currentWeight: Number(entryData.weight),
          targetWeight: entryData.targetWeight ?? previousHealth?.targetWeight ?? '',
          weightUnit: entryData.unit || 'kg',
        });
        return id;
      } catch (err) {
        setWeightEntries(previousEntries);
        setHealth(previousHealth);
        const message = err?.message || 'Erro ao registrar peso';
        setError(message);
        showToast(message, 'error');
        throw err;
      }
    },
    [user, weightEntries, health, showToast]
  );

  const updateWeightEntry = useCallback(
    async (entryId, entryData) => {
      if (!user) throw new Error('User not authenticated');
      const previousEntries = weightEntries;
      setWeightEntries((prev) =>
        prev
          .map((entry) =>
            entry.id === entryId ? { ...entry, ...entryData, updatedAt: new Date().toISOString() } : entry
          )
          .sort((a, b) => new Date(b.date) - new Date(a.date))
      );
      showToast('Peso atualizado');

      try {
        await healthService.updateWeightEntry(user.uid, entryId, entryData);
      } catch (err) {
        setWeightEntries(previousEntries);
        const message = err?.message || 'Erro ao atualizar peso';
        setError(message);
        showToast(message, 'error');
        throw err;
      }
    },
    [user, weightEntries, showToast]
  );

  const deleteWeightEntry = useCallback(
    async (entryId) => {
      if (!user) throw new Error('User not authenticated');
      const previousEntries = weightEntries;
      setWeightEntries((prev) => prev.filter((entry) => entry.id !== entryId));
      showToast('Registro de peso removido');

      try {
        await healthService.deleteWeightEntry(user.uid, entryId);
      } catch (err) {
        setWeightEntries(previousEntries);
        const message = err?.message || 'Erro ao remover registro de peso';
        setError(message);
        showToast(message, 'error');
        throw err;
      }
    },
    [user, weightEntries, showToast]
  );

  // NOTE: Define createCheckIn before any hooks that reference it in their dependency arrays
  // to avoid temporal dead zone errors in production builds.
  const createCheckIn = useCallback(
    async (checkInData) => {
      if (!user) throw new Error('User not authenticated');

      const id = createOptimisticId();
      const completedAt = checkInData.date || new Date().toISOString();
      const completedKey = dateUtils.getDateKey(completedAt);
      const effectiveHabitId = checkInData.habitId || checkInData.relatedHabitId || null;
      const effectiveGoalId = checkInData.goalId || checkInData.relatedGoalId || null;

      if (effectiveHabitId) {
        const habitToCheck = habits.find((habit) => habit.id === effectiveHabitId);
        const targetChecks = habitUtils.getDailyTargetChecks(habitToCheck);
        const currentChecks = habitToCheck ? habitUtils.getDailyCheckCount(habitToCheck, completedAt) : 0;
        const sameDayCheckIns = checkIns.filter((checkIn) =>
          (checkIn.habitId || checkIn.relatedHabitId) === effectiveHabitId &&
          checkIn.date &&
          dateUtils.getDateKey(checkIn.date) === completedKey
        ).length;
        const checksSoFar = Math.max(currentChecks, sameDayCheckIns);

        if (checksSoFar >= targetChecks) {
          showToast(
            targetChecks > 1
              ? `Meta diária deste hábito já concluída (${targetChecks}/${targetChecks})`
              : 'Este hábito já foi marcado hoje',
            'error'
          );
          return null;
        }
      }

      const optimisticCheckIn = {
        id,
        ...checkInData,
        goalId: effectiveGoalId,
        relatedGoalId: effectiveGoalId,
        habitId: effectiveHabitId,
        relatedHabitId: effectiveHabitId,
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

      if (effectiveHabitId) {
        const habitToUpdate = habits.find((habit) => habit.id === effectiveHabitId);
        if (habitToUpdate) {
          const targetChecks = habitUtils.getDailyTargetChecks(habitToUpdate);
          const dailyChecks = { ...habitUtils.getDailyChecks(habitToUpdate) };
          const nextCheckCount = Math.min(targetChecks, habitUtils.getDailyCheckCount(habitToUpdate, completedAt) + 1);
          dailyChecks[completedKey] = nextCheckCount;
          const completedDates = habitToUpdate.completedDates || [];
          const reachesTarget = nextCheckCount >= targetChecks;
          const hasCompletedDate = habitUtils.hasCompletionOnDate(habitToUpdate, completedAt);
          const updatedDates = reachesTarget && !hasCompletedDate
            ? habitUtils.uniqueCompletedDates([...completedDates, completedAt])
            : reachesTarget
            ? habitUtils.uniqueCompletedDates(completedDates)
            : completedDates.filter((date) => dateUtils.getDateKey(date) !== completedKey);
          const currentStreak = habitUtils.calculateStreak(updatedDates);
          const bestStreak = Math.max(habitToUpdate.bestStreak || 0, currentStreak);
          habitUpdate = {
            dailyTargetChecks: targetChecks,
            dailyChecks,
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

      if (effectiveGoalId) {
        const goalToUpdate = goals.find((goal) => goal.id === effectiveGoalId);
        if (goalToUpdate) {
          const currentValue = goalToUpdate.currentValue || 0;
          const progressDelta = Number(checkInData.progressDelta || 0);
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

          if (goalToUpdate.progressType === 'tasks') {
            const completedTasksDelta = Number(checkInData.completedTasksDelta || (checkInData.taskId ? 1 : 0));
            if (completedTasksDelta > 0) {
              updatedGoal.completedTasks = Math.min(
                (goalToUpdate.completedTasks || 0) + completedTasksDelta,
                goalToUpdate.totalTasks || Number.MAX_SAFE_INTEGER
              );
            }
          }

          goalUpdate = updatedGoal;
          setGoals((prev) =>
            prev.map((goal) => (goal.id === goalToUpdate.id ? updatedGoal : goal))
          );
        }
      }

      const nextCheckIns = [optimisticCheckIn, ...checkIns];
      const nextHabits = habitUpdate && effectiveHabitId
        ? habits.map((habit) => (habit.id === effectiveHabitId ? { ...habit, ...habitUpdate } : habit))
        : habits;

      showToast('Check-in salvo');

      try {
        await checkInsService.createCheckIn(user.uid, {
          ...checkInData,
          goalId: effectiveGoalId,
          relatedGoalId: effectiveGoalId,
          habitId: effectiveHabitId,
          relatedHabitId: effectiveHabitId,
          date: completedAt,
        }, id);
        if (habitUpdate && effectiveHabitId) {
          await habitsService.updateHabit(user.uid, effectiveHabitId, habitUpdate);
        }
        if (goalUpdate && effectiveGoalId) {
          const goalUpdateFields = {
            currentValue: goalUpdate.currentValue,
            status: goalUpdate.status,
            checkIns: goalUpdate.checkIns,
          };

          if (goalUpdate.completedTasks !== undefined) {
            goalUpdateFields.completedTasks = goalUpdate.completedTasks;
          }

          await goalsService.updateGoal(user.uid, effectiveGoalId, goalUpdateFields);
        }
        await syncGardenRewardsForToday(nextCheckIns, nextHabits);
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
    [user, checkIns, habits, goals, showToast, syncGardenRewardsForToday]
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
        await updateReminder(reminder.id, {
          lastCompletedAt: new Date().toISOString(),
          snoozedUntil: null,
        });
        showToast('Lembrete concluído');
      } catch (err) {
        console.error('Error completing reminder:', err);
      }
    },
    [user, createCheckIn, updateReminder, showToast]
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
      const targetHabitId = targetCheckIn?.habitId || targetCheckIn?.relatedHabitId;
      const targetGoalId = targetCheckIn?.goalId || targetCheckIn?.relatedGoalId;

      setCheckIns((prev) => prev.filter((checkIn) => checkIn.id !== checkInId));

      if (targetHabitId) {
        const habitToUpdate = habits.find((habit) => habit.id === targetHabitId);
        if (habitToUpdate) {
          const removedDate = dateUtils.getDateKey(targetCheckIn.date);
          const targetChecks = habitUtils.getDailyTargetChecks(habitToUpdate);
          const dailyChecks = { ...habitUtils.getDailyChecks(habitToUpdate) };
          const nextCount = Math.max(0, habitUtils.getDailyCheckCount(habitToUpdate, targetCheckIn.date) - 1);
          if (nextCount > 0) {
            dailyChecks[removedDate] = nextCount;
          } else {
            delete dailyChecks[removedDate];
          }
          const updatedDates = nextCount >= targetChecks
            ? habitUtils.uniqueCompletedDates(habitToUpdate.completedDates || [])
            : (habitToUpdate.completedDates || []).filter((date) => dateUtils.getDateKey(date) !== removedDate);
          const currentStreak = habitUtils.calculateStreak(updatedDates);
          const bestStreak = Math.max(habitToUpdate.bestStreak || 0, currentStreak);
          setHabits((prev) =>
            prev.map((habit) =>
              habit.id === habitToUpdate.id
                ? { ...habit, dailyChecks, completedDates: updatedDates, currentStreak, bestStreak, updatedAt: new Date().toISOString() }
                : habit
            )
          );
        }
      }

      if (targetGoalId) {
        const goalToUpdate = goals.find((goal) => goal.id === targetGoalId);
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
        if (targetHabitId) {
          const habitToUpdate = habits.find((habit) => habit.id === targetHabitId);
          if (habitToUpdate) {
            const removedDate = dateUtils.getDateKey(targetCheckIn.date);
            const targetChecks = habitUtils.getDailyTargetChecks(habitToUpdate);
            const dailyChecks = { ...habitUtils.getDailyChecks(habitToUpdate) };
            const nextCount = Math.max(0, habitUtils.getDailyCheckCount(habitToUpdate, targetCheckIn.date) - 1);
            if (nextCount > 0) {
              dailyChecks[removedDate] = nextCount;
            } else {
              delete dailyChecks[removedDate];
            }
            const updatedDates = nextCount >= targetChecks
              ? habitUtils.uniqueCompletedDates(habitToUpdate.completedDates || [])
              : (habitToUpdate.completedDates || []).filter((date) => dateUtils.getDateKey(date) !== removedDate);
            const currentStreak = habitUtils.calculateStreak(updatedDates);
            const bestStreak = Math.max(habitToUpdate.bestStreak || 0, currentStreak);
            await habitsService.updateHabit(user.uid, habitToUpdate.id, {
              dailyChecks,
              completedDates: updatedDates,
              currentStreak,
              bestStreak,
            });
          }
        }
        if (targetGoalId) {
          const goalToUpdate = goals.find((goal) => goal.id === targetGoalId);
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
        const nextCheckIns = prevCheckIns.filter((checkIn) => checkIn.id !== checkInId);
        const nextHabits = targetHabitId
          ? habits.map((habit) => {
              if (habit.id !== targetHabitId) return habit;
              const removedDate = dateUtils.getDateKey(targetCheckIn.date);
              const targetChecks = habitUtils.getDailyTargetChecks(habit);
              const dailyChecks = { ...habitUtils.getDailyChecks(habit) };
              const nextCount = Math.max(0, habitUtils.getDailyCheckCount(habit, targetCheckIn.date) - 1);
              if (nextCount > 0) dailyChecks[removedDate] = nextCount;
              else delete dailyChecks[removedDate];
              const completedDates = nextCount >= targetChecks
                ? habitUtils.uniqueCompletedDates(habit.completedDates || [])
                : (habit.completedDates || []).filter((date) => dateUtils.getDateKey(date) !== removedDate);
              return { ...habit, dailyChecks, completedDates };
            })
          : habits;
        await syncGardenRewardsForToday(nextCheckIns, nextHabits);
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
    [user, checkIns, habits, goals, showToast, syncGardenRewardsForToday]
  );

  const updateSettings = useCallback(
    async (settingsData) => {
      if (!user) throw new Error('User not authenticated');
      try {
        await settingsService.updateSettings(user.uid, settingsData);
        setSettings((prev) => ({ ...prev, ...settingsData }));
        // Sync theme to localStorage if it's being updated
        if (settingsData.theme) {
          localStorage.setItem('metaflow_theme', settingsData.theme);
        }
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
    weightEntries,
    createWeightEntry,
    updateWeightEntry,
    deleteWeightEntry,
    garden,
    awardGardenDrops,
    waterGardenToday,
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
