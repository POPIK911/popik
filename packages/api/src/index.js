const API_URL = 'https://dummyjson.com/products';

export const DEFAULT_FILTERS = {
  search: 'phone',
  category: '',
  sort: 'rating-desc',
  onlyInStock: true,
};

const SELECT_FIELDS =
  'id,title,description,category,price,discountPercentage,rating,stock,brand,thumbnail';

export function buildProductsUrl(filters) {
  const hasCategory = Boolean(filters.category);
  const endpoint = hasCategory
    ? `${API_URL}/category/${filters.category}`
    : `${API_URL}/search`;

  const params = new URLSearchParams({
    limit: '12',
    select: SELECT_FIELDS,
  });

  if (!hasCategory) {
    params.set('q', filters.search.trim() || 'phone');
  }

  if (filters.sort) {
    const [sortBy, order] = filters.sort.split('-');
    params.set('sortBy', sortBy);
    params.set('order', order);
  }

  return `${endpoint}?${params.toString()}`;
}

export function productMatchesSearch(product, search) {
  const text = search.trim().toLowerCase();
  if (!text) return true;
  return [product.title, product.description, product.brand]
    .filter(Boolean)
    .some((v) => v.toLowerCase().includes(text));
}

export async function fetchProducts(filters, signal) {
  const response = await fetch(buildProductsUrl(filters), { signal });

  if (!response.ok) {
    throw new Error('Не получилось получить товары');
  }

  const data = await response.json();
  const results = Array.isArray(data.products) ? data.products : [];

  const prepared = results
    .filter((p) => productMatchesSearch(p, filters.search))
    .filter((p) => !filters.onlyInStock || p.stock > 0);

  return {
    products: prepared,
    total: prepared.length,
  };
}

export async function fetchProductById(id, signal) {
  const response = await fetch(`${API_URL}/${id}`, { signal });

  if (!response.ok) {
    throw new Error(`Продукт #${id} не найден`);
  }

  return response.json();
}

export async function fetchCategories() {
  const response = await fetch(`${API_URL}/category-list`);

  if (!response.ok) {
    throw new Error('Не удалось загрузить категории');
  }

  return response.json();
}
