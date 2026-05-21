import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

const COLLECTIONS = {
  USERS: 'users',
  GOALS: 'goals',
  HABITS: 'habits',
  CATEGORIES: 'categories',
  JOURNAL_ENTRIES: 'journalEntries',
  CHECK_INS: 'checkIns',
  REMINDERS: 'reminders',
  HEALTH: 'health',
  SETTINGS: 'settings',
};

// ============================================================================
// USER OPERATIONS
// ============================================================================

export const userService = {
  async createUser(userId, userData) {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const now = serverTimestamp();
    
    return setDoc(userRef, {
      ...userData,
      createdAt: now,
      updatedAt: now,
    });
  },

  async getUser(userId) {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
  },

  async updateUser(userId, userData) {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    return updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    });
  },
};

// ============================================================================
// GOALS OPERATIONS
// ============================================================================

export const goalsService = {
  async getGoals(userId) {
    const goalsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.GOALS);
    const goalsSnap = await getDocs(goalsRef);
    return goalsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  async getGoal(userId, goalId) {
    const goalRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.GOALS,
      goalId
    );
    const goalSnap = await getDoc(goalRef);
    return goalSnap.exists() ? { id: goalSnap.id, ...goalSnap.data() } : null;
  },

  async createGoal(userId, goalData, id = null) {
    const goalsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.GOALS);
    const goalRef = id ? doc(goalsRef, id) : doc(goalsRef);
    const now = serverTimestamp();
    
    await setDoc(goalRef, {
      ...goalData,
      createdAt: now,
      updatedAt: now,
    });
    
    return goalRef.id;
  },

  async updateGoal(userId, goalId, goalData) {
    const goalRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.GOALS,
      goalId
    );
    
    return updateDoc(goalRef, {
      ...goalData,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteGoal(userId, goalId) {
    const goalRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.GOALS,
      goalId
    );
    
    return deleteDoc(goalRef);
  },

  onGoalsChange(userId, callback) {
    const goalsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.GOALS);
    
    return onSnapshot(goalsRef, (snapshot) => {
      const goals = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(goals);
    });
  },
};

// ============================================================================
// HABITS OPERATIONS
// ============================================================================

export const habitsService = {
  async getHabits(userId) {
    const habitsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.HABITS);
    const habitsSnap = await getDocs(habitsRef);
    return habitsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  async getHabit(userId, habitId) {
    const habitRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.HABITS,
      habitId
    );
    const habitSnap = await getDoc(habitRef);
    return habitSnap.exists() ? { id: habitSnap.id, ...habitSnap.data() } : null;
  },

  async createHabit(userId, habitData, id = null) {
    const habitsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.HABITS);
    const habitRef = id ? doc(habitsRef, id) : doc(habitsRef);
    const now = serverTimestamp();
    
    await setDoc(habitRef, {
      ...habitData,
      completedDates: [],
      currentStreak: 0,
      bestStreak: 0,
      createdAt: now,
      updatedAt: now,
    });
    
    return habitRef.id;
  },

  async updateHabit(userId, habitId, habitData) {
    const habitRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.HABITS,
      habitId
    );
    
    return updateDoc(habitRef, {
      ...habitData,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteHabit(userId, habitId) {
    const habitRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.HABITS,
      habitId
    );
    
    return deleteDoc(habitRef);
  },

  onHabitsChange(userId, callback) {
    const habitsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.HABITS);
    
    return onSnapshot(habitsRef, (snapshot) => {
      const habits = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(habits);
    });
  },
};

// ============================================================================
// CATEGORIES OPERATIONS
// ============================================================================

export const categoriesService = {
  async getCategories(userId) {
    const categoriesRef = collection(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.CATEGORIES
    );
    const categoriesSnap = await getDocs(categoriesRef);
    return categoriesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  async createCategory(userId, categoryData, id = null) {
    const categoriesRef = collection(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.CATEGORIES
    );
    const categoryRef = id ? doc(categoriesRef, id) : doc(categoriesRef);
    const now = serverTimestamp();
    
    await setDoc(categoryRef, {
      ...categoryData,
      createdAt: now,
      updatedAt: now,
    });
    
    return categoryRef.id;
  },

  async updateCategory(userId, categoryId, categoryData) {
    const categoryRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.CATEGORIES,
      categoryId
    );
    
    return updateDoc(categoryRef, {
      ...categoryData,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteCategory(userId, categoryId) {
    const categoryRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.CATEGORIES,
      categoryId
    );
    
    return deleteDoc(categoryRef);
  },

  onCategoriesChange(userId, callback) {
    const categoriesRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.CATEGORIES);
    return onSnapshot(categoriesRef, (snapshot) => {
      const categories = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(categories);
    });
  },
};

// ============================================================================
// JOURNAL ENTRIES OPERATIONS
// ============================================================================

export const journalService = {
  async getJournalEntries(userId) {
    const entriesRef = collection(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.JOURNAL_ENTRIES
    );
    const entriesSnap = await getDocs(
      query(entriesRef, orderBy('date', 'desc'))
    );
    return entriesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  async createJournalEntry(userId, entryData, id = null) {
    const entriesRef = collection(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.JOURNAL_ENTRIES
    );
    const entryRef = id ? doc(entriesRef, id) : doc(entriesRef);
    const now = serverTimestamp();
    
    await setDoc(entryRef, {
      ...entryData,
      createdAt: now,
      updatedAt: now,
    });
    
    return entryRef.id;
  },

  async updateJournalEntry(userId, entryId, entryData) {
    const entryRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.JOURNAL_ENTRIES,
      entryId
    );
    
    return updateDoc(entryRef, {
      ...entryData,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteJournalEntry(userId, entryId) {
    const entryRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.JOURNAL_ENTRIES,
      entryId
    );
    
    return deleteDoc(entryRef);
  },

  onJournalEntriesChange(userId, callback) {
    const entriesRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.JOURNAL_ENTRIES);
    return onSnapshot(query(entriesRef, orderBy('date', 'desc')), (snapshot) => {
      const entries = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(entries);
    });
  },
};

// ============================================================================
// CHECK-INS OPERATIONS
// ============================================================================

export const checkInsService = {
  async getCheckIns(userId) {
    const checkInsRef = collection(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.CHECK_INS
    );
    const checkInsSnap = await getDocs(
      query(checkInsRef, orderBy('date', 'desc'))
    );
    return checkInsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  async createCheckIn(userId, checkInData, id = null) {
    const checkInsRef = collection(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.CHECK_INS
    );
    const checkInRef = id ? doc(checkInsRef, id) : doc(checkInsRef);
    const now = serverTimestamp();
    
    await setDoc(checkInRef, {
      ...checkInData,
      createdAt: now,
      updatedAt: now,
    });
    
    return checkInRef.id;
  },

  async updateCheckIn(userId, checkInId, checkInData) {
    const checkInRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.CHECK_INS,
      checkInId
    );
    
    return updateDoc(checkInRef, {
      ...checkInData,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteCheckIn(userId, checkInId) {
    const checkInRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.CHECK_INS,
      checkInId
    );
    
    return deleteDoc(checkInRef);
  },

  onCheckInsChange(userId, callback) {
    const checkInsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.CHECK_INS);
    return onSnapshot(query(checkInsRef, orderBy('date', 'desc')), (snapshot) => {
      const checkIns = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(checkIns);
    });
  },
};

// ============================================================================
// REMINDERS OPERATIONS
// ============================================================================

export const remindersService = {
  async getReminders(userId) {
    const remindersRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.REMINDERS);
    const remindersSnap = await getDocs(query(remindersRef, orderBy('createdAt', 'desc')));
    return remindersSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  async createReminder(userId, reminderData, id = null) {
    const remindersRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.REMINDERS);
    const reminderRef = id ? doc(remindersRef, id) : doc(remindersRef);
    const now = serverTimestamp();

    await setDoc(reminderRef, {
      ...reminderData,
      active: reminderData.active !== false,
      createdAt: now,
      updatedAt: now,
    });

    return reminderRef.id;
  },

  async updateReminder(userId, reminderId, reminderData) {
    const reminderRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.REMINDERS, reminderId);
    return updateDoc(reminderRef, {
      ...reminderData,
      updatedAt: serverTimestamp(),
    });
  },

  async deleteReminder(userId, reminderId) {
    const reminderRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.REMINDERS, reminderId);
    return deleteDoc(reminderRef);
  },

  onRemindersChange(userId, callback) {
    const remindersRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.REMINDERS);
    return onSnapshot(query(remindersRef, orderBy('createdAt', 'desc')), (snapshot) => {
      const reminders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(reminders);
    });
  },
};

// ============================================================================
// HEALTH OPERATIONS
// ============================================================================

export const healthService = {
  async getHealth(userId) {
    const healthRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.HEALTH, 'metrics');
    const healthSnap = await getDoc(healthRef);
    return healthSnap.exists() ? healthSnap.data() : null;
  },

  async updateHealth(userId, healthData) {
    const healthRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.HEALTH, 'metrics');
    return setDoc(
      healthRef,
      {
        ...healthData,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  },

  onHealthChange(userId, callback) {
    const healthRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.HEALTH, 'metrics');
    return onSnapshot(healthRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null);
    });
  },
};

// ============================================================================
// SETTINGS OPERATIONS
// ============================================================================

export const settingsService = {
  async getSettings(userId) {
    const settingsRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.SETTINGS, 'app');
    const settingsSnap = await getDoc(settingsRef);
    return settingsSnap.exists() ? settingsSnap.data() : null;
  },

  async updateSettings(userId, settingsData) {
    const settingsRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.SETTINGS, 'app');
    
    return setDoc(
      settingsRef,
      {
        ...settingsData,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  },

  onSettingsChange(userId, callback) {
    const settingsRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.SETTINGS, 'app');
    return onSnapshot(settingsRef, (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null);
    });
  },
};

export default {
  userService,
  goalsService,
  habitsService,
  categoriesService,
  journalService,
  checkInsService,
  remindersService,
  healthService,
  settingsService,
};
