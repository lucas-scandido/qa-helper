import type { ProductData } from '../../../types'
import styles from './BugStep.module.css'

interface ProductContextCardProps {
  product: ProductData
  onEdit: () => void
}

export function ProductContextCard({ product, onEdit }: ProductContextCardProps) {
  const modulosCount = Object.keys(product.modulos).length

  return (
    <div className={styles.productSuccessBox}>
      <div className={styles.productSuccessHeader}>
        <div className={styles.productSuccessIcon}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span className={styles.productSuccessTitle}>Produto identificado</span>
      </div>
      <div className={styles.productSuccessBody}>
        <span className={styles.productSuccessSummary}>
          {product.nome}
          <span className={styles.productSuccessDot}>·</span>
          {product.ambiente.join(', ')}
          {modulosCount > 0 && (
            <><span className={styles.productSuccessDot}>·</span>{modulosCount} módulo{modulosCount !== 1 ? 's' : ''}</>
          )}
        </span>
        <button className={styles.productEditBtn} onClick={onEdit}>
          Editar
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
