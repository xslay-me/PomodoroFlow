import { loadStats, loadTimerState, saveStats, saveTimerState, StoredTimerState } from './storage';
import { UserStats } from '../types/pomodoro';

export interface PersistedAppState {
  revision: number;
  stats: UserStats;
  timer: StoredTimerState;
}

// A single read/write transaction owns both statistics and the timer transition.
// IndexedDB serializes these transactions across tabs, including session recovery.
export function updateAppState(
  update: (current: PersistedAppState) => PersistedAppState,
  defaultFocusMinutes = 25,
): Promise<PersistedAppState> {
  return new Promise((resolve, reject) => {
    const opening = indexedDB.open('pomodoroflow', 1);
    opening.onupgradeneeded = () => opening.result.createObjectStore('state');
    opening.onerror = () => reject(opening.error);
    opening.onblocked = () => reject(new Error('Close older PomodoroFlow tabs and try again.'));
    opening.onsuccess = () => {
      const db = opening.result;
      db.onversionchange = () => db.close();
      const transaction = db.transaction('state', 'readwrite');
      const store = transaction.objectStore('state');
      const reading = store.get('current');
      let next: PersistedAppState;
      let changed = false;
      transaction.onabort = () => {
        db.close();
        reject(transaction.error || new Error('Progress could not be saved.'));
      };
      reading.onsuccess = () => {
        try {
          const current: PersistedAppState = reading.result || {
            revision: 0,
            stats: loadStats(),
            timer: loadTimerState(defaultFocusMinutes),
          };
          next = update(current);
          changed = !reading.result || next !== current;
          if (changed) {
            next = { ...next, revision: current.revision + 1 };
            store.put(next, 'current');
          }
        } catch (error) {
          transaction.abort();
          reject(error);
        }
      };
      transaction.oncomplete = () => {
        db.close();
        if (changed) {
          // Compatibility snapshots also notify other tabs via storage events.
          // IndexedDB remains authoritative if a snapshot write fails or arrives late.
          saveStats(next.stats);
          saveTimerState(next.timer);
        }
        resolve(next);
      };
    };
  });
}

export function readAppState(defaultFocusMinutes = 25): Promise<PersistedAppState> {
  return updateAppState((current) => current, defaultFocusMinutes);
}
