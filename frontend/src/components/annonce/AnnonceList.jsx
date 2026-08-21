import { ChevronLeft, ChevronRight } from 'lucide-react'
import AnnonceCard from './AnnonceCard.jsx'

export default function AnnonceList({ data, meta, loading, error, onPageChange }) {
  if (loading) {
    return (
      <div className="grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="annonce-card skeleton">
            <div className="skeleton-img" />
            <div className="skeleton-lines">
              <span style={{ width: '70%' }} />
              <span style={{ width: '45%' }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="alert-danger">{error}</div>
  }

  if (!data || data.length === 0) {
    return (
      <div className="card empty">
        Aucun bien ne correspond à votre recherche. Essayez d'élargir votre budget ou vos critères.
      </div>
    )
  }

  return (
    <>
      <div className="grid annonce-grid">
        {data.map((annonce) => (
          <AnnonceCard key={annonce.id} annonce={annonce} />
        ))}
      </div>
      {meta && meta.last_page > 1 && (
        <div className="pagination">
          <button
            className="btn small secondary"
            disabled={meta.current_page <= 1}
            onClick={() => onPageChange(meta.current_page - 1)}
          >
            <ChevronLeft size={14} /> Précédent
          </button>
          <span className="muted">
            Page {meta.current_page} / {meta.last_page} — {meta.total} bien(s)
          </span>
          <button
            className="btn small secondary"
            disabled={meta.current_page >= meta.last_page}
            onClick={() => onPageChange(meta.current_page + 1)}
          >
            Suivant <ChevronRight size={14} />
          </button>
        </div>
      )}
    </>
  )
}