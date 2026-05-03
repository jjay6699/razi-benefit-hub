const API_BASE = 'http://localhost:3001/api';

interface RequestOptions {
  method?: string;
  body?: any;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body } = options;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const session = localStorage.getItem('razi_auth_session');
  if (session) {
    const parsed = JSON.parse(session);
    headers['Authorization'] = `Bearer ${parsed.accessToken}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    signUp: (email: string, password: string, fullName: string, icNumber?: string, phoneNumber?: string) =>
      request<{ user: { id: string; email: string }; error: any }>('/auth/signup', {
        method: 'POST',
        body: { email, password, fullName, icNumber, phoneNumber },
      }),
    signIn: (email: string, password: string) =>
      request<{ user: { id: string; email: string }; accessToken: string; error: any }>('/auth/signin', {
        method: 'POST',
        body: { email, password },
      }),
    signOut: () => request('/auth/signout', { method: 'POST' }),
  },
  profiles: {
    getAll: () => request('/profiles'),
    getByUserId: (userId: string) => request(`/profiles/${userId}`),
    update: (userId: string, updates: any) => request(`/profiles/${userId}`, {
      method: 'PATCH',
      body: updates,
    }),
  },
  companies: {
    getAll: () => request('/companies'),
    getById: (id: string) => request(`/companies/${id}`),
    create: (name: string) => request<{ id: string; name: string; created_at: string }>('/companies', {
      method: 'POST',
      body: { name },
    }),
    delete: (id: string) => request(`/companies/${id}`, { method: 'DELETE' }),
  },
  employees: {
    getAll: () => request('/employees'),
    getById: (id: string) => request(`/employees/${id}`),
    create: (employee: any) => request('/employees', {
      method: 'POST',
      body: employee,
    }),
    update: (id: string, updates: any) => request(`/employees/${id}`, {
      method: 'PATCH',
      body: updates,
    }),
    search: (query: string) => request(`/employees/search/${encodeURIComponent(query)}`),
    delete: (id: string) => request(`/employees/${id}`, { method: 'DELETE' }),
    getByCompany: (companyId: string) => request(`/employees/company/${companyId}`),
  },
  transactions: {
    getAll: () => request('/transactions'),
    create: (transaction: any) => request('/transactions', {
      method: 'POST',
      body: transaction,
    }),
    getByEmployee: (employeeId: string) => request(`/transactions/employee/${employeeId}`),
    getByCompany: (companyId: string) => request(`/transactions/company/${companyId}`),
  },
};