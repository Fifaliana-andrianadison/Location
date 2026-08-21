export default function MapView({ latitude, longitude, className = '' }) {
  if (latitude == null || longitude == null) {
    return <div className="map-empty">Position non disponible pour ce bien.</div>
  }

  const pad = 0.02
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - pad}%2C${latitude - pad}%2C${longitude + pad}%2C${latitude + pad}&layer=mapnik&marker=${latitude}%2C${longitude}`

  return (
    <iframe
      className={`map-frame ${className}`}
      src={src}
      title="Carte OpenStreetMap"
      loading="lazy"
    />
  )
}