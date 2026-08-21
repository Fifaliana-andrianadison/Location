import { useState } from 'react'
import { assetUrl } from '../../utils/format.js'

export default function ImageGallery({ images = [], principale }) {
  const paths = images?.length > 0 ? images : principale ? [principale] : []
  const [actif, setActif] = useState(0)

  if (paths.length === 0) {
    return <div className="gallery-empty">Aucune photo disponible</div>
  }

  const courant = paths[Math.min(actif, paths.length - 1)]

  return (
    <div className="gallery-main">
      <div className="gallery-hero">
        <img src={assetUrl(courant)} alt="Photo du bien" />
      </div>
      {paths.length > 1 && (
        <div className="gallery-thumbs">
          {paths.map((p, i) => (
            <button
              key={i}
              type="button"
              className={`thumb ${i === actif ? 'active' : ''}`}
              onClick={() => setActif(i)}
            >
              <img src={assetUrl(p)} alt={`Photo ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}