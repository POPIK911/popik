# Mini Store — Монорепозиторий

Проект реструктурирован в монорепу по паттерну из лекции (PP 09).

## Структура

```
mini-store/
├── apps/
│   ├── storefront/        # Витрина (@mini-store/storefront, порт 3000)
│   └── admin/             # Админка (@mini-store/admin, порт 3001)
├── packages/
│   └── api/               # Переиспользуемый API-слой (@mini-store/api)
├── package.json           # Корневой — workspaces + линтеры
├── .prettierrc            # Форматирование
├── eslint.config.js       # ESLint (flat config)
└── .stylelintrc.json      # Stylelint для CSS
```

## Запуск

```bash
# Установить все зависимости (из корня)
npm install

# Запустить витрину (порт 3000)
npm run dev:storefront

# Запустить админку (порт 3001)
npm run dev:admin
```

## Сборка

```bash
npm run build:storefront
npm run build:admin
```

## Линтеры

```bash
# Проверить все ошибки
npm run lint

# Исправить автоматически
npm run fix
```

## Архитектура

### packages/api
Единый источник правды для работы с DummyJSON Products API:
- `fetchProducts(filters, signal)` — список товаров с фильтрацией
- `fetchProductById(id, signal)` — один товар по id
- `fetchCategories()` — список категорий
- `buildProductsUrl(filters)` — построение URL
- `productMatchesSearch(product, search)` — клиентская фильтрация
- `DEFAULT_FILTERS` — дефолтные значения фильтров

### apps/storefront
Публичная витрина с поиском, фильтрами и карточками товаров.  
Использует `@mini-store/api` через `ProductsStore`.

### apps/admin
Внутренняя панель управления с таблицей товаров и детальным просмотром.  
Использует тот же `@mini-store/api` через `AdminStore`.

### Паттерн наблюдателя (mobx-lite)
Самодельная реализация реактивности через `Proxy` + `useSyncExternalStore`.  
API намеренно совпадает с MobX: `makeAutoObservable`, `observer`, `useStores`.
