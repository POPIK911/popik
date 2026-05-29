import { useState } from 'react';
import styles from './Admin.module.css';
import { observer, useStores } from './observer.jsx';

const AuthView = observer(function AuthView() {
  const { adminStore } = useStores();
  const [mode, setMode] = useState('register'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    if (!email || !password) return;
    if (mode === 'register') {
      adminStore.register({ email, password });
    } else {
      adminStore.login({ email, password });
    }
  };

  return (
    <div className={styles.authWrap}>
      <div className={styles.authCard}>
        <div className={styles.authLogo}>
          <span className={styles.authLogoText}>Mini Store</span>
          <span className={styles.badge}>Admin</span>
        </div>
        <h2 className={styles.authTitle}>
          {mode === 'register' ? 'Регистрация' : 'Вход'}
        </h2>
        <p className={styles.authSub}>
          {mode === 'register'
            ? 'Создайте аккаунт редактора'
            : 'Войдите в свой аккаунт'}
        </p>

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            placeholder="editor@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Пароль</label>
          <input
            className={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {adminStore.authError && (
          <p className={styles.errorMsg}>{adminStore.authError}</p>
        )}

        <button
          className={styles.btnPrimary}
          onClick={handleSubmit}
          disabled={adminStore.isAuthLoading}
        >
          {adminStore.isAuthLoading
            ? 'Загрузка…'
            : mode === 'register' ? 'Зарегистрироваться' : 'Войти'}
        </button>

        <p className={styles.authSwitch}>
          {mode === 'register' ? 'Уже есть аккаунт? ' : 'Нет аккаунта? '}
          <button
            className={styles.linkBtn}
            onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); adminStore.authError = ''; }}
          >
            {mode === 'register' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </p>
      </div>
    </div>
  );
});

const CATEGORY_LABELS = {
  games: 'Игры',
  tools: 'Утилиты',
  education: 'Образование',
  entertainment: 'Развлечения',
  other: 'Другое',
};

const ListView = observer(function ListView() {
  const { adminStore } = useStores();
  const { apps, isLoadingApps, appsError } = adminStore;

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Мои приложения</h2>
          <p className={styles.panelSub}>
            {isLoadingApps ? 'Загрузка…' : `${apps.length} приложений`}
          </p>
        </div>
        <button
          className={styles.btnPrimary}
          onClick={() => adminStore.setView('create')}
        >
          + Создать приложение
        </button>
      </div>

      {appsError && <p className={styles.errorMsg}>{appsError}</p>}

      {isLoadingApps ? (
        <div className={styles.stateBox}>⏳ Загрузка приложений…</div>
      ) : apps.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📦</span>
          <p>У вас пока нет приложений</p>
          <button
            className={styles.btnPrimary}
            onClick={() => adminStore.setView('create')}
          >
            Создать первое
          </button>
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Название</th>
              <th>Slug</th>
              <th>Категория</th>
              <th>Описание</th>
              <th>Создано</th>
            </tr>
          </thead>
          <tbody>
            {apps.map(app => (
              <tr key={app.id}>
                <td><strong>{app.title}</strong></td>
                <td><code className={styles.slug}>{app.slug}</code></td>
                <td>{CATEGORY_LABELS[app.categoryId] || app.categoryId || '—'}</td>
                <td className={styles.descCell}>{app.description || '—'}</td>
                <td className={styles.dateCell}>
                  {new Date(app.createdAt).toLocaleDateString('ru-RU')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
});

const CreateView = observer(function CreateView() {
  const { adminStore } = useStores();
  const { form, isCreating, createError, createSuccess } = adminStore;

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <button
            className={styles.backBtn}
            onClick={() => adminStore.setView('list')}
          >
            ← Назад к списку
          </button>
          <h2 className={styles.panelTitle}>Новое приложение</h2>
        </div>
      </div>

      {createSuccess && (
        <div className={styles.successMsg}>
          ✅ Приложение создано! Переходим к списку…
        </div>
      )}

      <div className={styles.form}>
        <div className={styles.formRow}>
          <div className={styles.field}>
            <label className={styles.label}>Название *</label>
            <input
              className={styles.input}
              placeholder="Моё приложение"
              value={form.title}
              onChange={e => adminStore.updateForm('title', e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Slug (URL-идентификатор)</label>
            <input
              className={styles.input}
              placeholder="moe-prilozhenie"
              value={form.slug}
              onChange={e => adminStore.updateForm('slug', e.target.value)}
            />
            <span className={styles.hint}>Генерируется автоматически из названия</span>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Описание</label>
          <textarea
            className={styles.textarea}
            placeholder="Краткое описание приложения…"
            rows={3}
            value={form.description}
            onChange={e => adminStore.updateForm('description', e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Категория</label>
          <select
            className={styles.input}
            value={form.categoryId}
            onChange={e => adminStore.updateForm('categoryId', e.target.value)}
          >
            <option value="">Выберите категорию</option>
            <option value="games">Игры</option>
            <option value="tools">Утилиты</option>
            <option value="education">Образование</option>
            <option value="entertainment">Развлечения</option>
            <option value="other">Другое</option>
          </select>
        </div>

        {createError && <p className={styles.errorMsg}>{createError}</p>}

        <div className={styles.formActions}>
          <button
            className={styles.btnSecondary}
            onClick={() => adminStore.setView('list')}
            disabled={isCreating}
          >
            Отмена
          </button>
          <button
            className={styles.btnPrimary}
            onClick={() => adminStore.createApp()}
            disabled={isCreating || !form.title}
          >
            {isCreating ? 'Создание…' : 'Создать приложение'}
          </button>
        </div>
      </div>
    </section>
  );
});

const App = observer(function App() {
  const { adminStore } = useStores();
  const { user, view } = adminStore;

  
  if (!user) {
    return <AuthView />;
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1>Mini Store</h1>
        <span className={styles.badge}>Admin</span>
        <nav className={styles.nav}>
          <button
            className={view === 'list' ? styles.navActive : styles.navBtn}
            onClick={() => { adminStore.setView('list'); adminStore.loadApps(); }}
          >
            Список приложений
          </button>
          <button
            className={view === 'create' ? styles.navActive : styles.navBtn}
            onClick={() => adminStore.setView('create')}
          >
            + Создать
          </button>
        </nav>
        <div className={styles.userInfo}>
          <span className={styles.userEmail}>{user.email}</span>
          <span className={styles.roleBadge}>{user.role}</span>
          <button className={styles.logoutBtn} onClick={() => adminStore.logout()}>
            Выйти
          </button>
        </div>
      </header>

      <div className={styles.content}>
        {view === 'list' && <ListView />}
        {view === 'create' && <CreateView />}
      </div>
    </div>
  );
});

export default App;
