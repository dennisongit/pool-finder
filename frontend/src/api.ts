const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Pool {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  created_at: string;
  user_id: number;
}

export interface User {
  id: number;
  email: string;
  username: string;
}

export interface CreatePoolData {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: getAuthHeaders(),
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(response.status, errorText || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export async function login(data: LoginData): Promise<AuthResponse> {
  const formData = new FormData();
  formData.append('username', data.email);
  formData.append('password', data.password);

  const response = await fetch(`${API_BASE_URL}/auth/token`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(response.status, errorText || 'Login failed');
  }

  const result = await response.json();
  localStorage.setItem('access_token', result.access_token);
  return result;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const result = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  localStorage.setItem('access_token', result.access_token);
  return result;
}

export function logout(): void {
  localStorage.removeItem('access_token');
}

export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>('/auth/me');
}

// Pools API
export async function getPools(): Promise<Pool[]> {
  return apiRequest<Pool[]>('/pools');
}

export async function createPool(data: CreatePoolData): Promise<Pool> {
  return apiRequest<Pool>('/pools', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getPool(id: number): Promise<Pool> {
  return apiRequest<Pool>(`/pools/${id}`);
}

export async function updatePool(id: number, data: Partial<CreatePoolData>): Promise<Pool> {
  return apiRequest<Pool>(`/pools/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deletePool(id: number): Promise<void> {
  return apiRequest<void>(`/pools/${id}`, {
    method: 'DELETE',
  });
}

export { ApiError };
