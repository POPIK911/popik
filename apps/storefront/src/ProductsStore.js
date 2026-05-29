import { makeAutoObservable } from './mobx-lite.js';
import { fetchProducts, DEFAULT_FILTERS } from '@mini-store/api';

export const initialFilters = { ...DEFAULT_FILTERS };

async function getLocalApps() {
  try {
    const res = await fetch('/api/apps');
    if (!res.ok) return [];
    const { items } = await res.json();
    return items.map(app => ({
      id: `local_${app.id}`,
      title: app.title,
      description: app.description || '',
      category: app.categoryId || 'other',
      price: 0,
      discountPercentage: 0,
      rating: 0,
      stock: 1,
      brand: 'Мои приложения',
      thumbnail: null,
      isLocal: true,
    }));
  } catch {
    return [];
  }
}

class ProductsStore {
  products = [];
  total = 0;
  isLoading = false;
  error = '';

  filters = { ...initialFilters };
  requestFilters = { ...initialFilters };

  constructor() {
    const self = makeAutoObservable(this);
    self._controller = null;
    return self;
  }

  changeFilter(name, value) {
    this.filters = { ...this.filters, [name]: value };
  }

  submitFilters() {
    this.requestFilters = { ...this.filters };
    this.loadProducts();
  }

  resetFilters() {
    this.filters = { ...initialFilters };
    this.requestFilters = { ...initialFilters };
    this.loadProducts();
  }

  async loadProducts() {
    if (this._controller) {
      this._controller.abort();
    }
    this._controller = new AbortController();

    this.isLoading = true;
    this.error = '';

    try {
      const [{ products, total }, localApps] = await Promise.all([
        fetchProducts(this.requestFilters, this._controller.signal),
        getLocalApps(),
      ]);

      const search = this.requestFilters.search.trim().toLowerCase();
      const filteredLocal = localApps.filter(app =>
        search
          ? app.title.toLowerCase().includes(search) ||
            app.description.toLowerCase().includes(search)
          : true,
      );

      this.products = [...filteredLocal, ...products];
      this.total = total + filteredLocal.length;
    } catch (err) {
      if (err.name !== 'AbortError') {
        this.error = 'API не ответил. Попробуйте изменить запрос или обновить страницу.';
        const localApps = await getLocalApps();
        this.products = localApps;
        this.total = localApps.length;
      }
    } finally {
      this.isLoading = false;
    }
  }
}

export const productsStore = new ProductsStore();
