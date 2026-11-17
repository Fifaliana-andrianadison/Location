/**
 * Carte d'un bien.
 * - Avec coordonnées : carte OpenStreetMap centrée avec marqueur.
 * - Sans coordonnées : carte recherchée à partir de l'adresse (adresse, quartier, ville, région),
 *   comme l'aperçu affiché dans le formulaire d'ajout du bien.
 */
export default function MapView({ latitude, longitude, localisation = null, className = '' }) {
  const lat = latitude != null && latitude !== '' ? Number(latitude) : null
  const lng = longitude != null && longitude !== '' ? Number(longitude) : null

  if (lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)) {
    const pad = 0.02
    const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - pad}%2C${lat - pad}%2C${lng + pad}%2C${lat + pad}&layer=mapnik&marker=${lat}%2C${lng}`
    return <iframe className={`map-frame ${className}`} src={src} title="Carte OpenStreetMap" loading="lazy" />
  }

  const adresse = [localisation?.adresse, localisation?.quartier, localisation?.ville, localisation?.region, 'Madagascar']
    .filter((v) => v && String(v).trim())
    .join(', ')

  if (!localisation?.ville && !localisation?.quartier && !localisation?.adresse) {
    return <div className="map-empty">Position non disponible pour ce bien.</div>
  }

  return (
    <>
      <iframe
        className={`map-frame ${className}`}
        src={`https://maps.google.com/maps?q=${encodeURIComponent(adresse)}&output=embed`}
        title="Carte du quartier"
        loading="lazy"
      />
      <p className="muted" style={{ fontSize: '0.72rem', margin: '0.4rem 0 0' }}>
        Position approximative : {adresse.replace(/, Madagascar$/, '')}
      </p>
    </>
  )
}
