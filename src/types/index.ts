export type User = {
  id: string;
  name: string;
  pin: string;
  hourlyRate: number;
  role: 'admin' | 'worker';
};

export type ShiftState = 'idle' | 'working' | 'resting' | 'finished';

export type RestRecord = {
  start: string;
  end: string | null;
};

export type WorkSession = {
  id: string;
  clockIn: string;
  clockOut: string | null;
  rests: RestRecord[];
};

export type TimeRecord = {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  sessions: WorkSession[];
  state: ShiftState;
};

export type AppState = {
  users: User[];
  records: TimeRecord[];
  currentUser: User | null;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  setCurrentUser: (user: User | null) => void;
  
  clockIn: (userId: string) => void;
  clockOut: (userId: string) => void;
  startRest: (userId: string) => void;
  endRest: (userId: string) => void;
  
  updateRecord: (recordId: string, updates: Partial<TimeRecord>) => void;
  addRecord: (record: TimeRecord) => void;
};
