import initSqlJs, { Database } from 'sql.js';

let db: Database | null = null;
let dbInitPromise: Promise<Database> | null = null;

const DB_STORAGE_KEY = 'razi_benefit_db';

function generateId(): string {
  return crypto.randomUUID();
}

function hashPassword(password: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  return crypto.subtle.digest('SHA-256', data).then(buffer => {
    const hashArray = Array.from(new Uint8Array(buffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  });
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

async function initDatabase(): Promise<Database> {
  if (db) return db;
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = (async () => {
    const SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`
    });

    const savedDb = localStorage.getItem(DB_STORAGE_KEY);
    if (savedDb) {
      const uint8Array = new Uint8Array(JSON.parse(savedDb));
      db = new SQL.Database(uint8Array);
    } else {
      db = new SQL.Database();
      createTables(db);
      seedInitialData(db);
    }

    return db;
  })();

  return dbInitPromise;
}

function createTables(database: Database): void {
  database.run(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      ic_number TEXT,
      phone_number TEXT,
      role TEXT NOT NULL CHECK (role IN ('admin', 'patient', 'hr_admin')),
      company_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      emp_id TEXT NOT NULL,
      name TEXT NOT NULL,
      company_id TEXT NOT NULL,
      company_name TEXT NOT NULL,
      annual_balance REAL NOT NULL DEFAULT 0,
      current_balance REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      employee_name TEXT NOT NULL,
      employee_emp_id TEXT NOT NULL,
      company_name TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      diagnosis TEXT,
      medical_leave_granted INTEGER,
      mc_date_from TEXT,
      mc_date_to TEXT,
      date TEXT NOT NULL,
      balance_after REAL NOT NULL,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    )
  `);
}

function seedInitialData(database: Database): void {
  const adminId = generateId();
  const adminUserId = generateId();
  const now = new Date().toISOString();

  database.run(`
    INSERT INTO users (id, email, password_hash, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `, [adminUserId, 'admin@razi.com', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa05e5a1d3c5e8e1e9e1e', now, now]);

  database.run(`
    INSERT INTO profiles (id, user_id, full_name, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [adminId, adminUserId, 'System Admin', 'admin', now, now]);
}

function saveDatabase(): void {
  if (!db) return;
  const data = db.export();
  const array = Array.from(data);
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(array));
}

export { initDatabase, saveDatabase, generateId, hashPassword, verifyPassword };

export type User = {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  user_id: string;
  full_name: string;
  ic_number: string | null;
  phone_number: string | null;
  role: 'admin' | 'patient' | 'hr_admin';
  company_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Company = {
  id: string;
  name: string;
  created_at: string;
};

export type Employee = {
  id: string;
  emp_id: string;
  name: string;
  company_id: string;
  company_name: string;
  annual_balance: number;
  current_balance: number;
  created_at: string;
};

export type Transaction = {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_emp_id: string;
  company_name: string;
  amount: number;
  description: string;
  diagnosis: string | null;
  medical_leave_granted: boolean | null;
  mc_date_from: string | null;
  mc_date_to: string | null;
  date: string;
  balance_after: number;
};