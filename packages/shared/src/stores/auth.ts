import { defineStore } from "pinia";
import { authApi } from "../api/modules";
import { TOKEN_KEY, USER_KEY, clearToken, getApiBase, setApiBase, setToken } from "../api/client";
import type { UserMe, UserRole } from "../types";

function readUser(): UserMe | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserMe;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || "",
    user: readUser(),
    apiBase: getApiBase(),
    devCode: "",
    loading: false,
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token && state.user),
    role: (state): UserRole | "" => state.user?.role || "",
  },
  actions: {
    saveApiBase(baseUrl: string) {
      setApiBase(baseUrl);
      this.apiBase = getApiBase();
    },
    async sendSms(phone: string) {
      this.loading = true;
      try {
        const result = await authApi.sendSms(phone);
        this.devCode = result.devCode || "";
        return result;
      } finally {
        this.loading = false;
      }
    },
    async login(phone: string, code: string) {
      this.loading = true;
      try {
        const result = await authApi.login(phone, code);
        if (!result.accessToken) {
          throw new Error("登录成功但响应中没有 access_token，请检查后端返回格式");
        }
        this.token = result.accessToken;
        this.user = result.user;
        setToken(result.accessToken);
        localStorage.setItem(USER_KEY, JSON.stringify(result.user));
        return result.user;
      } finally {
        this.loading = false;
      }
    },
    async adminLogin(username: string, password: string) {
      this.loading = true;
      try {
        const result = await authApi.adminLogin(username, password);
        if (!result.accessToken) {
          throw new Error("登录成功但响应中没有 access_token，请检查后端返回格式");
        }
        this.token = result.accessToken;
        this.user = result.user;
        setToken(result.accessToken);
        localStorage.setItem(USER_KEY, JSON.stringify(result.user));
        return result.user;
      } finally {
        this.loading = false;
      }
    },
    async loadMe() {
      if (!this.token) return null;
      const user = await authApi.me();
      this.user = user;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    },
    async updateProfile(payload: Partial<UserMe>) {
      const user = await authApi.updateProfile(payload);
      this.user = user;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    },
    async logout() {
      try {
        if (this.token) await authApi.logout();
      } finally {
        this.token = "";
        this.user = null;
        clearToken();
      }
    },
    canAccess(roles: UserRole[]) {
      return Boolean(this.user && roles.includes(this.user.role));
    },
  },
});
