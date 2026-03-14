import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';
import type { AppState, TimeRecord, WorkSession } from '../types';

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      users: [
        { id: '1', name: '田中太郎', pin: '1234', hourlyRate: 1500, role: 'worker' },
        { id: '2', name: '佐藤花子', pin: '5678', hourlyRate: 1800, role: 'admin' },
      ],
      records: [],
      currentUser: null,

      addUser: (user) => set((state) => ({
        users: [...state.users, { ...user, id: String(Date.now()) }]
      })),

      updateUser: (id, updates) => set((state) => ({
        users: state.users.map(u => u.id === id ? { ...u, ...updates } : u)
      })),

      deleteUser: (id) => set((state) => ({
        users: state.users.filter(u => u.id !== id)
      })),

      setCurrentUser: (user) => set({ currentUser: user }),

      clockIn: (userId) => set((state) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const now = format(new Date(), 'HH:mm');
        const session: WorkSession = {
          id: String(Date.now()),
          clockIn: now,
          clockOut: null,
          rests: []
        };

        const existingRecord = state.records.find(r => r.userId === userId && r.date === today);

        if (existingRecord) {
          return {
            records: state.records.map(r => 
              r.id === existingRecord.id 
                ? { ...r, state: 'working' as const, sessions: [...r.sessions, session] } 
                : r
            )
          };
        } else {
          const newRecord: TimeRecord = {
            id: String(Date.now()),
            userId,
            date: today,
            sessions: [session],
            state: 'working'
          };
          return { records: [...state.records, newRecord] };
        }
      }),

      startRest: (userId) => set((state) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const now = format(new Date(), 'HH:mm');
        const records = state.records.map(r => {
          if (r.userId === userId && r.date === today && r.state === 'working') {
            const sessions = [...r.sessions];
            const lastSession = sessions[sessions.length - 1];
            if (lastSession && !lastSession.clockOut) {
              lastSession.rests = [...lastSession.rests, { start: now, end: null }];
            }
            return { ...r, state: 'resting' as const, sessions };
          }
          return r;
        });
        return { records };
      }),

      endRest: (userId) => set((state) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const now = format(new Date(), 'HH:mm');
        const records = state.records.map(r => {
          if (r.userId === userId && r.date === today && r.state === 'resting') {
            const sessions = [...r.sessions];
            const lastSession = sessions[sessions.length - 1];
            if (lastSession) {
              const lastRest = lastSession.rests[lastSession.rests.length - 1];
              if (lastRest && !lastRest.end) {
                lastRest.end = now;
              }
            }
            return { ...r, state: 'working' as const, sessions };
          }
          return r;
        });
        return { records };
      }),

      clockOut: (userId) => set((state) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const now = format(new Date(), 'HH:mm');
        const records = state.records.map(r => {
          if (r.userId === userId && r.date === today && (r.state === 'working' || r.state === 'resting')) {
            const sessions = [...r.sessions];
            const lastSession = sessions[sessions.length - 1];
            if (lastSession) {
              // 休憩中の場合は休憩も終了させる
              if (r.state === 'resting') {
                const lastRest = lastSession.rests[lastSession.rests.length - 1];
                if (lastRest && !lastRest.end) {
                  lastRest.end = now;
                }
              }
              lastSession.clockOut = now;
            }
            return { ...r, state: 'finished' as const, sessions };
          }
          return r;
        });
        return { records };
      }),

      updateRecord: (recordId, updates) => set((state) => ({
        records: state.records.map(r => r.id === recordId ? { ...r, ...updates } : r)
      })),

      addRecord: (record) => set((state) => ({
        records: [...state.records, record]
      })),

    }),
    {
      name: 'smart-timecard-storage',
    }
  )
);
