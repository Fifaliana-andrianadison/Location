/**
 * Réduit une image côté navigateur avant l'envoi.
 * Le serveur PHP n'accepte que 2 Mo par fichier (upload_max_filesize) et 8 Mo par requête :
 * les photos de téléphone (souvent 4-10 Mo) étaient donc refusées silencieusement.
 */
export async function compressImage(file, { maxSize = 1600, quality = 0.82 } = {}) {
  if (!file || !file.type?.startsWith('image/') || file.type === 'image/gif') return file

  try {
    const bitmap = await loadImage(file)
    const ratio = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * ratio)
    const height = Math.round(bitmap.height * ratio)

    // Déjà petite et légère : on garde le fichier d'origine.
    if (ratio === 1 && file.size < 900 * 1024) return file

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(bitmap, 0, 0, width, height)

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (!blob || blob.size >= file.size) return file

    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() })
  } catch {
    return file
  }
}

export function compressImages(files, options) {
  return Promise.all(Array.from(files || []).map((f) => compressImage(f, options)))
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.src = url
  })
}

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024

export function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`
}
