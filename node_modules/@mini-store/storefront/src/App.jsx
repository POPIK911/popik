import { useEffect } from 'react';
import styles from './App.module.css';
import { AppCard } from './AppCard';
import { observer, useStores } from './observer.jsx';

// ---------- вспомогательные компоненты состояний ----------

function Loader() {
  return (
    <div className={styles.stateBox}>
      <div className={styles.spinner} aria-hidden="true" />
      <p>Загрузка товаров…</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className={styles.stateBox}>
      <p className={styles.stateIcon}>⚠️</p>
      <p className={styles.stateText}>{message}</p>
      <button onClick={onRetry}>Попробовать снова</button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className={styles.stateBox}>
      <p className={styles.stateIcon}>🔍</p>
      <p className={styles.stateText}>По этому запросу ничего не нашлось.</p>
      <p className={styles.stateHint}>Попробуйте изменить поисковый запрос или сбросить фильтры.</p>
    </div>
  );
}

// ---------- страница ----------

const App = observer(function App() {
  const { productsStore } = useStores();

  // загружаем при первом рендере
  useEffect(() => {
    productsStore.loadProducts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (event) => {
    event.preventDefault();
    productsStore.submitFilters();
  };

  // ---- логика отображения по приоритету из презентации ----
  const renderContent = () => {
    if (productsStore.isLoading) {
      return <Loader />;
    }
    if (productsStore.error) {
      return (
        <ErrorState
          message={productsStore.error}
          onRetry={() => productsStore.loadProducts()}
        />
      );
    }
    if (productsStore.products.length === 0) {
      return <EmptyState />;
    }
    return (
      <div className={styles.grid}>
        {productsStore.products.map((product) => (
          <AppCard
            key={product.id}
            title={product.title}
            description={product.description}
            category={product.category}
            price={product.price}
            discount={product.discountPercentage}
            rating={product.rating}
            stock={product.stock}
            brand={product.brand}
            image={product.thumbnail}
            isLocal={product.isLocal}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>DummyJSON Products API</p>
          <h1>Каталог товаров</h1>
          <p className={styles.subtitle}>
            Небольшой React-проект: товары загружаются с сервера, а фильтры собирают новый запрос.
          </p>
        </div>
      </header>

      <form className={styles.filters} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Что ищем</span>
          <input
            type="search"
            value={productsStore.filters.search}
            onChange={(e) => productsStore.changeFilter('search', e.currentTarget.value)}
            placeholder="Например: phone, laptop, perfume"
          />
        </label>

        <label className={styles.field}>
          <span>Категория</span>
          <select
            value={productsStore.filters.category}
            onChange={(e) => productsStore.changeFilter('category', e.currentTarget.value)}
          >
            <option value="">Любая</option>
            <option value="smartphones">Смартфоны</option>
            <option value="laptops">Ноутбуки</option>
            <option value="mobile-accessories">Аксессуары</option>
            <option value="beauty">Красота</option>
            <option value="groceries">Продукты</option>
            <option value="home-decoration">Для дома</option>
          </select>
        </label>

        <label className={styles.field}>
          <span>Сортировка</span>
          <select
            value={productsStore.filters.sort}
            onChange={(e) => productsStore.changeFilter('sort', e.currentTarget.value)}
          >
            <option value="rating-desc">Рейтинг выше</option>
            <option value="price-asc">Цена ниже</option>
            <option value="price-desc">Цена выше</option>
            <option value="title-asc">По названию</option>
          </select>
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={productsStore.filters.onlyInStock}
            onChange={(e) => productsStore.changeFilter('onlyInStock', e.currentTarget.checked)}
          />
          <span>Только в наличии</span>
        </label>

        <div className={styles.actions}>
          <button type="submit">Поиск</button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => productsStore.resetFilters()}
          >
            Сбросить
          </button>
        </div>
      </form>

      <section className={styles.statusLine}>
        {!productsStore.isLoading && !productsStore.error && (
          <>
            <span>Всего: {productsStore.total.toLocaleString('ru-RU')}</span>
            {productsStore.products.filter(p => p.isLocal).length > 0 && (
              <span style={{marginLeft: 16, color: '#3182ce', fontWeight: 600}}>📦 Моих: {productsStore.products.filter(p => p.isLocal).length}</span>
            )}
          </>
        )}
      </section>

      <main>{renderContent()}</main>
    </div>
  );
});

export default App;
