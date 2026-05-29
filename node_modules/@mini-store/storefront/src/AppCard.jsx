import styles from './AppCard.module.css';

function shortText(value, fallback) {
  if (!value) return fallback;
  return value.length > 90 ? `${value.slice(0, 90)}...` : value;
}

export function AppCard({ title, description, category, price, discount, rating, stock, brand, image, isLocal }) {
  return (
    <article className={`${styles.card} ${isLocal ? styles.localCard : ''}`}>
      <div className={styles.picture}>
        {image ? (
          <img src={image} alt={title} />
        ) : (
          <span className={styles.noImage}>📦</span>
        )}
        {isLocal && <span className={styles.localBadge}>Моё</span>}
      </div>

      <div className={styles.content}>
        <p className={styles.category}>{category}</p>
        <h2>{title}</h2>
        <p className={styles.description}>{shortText(description, 'Описание не указано')}</p>
      </div>

      <dl className={styles.info}>
        <div>
          <dt>Цена</dt>
          <dd>{isLocal ? '—' : `$${price}`}</dd>
        </div>
        <div>
          <dt>Рейтинг</dt>
          <dd>{isLocal ? '—' : rating}</dd>
        </div>
        <div>
          <dt>Склад</dt>
          <dd>{isLocal ? '—' : stock}</dd>
        </div>
      </dl>

      <div className={styles.footer}>
        <span>{brand || 'Без бренда'}</span>
        {!isLocal && <b>-{Math.round(discount || 0)}%</b>}
      </div>
    </article>
  );
}
