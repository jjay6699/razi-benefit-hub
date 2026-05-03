import express, { Request, Response } from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'razi.db');

if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);
const app = express();
const PORT = parseInt(process.env.PORT || '3001');
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());

db.exec(`
  CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

db.exec(`
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

db.exec(`
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

db.exec(`
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

const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@razi.com');
if (!adminExists) {
  const adminUserId = uuidv4();
  const now = new Date().toISOString();
  const defaultPasswordHash = crypto.createHash('sha256').update('password').digest('hex');

  db.prepare(`INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`)
    .run(adminUserId, 'admin@razi.com', defaultPasswordHash, now, now);

  db.prepare(`INSERT INTO profiles (id, user_id, full_name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(uuidv4(), adminUserId, 'System Admin', 'admin', now, now);
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

const authMiddleware = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.post('/api/auth/signup', (req: Request, res: Response) => {
  try {
    const { email, password, fullName, icNumber, phoneNumber } = req.body;

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const userId = uuidv4();
    const profileId = uuidv4();
    const now = new Date().toISOString();
    const passwordHash = hashPassword(password);

    db.prepare(`INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`)
      .run(userId, email, passwordHash, now, now);

    db.prepare(`INSERT INTO profiles (id, user_id, full_name, ic_number, phone_number, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(profileId, userId, fullName, icNumber || null, phoneNumber || null, 'patient', now, now);

    res.json({ user: { id: userId, email }, error: null });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/signin', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({ user: { id: user.id, email: user.email }, accessToken: 'server-token', error: null });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/signout', authMiddleware, (req: Request, res: Response) => {
  res.json({ success: true });
});

app.get('/api/profiles/:userId', authMiddleware, (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const profile = db.prepare(`
      SELECT p.*, c.name as company_name
      FROM profiles p
      LEFT JOIN companies c ON p.company_id = c.id
      WHERE p.user_id = ?
    `).get(userId) as any;

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/profiles', authMiddleware, (req: Request, res: Response) => {
  try {
    const profiles = db.prepare(`
      SELECT p.*, c.name as company_name
      FROM profiles p
      LEFT JOIN companies c ON p.company_id = c.id
      ORDER BY p.created_at ASC
    `).all();
    res.json(profiles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/profiles/:userId', authMiddleware, (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { full_name, company_id, role } = req.body;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE profiles
      SET full_name = COALESCE(?, full_name),
          company_id = COALESCE(?, company_id),
          role = COALESCE(?, role),
          updated_at = ?
      WHERE user_id = ?
    `).run(full_name, company_id, role, now, userId);

    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/companies', authMiddleware, (req: Request, res: Response) => {
  try {
    const companies = db.prepare('SELECT * FROM companies ORDER BY created_at ASC').all();
    res.json(companies);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/companies', authMiddleware, (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare('INSERT INTO companies (id, name, created_at) VALUES (?, ?, ?)').run(id, name, now);
    res.json({ id, name, created_at: now });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/companies/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM companies WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/employees', authMiddleware, (req: Request, res: Response) => {
  try {
    const employees = db.prepare('SELECT * FROM employees ORDER BY created_at ASC').all();
    res.json(employees);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/employees/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/employees', authMiddleware, (req: Request, res: Response) => {
  try {
    const { emp_id, name, company_id, company_name, annual_balance, current_balance } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO employees (id, emp_id, name, company_id, company_name, annual_balance, current_balance, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, emp_id, name, company_id, company_name, annual_balance || 0, current_balance || 0, now);

    res.json({ id, emp_id, name, company_id, company_name, annual_balance: annual_balance || 0, current_balance: current_balance || 0, created_at: now });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/employees/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { emp_id, name, company_id, company_name, annual_balance, current_balance } = req.body;

    db.prepare(`
      UPDATE employees SET
        emp_id = COALESCE(?, emp_id),
        name = COALESCE(?, name),
        company_id = COALESCE(?, company_id),
        company_name = COALESCE(?, company_name),
        annual_balance = COALESCE(?, annual_balance),
        current_balance = COALESCE(?, current_balance)
      WHERE id = ?
    `).run(emp_id, name, company_id, company_name, annual_balance, current_balance, id);

    const employee = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
    res.json(employee);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/employees/search/:query', authMiddleware, (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const searchTerm = `%${query.toLowerCase()}%`;
    const employees = db.prepare(`
      SELECT * FROM employees
      WHERE LOWER(name) LIKE ? OR LOWER(emp_id) LIKE ?
      ORDER BY created_at ASC
    `).all(searchTerm, searchTerm);
    res.json(employees);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/employees/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM employees WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/employees/company/:companyId', authMiddleware, (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const employees = db.prepare('SELECT * FROM employees WHERE company_id = ? ORDER BY created_at ASC').all(companyId);
    res.json(employees);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/transactions', authMiddleware, (req: Request, res: Response) => {
  try {
    const transactions = db.prepare('SELECT * FROM transactions ORDER BY date DESC').all();
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/transactions', authMiddleware, (req: Request, res: Response) => {
  try {
    const { employee_id, employee_name, employee_emp_id, company_name, amount, description, diagnosis, medical_leave_granted, mc_date_from, mc_date_to, balance_after } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO transactions (id, employee_id, employee_name, employee_emp_id, company_name, amount, description, diagnosis, medical_leave_granted, mc_date_from, mc_date_to, date, balance_after)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, employee_id, employee_name, employee_emp_id, company_name, amount, description, diagnosis, medical_leave_granted ? 1 : 0, mc_date_from, mc_date_to, now, balance_after);

    res.json({ id, employee_id, employee_name, employee_emp_id, company_name, amount, description, diagnosis, medical_leave_granted, mc_date_from, mc_date_to, date: now, balance_after });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/transactions/employee/:employeeId', authMiddleware, (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const transactions = db.prepare('SELECT * FROM transactions WHERE employee_id = ? ORDER BY date DESC').all(employeeId);
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/transactions/company/:companyId', authMiddleware, (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const transactions = db.prepare(`
      SELECT t.* FROM transactions t
      JOIN employees e ON t.employee_id = e.id
      WHERE e.company_id = ?
      ORDER BY t.date DESC
    `).all(companyId);
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/companies/:id', authMiddleware, (req: Request, res: Response) => {
  try {
    const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

if (isProduction) {
  const distPath = path.join(__dirname, '..', '..', '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});