export interface LoginResponse {
  id: string;
  email: string;
  name?: string;
  contactPhone?: string;
  role?: 'client' | 'manager' | 'admin';
}

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const LoginApi = {
  // вход пользователя
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Login failed: ${res.status} ${text}`);
    }

    const data = (await res.json()) as LoginResponse;
    return data;
  },

  // выход пользователя
  logout: async (): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Logout failed: ${res.status} ${text}`);
    }
  },
};