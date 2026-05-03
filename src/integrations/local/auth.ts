import { initDatabase, saveDatabase, generateId, hashPassword, verifyPassword, User, Profile } from './database';

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
}

let currentSession: AuthSession | null = null;

export const getCurrentSession = (): AuthSession | null => {
  if (currentSession) return currentSession;
  
  const stored = localStorage.getItem('razi_auth_session');
  if (stored) {
    currentSession = JSON.parse(stored);
    return currentSession;
  }
  return null;
};

export const setSession = (session: AuthSession): void => {
  currentSession = session;
  localStorage.setItem('razi_auth_session', JSON.stringify(session));
};

export const clearSession = (): void => {
  currentSession = null;
  localStorage.removeItem('razi_auth_session');
};

export const signUp = async (
  email: string,
  password: string,
  fullName: string,
  icNumber?: string,
  phoneNumber?: string
): Promise<{ user: AuthUser | null; error: Error | null }> => {
  try {
    const db = await initDatabase();
    
    const existingUser = db.exec(`SELECT id FROM users WHERE email = ?`, [email]);
    if (existingUser.length > 0 && existingUser[0].values.length > 0) {
      return { user: null, error: new Error('Email already registered') };
    }

    const passwordHash = await hashPassword(password);
    const userId = generateId();
    const profileId = generateId();
    const now = new Date().toISOString();

    db.run(`
      INSERT INTO users (id, email, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, email, passwordHash, now, now]);

    db.run(`
      INSERT INTO profiles (id, user_id, full_name, ic_number, phone_number, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [profileId, userId, fullName, icNumber || null, phoneNumber || null, 'patient', now, now]);

    saveDatabase();

    const user: AuthUser = { id: userId, email };
    setSession({ user, accessToken: 'local-token' });

    return { user, error: null };
  } catch (error) {
    return { user: null, error: error as Error };
  }
};

export const signIn = async (
  email: string,
  password: string
): Promise<{ user: AuthUser | null; error: Error | null }> => {
  try {
    const db = await initDatabase();
    
    const result = db.exec(`SELECT * FROM users WHERE email = ?`, [email]);
    if (result.length === 0 || result[0].values.length === 0) {
      return { user: null, error: new Error('Invalid email or password') };
    }

    const userRow = result[0].values[0];
    const userId = userRow[0] as string;
    const storedHash = userRow[2] as string;

    const isValid = await verifyPassword(password, storedHash);
    if (!isValid) {
      return { user: null, error: new Error('Invalid email or password') };
    }

    const user: AuthUser = { id: userId, email };
    setSession({ user, accessToken: 'local-token' });

    return { user, error: null };
  } catch (error) {
    return { user: null, error: error as Error };
  }
};

export const signOut = async (): Promise<void> => {
  clearSession();
};

export const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const db = await initDatabase();
    const result = db.exec(`SELECT * FROM profiles WHERE user_id = ?`, [userId]);
    
    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    const row = result[0].values[0];
    return {
      id: row[0] as string,
      user_id: row[1] as string,
      full_name: row[2] as string,
      ic_number: row[3] as string | null,
      phone_number: row[4] as string | null,
      role: row[5] as 'admin' | 'patient' | 'hr_admin',
      company_id: row[6] as string | null,
      created_at: row[7] as string,
      updated_at: row[8] as string,
    };
  } catch {
    return null;
  }
};

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const db = await initDatabase();
    const result = db.exec(`SELECT * FROM users WHERE id = ?`, [userId]);
    
    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }

    const row = result[0].values[0];
    return {
      id: row[0] as string,
      email: row[1] as string,
      password_hash: row[2] as string,
      created_at: row[3] as string,
      updated_at: row[4] as string,
    };
  } catch {
    return null;
  }
};