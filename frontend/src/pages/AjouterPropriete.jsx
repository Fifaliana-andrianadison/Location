import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Save, ImagePlus, X } from 'lucide-react'
import { createPropriete, getPropriete, updatePropriete } from '../api/proprieteApi.js'
import { assetUrl } from '../utils/format.js'

const VIDES = {
  type: '',
  mode: 'location',
  titre: '',
  description: '',
  prix: '',
  type_loyer: 'mensuel',
  adresse: '',
  quartier: '',
  ville: '',
  region: '',
  latitude: '',
  longitude: '',
  nb_etages: '',
  nb_pieces: '',
  nb_chambres: '',
  nb_salles_bain: '',
  superficie: '',
  meuble: false,
  titre_foncier: '',
}

export default function AjouterPropriete() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const editId = params.get('id')
  const estEdition = Boolean(editId)

  const [form, setForm] = useState(VIDES)
  const [images, setImages] = useState([])
  const [anciennesImages, setAnciennesImages] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mapLink, setMapLink] = useState('')

  const extractCoords = (url) => {
    if (!url) return null
    const m = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (m) return { lat: m[1], lng: m[2] }
    const m2 = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (m2) return { lat: m2[1], lng: m2[2] }
    return null
  }

  const coords = extractCoords(mapLink) || (form.latitude && form.longitude ? { lat: form.latitude, lng: form.longitude } : null)
  const mapQuery = coords ? `${coords.lat},${coords.lng}` : [form.quartier, form.ville].filter(Boolean).join(' ')

  useEffect(() => {
    if (!editId) return
    setLoading(true)
    getPropriete(editId)
      .then(({ data }) => {
        setForm({
          type: data.type,
          mode: data.mode,
          titre: data.titre ?? '',
          description: data.description ?? '',
          prix: data.prix ?? '',
          type_loyer: data.type_loyer ?? 'mensuel',
          adresse: data.localisation?.adresse ?? '',
          quartier: data.localisation?.quartier ?? '',
          ville: data.localisation?.ville ?? '',
          region: data.localisation?.region ?? '',
          latitude: data.localisation?.latitude ?? '',
          longitude: data.localisation?.longitude ?? '',
          nb_etages: data.maison?.nb_etages ?? '',
          nb_pieces: data.appartements?.[0]?.nb_pieces ?? '',
          nb_chambres: data.maison?.nb_chambres ?? data.appartements?.[0]?.nb_chambres ?? '',
          nb_salles_bain: data.maison?.nb_salles_bain ?? data.appartements?.[0]?.nb_salles_bain ?? '',
          superficie: data.maison?.superficie ?? data.appartements?.[0]?.superficie ?? data.terrain?.superficie ?? '',
          meuble: Boolean(data.maison?.meuble ?? data.appartements?.[0]?.meuble),
          titre_foncier: data.terrain?.titre_foncier ?? '',
        })
        setAnciennesImages(data.images ?? [])
      })
      .catch(() => setError('Impossible de charger cette propriété.'))
      .finally(() => setLoading(false))
  }, [editId])

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [k]: v }))
  }

  const addImages = (e) => {
    setImages((prev) => [...prev, ...Array.from(e.target.files || [])].slice(0, 10))
    e.target.value = ''
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const fd = new FormData()
    for (const [k, v] of Object.entries(form)) {
      if (v === '' || v === null) continue
      fd.append(k, v === true ? '1' : v === false ? '0' : v)
    }
    images.forEach((img) => fd.append('images[]', img))
    try {
      if (estEdition) {
        await updatePropriete(editId, fd)
      } else {
        await createPropriete(fd)
      }
      navigate('/mes-proprietes')
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement de la propriété.")
    } finally {
      setBusy(false)
    }
  }

  const estMaison = form.type === 'maison'
  const estAppart = form.type === 'appartement'
  const estTerrain = form.type === 'terrain'

  if (loading) {
    return (
      <div className="app-loading" style={{ minHeight: '50vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="page">
      <h1 className="page">{estEdition ? 'Modifier la propriété' : 'Ajouter une propriété'}</h1>
      <form className="card" onSubmit={submit}>
        <div className="form-grid">
          <div className="form-row">
            <label>Type de bien *</label>
            <select value={form.type} onChange={set('type')} required>
              <option value="">— Choisir —</option>
              <option value="maison">Maison</option>
              <option value="appartement">Appartement</option>
              <option value="terrain">Terrain</option>
            </select>
          </div>
          <div className="form-row">
            <label>Mode *</label>
            <select value={form.mode} onChange={set('mode')} required>
              <option value="location">Location</option>
              <option value="vente">Vente</option>
            </select>
          </div>
          <div className="form-row full">
            <label>Titre *</label>
            <input value={form.titre} onChange={set('titre')} placeholder="Ex : Appartement T3 moderne — Ivandry" required />
          </div>
          <div className="form-row full">
            <label>Description</label>
            <textarea rows={4} value={form.description} onChange={set('description')} placeholder="Décrivez le bien : situation, confort, équipements…" />
          </div>
          <div className="form-row">
            <label>Prix (Ar) *</label>
            <input type="number" min="0" value={form.prix} onChange={set('prix')} placeholder="850000" required />
          </div>
          {form.mode === 'location' && (
            <div className="form-row">
              <label>Type de loyer</label>
              <select value={form.type_loyer} onChange={set('type_loyer')}>
                <option value="mensuel">Mensuel</option>
                <option value="trimestriel">Trimestriel</option>
                <option value="annuel">Annuel</option>
              </select>
            </div>
          )}
        </div>

        <h3 style={{ margin: '1rem 0 0.5rem' }}>Localisation</h3>
        <div className="form-grid">
          <div className="form-row">
            <label>Adresse</label>
            <input value={form.adresse} onChange={set('adresse')} placeholder="Rue, numéro…" />
          </div>
          <div className="form-row">
            <label>Quartier</label>
            <input value={form.quartier} onChange={set('quartier')} placeholder="Ivandry" />
          </div>
          <div className="form-row">
            <label>Ville *</label>
            <input value={form.ville} onChange={set('ville')} placeholder="Antananarivo" required />
          </div>
          <div className="form-row">
            <label>Région</label>
            <input value={form.region} onChange={set('region')} placeholder="Analamanga" />
          </div>
          {form.quartier.trim() && (
            <div className="form-row full">
              <label>Lien Google Maps de votre lieu (optionnel)</label>
              <input
                value={mapLink}
                onChange={(e) => {
                  const v = e.target.value
                  setMapLink(v)
                  const c = extractCoords(v)
                  if (c) {
                    setForm((f) => ({ ...f, latitude: c.lat, longitude: c.lng }))
                  } else if (!v.trim()) {
                    setForm((f) => ({ ...f, latitude: '', longitude: '' }))
                  }
                }}
                placeholder="Collez le lien Google Maps (clic droit → Copier le lien)"
              />
              <span className="muted" style={{ fontSize: '0.7rem' }}>
                Ajoutez le lien du map de votre lieu : la carte du quartier se mettra à jour. Sinon, la carte se réinitialise.
              </span>
            </div>
          )}
          {form.quartier.trim() && (
            <div className="form-row full">
              <label>Carte du quartier</label>
              <iframe
                title="map"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                style={{ width: '100%', height: 260, border: 0, borderRadius: 12 }}
                loading="lazy"
              />
            </div>
          )}
        </div>

        {form.type && (
          <>
            <h3 style={{ margin: '1rem 0 0.5rem' }}>Caractéristiques {TYPE_NAME[form.type]}</h3>
            <div className="form-grid">
              {estMaison && (
                <div className="form-row">
                  <label>Nombre d'étages</label>
                  <input type="number" min="0" value={form.nb_etages} onChange={set('nb_etages')} />
                </div>
              )}
              {estAppart && (
                <div className="form-row">
                  <label>Nombre de pièces</label>
                  <input type="number" min="1" value={form.nb_pieces} onChange={set('nb_pieces')} />
                </div>
              )}
              {(estMaison || estAppart) && (
                <>
                  <div className="form-row">
                    <label>Chambres</label>
                    <input type="number" min="1" value={form.nb_chambres} onChange={set('nb_chambres')} />
                  </div>
                  <div className="form-row">
                    <label>Salles de bain</label>
                    <input type="number" min="1" value={form.nb_salles_bain} onChange={set('nb_salles_bain')} />
                  </div>
                  <div className="form-row">
                    <label>Superficie (m²)</label>
                    <input type="number" min="0" value={form.superficie} onChange={set('superficie')} />
                  </div>
                  <div className="form-row">
                    <label className="checkbox-label">
                      <input type="checkbox" checked={form.meuble} onChange={set('meuble')} /> Meublé
                    </label>
                  </div>
                </>
              )}
              {estTerrain && (
                <>
                  <div className="form-row">
                    <label>Superficie (m²)</label>
                    <input type="number" min="0" value={form.superficie} onChange={set('superficie')} />
                  </div>
                  <div className="form-row">
                    <label>N° titre foncier</label>
                    <input value={form.titre_foncier} onChange={set('titre_foncier')} placeholder="TF-2023-004512" />
                  </div>
                </>
              )}
            </div>
          </>
        )}

        <h3 style={{ margin: '1rem 0 0.5rem' }}>Photos</h3>
        <div className="drop-zone" onClick={() => document.getElementById('img-input')?.click()}>
          <ImagePlus size={22} />
          <p>Cliquez pour choisir des photos (JPG, PNG — 10 max)</p>
          <input id="img-input" type="file" accept="image/*" multiple className="hidden-file" onChange={addImages} />
        </div>
        <p className="muted" style={{ fontSize: '0.78rem', marginTop: '0.5rem' }}>
          Si vous n'ajoutez aucune photo, des photos Pexels correspondant à la description du bien seront automatiquement proposées.
        </p>
        {anciennesImages.length > 0 && (
          <div className="preview-grid">
            {anciennesImages.map((img) => (
              <div key={img.id} className="preview-item">
                <img src={assetUrl(img.path)} alt="" />
                {img.is_principale && <span className="badge badge-green">Principale</span>}
              </div>
            ))}
          </div>
        )}
        {images.length > 0 && (
          <div className="preview-grid">
            {images.map((img, i) => (
              <div key={i} className="preview-item">
                <img src={URL.createObjectURL(img)} alt="" />
                <button type="button" onClick={() => setImages((prev) => prev.filter((_, x) => x !== i))}>
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <div className="alert-danger">{error}</div>}
        <div className="form-actions">
          <button className="btn" disabled={busy}>
            <Save size={15} /> {busy ? 'Enregistrement…' : estEdition ? 'Enregistrer les modifications' : 'Publier la propriété'}
          </button>
          <button type="button" className="btn secondary" onClick={() => navigate('/mes-proprietes')}>Annuler</button>
        </div>
        <p className="muted">
          Votre annonce sera mise en ligne après validation par l'équipe Tany &amp; Toerana.
        </p>
      </form>
    </div>
  )
}

const TYPE_NAME = { maison: 'de la maison', appartement: "de l'appartement", terrain: 'du terrain' }