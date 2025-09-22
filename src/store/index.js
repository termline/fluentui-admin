// 示例：全局状态管理（可用 Redux、Zustand 等）
import { create } from 'zustand';

const STORAGE_KEY = 'app_user';
let initialUser = null;
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) initialUser = JSON.parse(raw);
} catch (e) {
  // ignore
}

const useGlobalStore = create((set) => ({
  user: initialUser,
  setUser: (user) => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* ignore */ }
    set({ user });
  },
}));

export default useGlobalStore;
