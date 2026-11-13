import { useState } from 'react'
import { annonceImages } from '../../utils/format.js'

export default function ImageGallery({ images = [], principale, type, seed = 0 }) {
  const paths = annonceImages({ images, image_principale: principale, type, id: seed })
  const [actif, setActif] = useState(0)

  const courant = paths[Math.min(actif, paths.length - 1)]

  return (
    <div className="sl-gallery">
      <div className="sl-gallery-hero">
        <img src={courant} alt="Photo du bien" />
        <span className="sl-card-photos">{paths.length} photos</span>
      </div>
      {paths.length > 1 && (
        <div className="sl-gallery-thumbs">
          {paths.map((p, i) => (
            <button
              key={i}
              type="button"
              className={`sl-thumb ${i === actif ? 'active' : ''}`}
              onClick={() => setActif(i)}
            >
              <img src={p} alt={`Photo ${i + 1}`} loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
