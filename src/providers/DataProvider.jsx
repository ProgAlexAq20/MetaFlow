import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from './AuthProvider';
import {
  goalsService,
  habitsService,
  categoriesService,
  journalService,
  checkInsService,
  settingsService,
} from '../services/firebase/firestoreService';
import { DEFAULT_CATEGORIES } from '../data/defaultCategories';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unsubscribers, setUnsubscribers] = useState([]);

  // Initialize data when user logs in
  useEffect(() => {
    if (!user) {
      // Clear data when user logs out
      setGoals([]);
      setHabits([]);
      setCategories([]);
      setJournalEntries([]);
      setCheckIns([]);
      setSettings(null);
      
      // Unsubscribe from all listeners
      unsubscribers.forEach((unsub) => unsub());
      setUnsubscribers([]);
      return;
    }

    const initializeData = async () => {
      try {
        setLoading(true);

        // Load all data in parallel
        const [goalsData, habitsData, categoriesData, journalData, checkInsData, settingsData] =
          await Promise.all([
            goalsService.getGoals(user.uid),
            habitsService.getHabits(user.uid),
            categoriesService.getCategories(user.uid),
            journalService.getJournalEntries(user.uid),
            checkInsService.getCheckIns(user.uid),
            settingsService.getSettings(user.uid),
          ]);

        setGoals(goalsData);
        setHabits(habitsData);
        setJournalEntries(journalData);
        setCheckIns(checkInsData);

        // If no categories exist, create default ones
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

        // Set default settings if not exists
        if (!settingsData) {
          const defaultSettings = {
            theme: 'azure-premium',
            preferredView: 'dashboard',
            createdAt: new Date(),
          };
          await settingsService.updateSettings(user.uid, defaultSettings);
          setSettings(defaultSettings);
        } else {
          setSettings(settingsData);
        }

        // Subscribe to real-time updates
        const unsubGoals = goalsService.onGoalsChange(user.uid, setGoals);
        const unsubHabits = habitsService.onHabitsChange(user.uid, setHabits);

        setUnsubscribers([unsubGoals, unsubHabits]);
        setError(null);
      } catch (err) {
        console.error('Data initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeData();

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [user]);

  // ============================================================================
  // GOALS
  // ============================================================================

  const createGoal = useCallback(
    async (goalData) => {
      if (!user) throw new Error('User not authenticated');
      try {
        const id = await goalsService.createGoal(user.uid, goalData);
        return id;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user]
  );

  const updateGoal = useCallback(
    async (goalId, goalData) => {
      if (!user) throw new Error('User not authenticated');
      try {
        await goalsService.updateGoal(user.uid, goalId, goalData);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user]
  );

  const deleteGoal = useCallback(
    async (goalId) => {
      if (!user) throw new Error('User not authenticated');
      try {
        await goalsService.deleteGoal(user.uid, goalId);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user]
  );

  // ============================================================================
  // HABITS
  // ============================================================================

  const createHabit = useCallback(
    async (habitData) => {
      if (!user) throw new Error('User not authenticated');
      try {
        const id = await habitsService.createHabit(user.uid, habitData);
        return id;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user]
  );

  const updateHabit = useCallback(
    async (habitId, habitData) => {
      if (!user) throw new Error('User not authenticated');
      try {
        await habitsService.updateHabit(user.uid, habitId, habitData);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user]
  );

  const deleteHabit = useCallback(
    async (habitId) => {
      if (!user) throw new Error('User not authenticated');
      try {
        await habitsService.deleteHabit(user.uid, habitId);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user]
  );

  // ============================================================================
  // CATEGORIES
  // ============================================================================

  const createCategory = useCallback(
    async (categoryData) => {
      if (!user) throw new Error('User not authenticated');
      try {
        const id = await categoriesService.createCategory(user.uid, categoryData);
        return id;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user]
  );

  const updateCategory = useCallback(
    async (categoryId, categoryData) => {
      if (!user) throw new Error('User not authenticated');
      try {
        await categoriesService.updateCategory(user.uid, categoryId, categoryData);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user]
  );

  const deleteCategory = useCallback(
    async (categoryId) => {
      if (!user) throw new Error('User not authenticated');
      try {
        await categoriesService.deleteCategory(user.uid, categoryId);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user]
  );

  // ============================================================================
  // JOURNAL ENTRIES
  // ============================================================================

  const createJournalEntry = useCallback(
    async (entryData) => {
      if (!user) throw new Error('User not authenticated');
      try {
        const id = await journalService.createJournalEntry(user.uid, entryData);
        return id;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user]
  );

  const updateJournalEntry = useCallback(
    async (entryId, entryData) => {
      if (!user) throw new Error('User not authenticated');
      try {
        await journalService.updateJournalEntry(user.uid, entryId, entryData);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user]
  );

  const deleteJournalEntry = useCallback(
    async (entryId) => {
      if (!user) throw new Error('User not authenticated');
      try {
        await journalService.deleteJournalEntry(user.uid, entryId);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user]
  );

  // ============================================================================
  // CHECK-INS
  // ============================================================================

  const createCheckIn = useCallback(
    async (checkInData) => {
      if (!user) throw new Error('User not authenticated');
      try {
        const id = await checkInsService.createCheckIn(user.uid, checkInData);
        return id;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user]
  );

  const updateCheckIn = useCallback(
    async (checkInId, checkInData) => {
      if (!user) throw new Error('User not authenticated');
      try {
        await checkInsService.updateCheckIn(user.uid, checkInId, checkInData);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user]
  );

  const deleteCheckIn = useCallback(
    async (checkInId) => {
      if (!user) throw new Error('User not authenticated');
      try {
        await checkInsService.deleteCheckIn(user.uid, checkInId);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user]
  );

  // ============================================================================
  // SETTINGS
  // ============================================================================

  const updateSettings = useCallback(
    async (settingsData) => {
      if (!user) throw new Error('User not authenticated');
      try {
        await settingsService.updateSettings(user.uid, settingsData);
        setSettings((prev) => ({ ...prev, ...settingsData }));
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [user]
  );

  const value = {
    // Goals
    goals,
    createGoal,
    updateGoal,
    deleteGoal,

    // Habits
    habits,
    createHabit,
    updateHabit,
    deleteHabit,

    // Categories
    categories,
    createCategory,
    updateCategory,
    deleteCategory,

    // Journal
    journalEntries,
    createJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,

    // Check-ins
    checkIns,
    createCheckIn,
    updateCheckIn,
    deleteCheckIn,

    // Settings
    settings,
    updateSettings,

    // State
    loading,
    error,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
