/**
 * Centraliserad API service för alla HTTP-anrop
 * Hanterar autentisering via HttpOnly cookies, error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiService {
  private static getHeaders(includeContentType = true): HeadersInit {
    const headers: HeadersInit = {};

    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }

  private static handleTokenExpired() {
    if (typeof window !== 'undefined') {
      window.location.href = '/logga-in';
    }
  }

  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getHeaders(true);

    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: { ...headers, ...options.headers },
      });

      // Hantera 401 Unauthorized
      if (response.status === 401) {
        this.handleTokenExpired();
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP Error: ${response.status}`);
      }

      // Vissa endpoints returnerar inte JSON
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      }
      return {} as T;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth endpoints
  static async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  static async signup(email: string, password: string, confirmPassword: string) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, confirmPassword }),
    });
  }

  static async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Jobs endpoints
  static async getAllJobs() {
    return this.request('/jobs');
  }

  static async searchJobs(query: string) {
    return this.request(`/jobs?q=${encodeURIComponent(query)}`);
  }

  static async saveJob(jobId: number) {
    return this.request(`/jobs/${jobId}/save`, {
      method: 'POST',
    });
  }

  static async unsaveJob(jobId: number) {
    return this.request(`/jobs/${jobId}/unsave`, {
      method: 'POST',
    });
  }

  static async createJob(formData: FormData) {
    const url = `${API_BASE_URL}/jobs`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        body: formData,
        // Skicka inte Content-Type header - browser sätter det automatiskt med boundary
      });

      if (response.status === 401) {
        this.handleTokenExpired();
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create job: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create job error:', error);
      throw error;
    }
  }

  // User endpoints
  static async getUserData() {
    return this.request('/user');
  }

  static async getSavedJobs() {
    return this.request('/user/saved-jobs');
  }
}

export default ApiService;
