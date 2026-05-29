import { makeAutoObservable } from './mobx-lite.js';

function localGet(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
function localSet(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function apiRegister({ email, password }) {
  await delay(400);
  const users = localGet('ms_users') || {};
  if (users[email]) throw new Error('Пользователь уже существует');
  const user = { email, password, role: 'editor', id: Date.now() };
  users[email] = user;
  localSet('ms_users', users);
  return { success: true, user: { role: 'editor', email } };
}

async function apiLogin({ email, password }) {
  await delay(400);
  const users = localGet('ms_users') || {};
  const user = users[email];
  if (!user || user.password !== password) throw new Error('Неверный email или пароль');
  const token = btoa(`${email}:${Date.now()}`);
  return { token, user: { email, role: user.role, id: user.id } };
}

class AdminStore {
  user = null;
  token = null;
  authError = '';
  isAuthLoading = false;

  view = 'register';

  apps = [];
  isLoadingApps = false;
  appsError = '';

  form = { title: '', slug: '', description: '', categoryId: '' };
  isCreating = false;
  createError = '';
  createSuccess = false;

  constructor() {
    const savedToken = localStorage.getItem('ms_token');
    const savedUser = localGet('ms_user');
    if (savedToken && savedUser) {
      this.token = savedToken;
      this.user = savedUser;
      this.view = 'list';
    }
    return makeAutoObservable(this);
  }

  setView(v) { this.view = v; }

  async register({ email, password }) {
    this.isAuthLoading = true;
    this.authError = '';
    try {
      await apiRegister({ email, password });
      await this._doLogin({ email, password });
    } catch (e) {
      this.authError = e.message;
    } finally {
      this.isAuthLoading = false;
    }
  }

  async login({ email, password }) {
    this.isAuthLoading = true;
    this.authError = '';
    try {
      await this._doLogin({ email, password });
    } catch (e) {
      this.authError = e.message;
    } finally {
      this.isAuthLoading = false;
    }
  }

  async _doLogin({ email, password }) {
    const { token, user } = await apiLogin({ email, password });
    this.token = token;
    this.user = user;
    localStorage.setItem('ms_token', token);
    localSet('ms_user', user);
    this.view = 'list';
    await this.loadApps();
  }

  logout() {
    this.token = null;
    this.user = null;
    this.apps = [];
    this.view = 'register';
    localStorage.removeItem('ms_token');
    localStorage.removeItem('ms_user');
  }

  async loadApps() {
    this.isLoadingApps = true;
    this.appsError = '';
    try {
      const res = await fetch('/api/apps');
      if (!res.ok) throw new Error('Ошибка загрузки');
      const { items } = await res.json();
      this.apps = items;
    } catch (e) {
      this.appsError = e.message;
    } finally {
      this.isLoadingApps = false;
    }
  }

  updateForm(field, value) {
    this.form = { ...this.form, [field]: value };
    if (field === 'title') {
      this.form = {
        ...this.form,
        slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      };
    }
  }

  async createApp() {
    this.isCreating = true;
    this.createError = '';
    this.createSuccess = false;
    try {
      const res = await fetch('/api/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.form),
      });
      if (!res.ok) throw new Error('Ошибка создания');
      this.createSuccess = true;
      this.form = { title: '', slug: '', description: '', categoryId: '' };
      await this.loadApps();
      setTimeout(() => {
        this.createSuccess = false;
        this.view = 'list';
      }, 1500);
    } catch (e) {
      this.createError = e.message;
    } finally {
      this.isCreating = false;
    }
  }
}

export const adminStore = new AdminStore();
