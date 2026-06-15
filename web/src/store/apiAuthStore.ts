import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/api';
import type { UserRole } from '../services/api';
import { normalizeNzMobile, isValidNzMobile } from '../utils/nzPhone';

interface ApiAuthState {
  isAuthenticated: boolean;
  mobileNumber: string | null;
  userId: string | null;
  role: UserRole | null;
  isAgent: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  error: string | null;

  login: (mobileNumber: string, pin: string) => Promise<boolean | UserRole>;
  logout: () => void;
  /** Sync role from JWT (e.g. after page refresh) */
  syncRoleFromToken: () => void;
}

export const useApiAuthStore = create<ApiAuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      mobileNumber: null,
      userId: null,
      role: null,
      isAgent: false,
      isSuperAdmin: false,
      loading: false,
      error: null,

      login: async (mobileNumber: string, pin: string) => {
        set({ loading: true, error: null });
        try {
          const cleaned = normalizeNzMobile(mobileNumber);
          if (!isValidNzMobile(cleaned)) {
            set({ loading: false, error: 'Invalid mobile number format' });
            return false;
          }

          const response = await authApi.login(cleaned, pin);
          const rawRole = response.user.role;
          const role = (typeof rawRole === 'string' ? rawRole.toUpperCase() : rawRole) as UserRole;

          localStorage.setItem('auth_token', response.token);

          set({
            isAuthenticated: true,
            mobileNumber: cleaned,
            userId: response.user.id,
            role: role === 'SUPER_ADMIN' || role === 'AGENT' || role === 'PENDING' ? role : 'PENDING',
            isAgent: role === 'AGENT' || role === 'SUPER_ADMIN',
            isSuperAdmin: role === 'SUPER_ADMIN',
            loading: false,
            error: null,
          });

          return role;
        } catch (error: any) {
          set({ loading: false, error: error.message || 'Invalid mobile number or PIN' });
          return false;
        }
      },

      syncRoleFromToken: () => {
        const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const token = raw?.trim() || null;

        if (!token) {
          if (get().isAuthenticated) {
            set({ isAuthenticated: false, mobileNumber: null, userId: null, role: null, isAgent: false, isSuperAdmin: false });
          }
          return;
        }

        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const role = String(payload.role || '').toUpperCase() as UserRole;
          if (role !== 'SUPER_ADMIN' && role !== 'AGENT' && role !== 'PENDING') return;
          set({
            isAuthenticated: true,
            userId: typeof payload.id === 'string' ? payload.id : null,
            mobileNumber: typeof payload.mobileNumber === 'string' ? payload.mobileNumber : null,
            role,
            isAgent: role === 'AGENT' || role === 'SUPER_ADMIN',
            isSuperAdmin: role === 'SUPER_ADMIN',
          });
        } catch {
          localStorage.removeItem('auth_token');
          set({ isAuthenticated: false, mobileNumber: null, userId: null, role: null, isAgent: false, isSuperAdmin: false });
        }
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        set({ isAuthenticated: false, mobileNumber: null, userId: null, role: null, isAgent: false, isSuperAdmin: false, error: null });
      },
    }),
    {
      name: 'propertyreach-api-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        mobileNumber: state.mobileNumber,
        userId: state.userId,
        role: state.role,
        isAgent: state.isAgent,
        isSuperAdmin: state.isSuperAdmin,
      }),
      onRehydrateStorage: () => () => {
        queueMicrotask(() => {
          useApiAuthStore.getState().syncRoleFromToken();
        });
      },
    }
  )
);
