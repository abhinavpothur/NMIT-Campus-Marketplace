import { User, Listing } from '../types/marketplace';

const TOKEN_KEY = 'nmit_auth_token';
const USER_KEY = 'nmit_auth_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveAuthSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function authHeaders(): HeadersInit {
  const token = getStoredToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  // Auth
  async register(data: {
    name: string;
    email: string;
    usn: string;
    branch: string;
    phone: string;
    hostelBlock?: string;
    password: string;
  }): Promise<{ token: string; user: User; message: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Registration failed');
    saveAuthSession(json.token, json.user);
    return json;
  },

  async login(identifier: string, password: string): Promise<{ token: string; user: User; message: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed');
    saveAuthSession(json.token, json.user);
    return json;
  },

  async quickLogin(userId: string): Promise<{ token: string; user: User; message: string }> {
    const res = await fetch('/api/auth/quick-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Quick login failed');
    saveAuthSession(json.token, json.user);
    return json;
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: authHeaders()
      });
    } catch (e) {
      console.warn('Logout request failed:', e);
    }
    clearAuthSession();
  },

  async getMe(): Promise<User | null> {
    const token = getStoredToken();
    if (!token) return null;
    try {
      const res = await fetch('/api/auth/me', { headers: authHeaders() });
      if (!res.ok) {
        clearAuthSession();
        return null;
      }
      const json = await res.json();
      saveAuthSession(token, json.user);
      return json.user;
    } catch {
      return getStoredUser();
    }
  },

  async getDemoUsers(): Promise<User[]> {
    const res = await fetch('/api/auth/demo-accounts');
    const json = await res.json();
    return json.demoUsers || [];
  },

  // Listings
  async getListings(params: {
    search?: string;
    category?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    sellerId?: string;
  } = {}): Promise<{ total: number; listings: Listing[] }> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.category && params.category !== 'All') query.set('category', params.category);
    if (params.status) query.set('status', params.status);
    if (params.minPrice) query.set('minPrice', params.minPrice.toString());
    if (params.maxPrice) query.set('maxPrice', params.maxPrice.toString());
    if (params.sort) query.set('sort', params.sort);
    if (params.sellerId) query.set('sellerId', params.sellerId);

    const res = await fetch(`/api/listings?${query.toString()}`);
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || 'Failed to fetch listings');
    }
    return res.json();
  },

  async getListing(id: string): Promise<Listing> {
    const res = await fetch(`/api/listings/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch listing details');
    return json.listing;
  },

  async createListing(data: {
    title: string;
    description: string;
    price: number;
    originalPrice?: number;
    category: string;
    condition: string;
    imageUrl: string;
    campusLocation?: string;
  }): Promise<Listing> {
    const res = await fetch('/api/listings', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create listing');
    return json.listing;
  },

  async updateListing(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      price: number;
      originalPrice?: number;
      category: string;
      condition: string;
      imageUrl: string;
      campusLocation?: string;
      status: 'active' | 'sold';
    }>
  ): Promise<Listing> {
    const res = await fetch(`/api/listings/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update listing');
    return json.listing;
  },

  async toggleSoldStatus(id: string, status?: 'active' | 'sold'): Promise<Listing> {
    const res = await fetch(`/api/listings/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update item status');
    return json.listing;
  },

  async deleteListing(id: string): Promise<void> {
    const res = await fetch(`/api/listings/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete listing');
  },

  // External APIs
  async verifyPincode(pincode: string = '560064') {
    const res = await fetch(`/api/external/pincode/${pincode}`);
    return res.json();
  },

  async searchBooks(query: string): Promise<Array<{ title: string; author: string; firstPublishYear?: number; coverUrl: string }>> {
    const res = await fetch(`/api/external/books?q=${encodeURIComponent(query)}`);
    const json = await res.json();
    return json.books || [];
  }
};
