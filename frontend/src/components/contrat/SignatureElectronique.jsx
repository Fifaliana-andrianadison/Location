import { useEffect, useRef, useState } from 'react'
import { Eraser, Check } from 'lucide-react'

export default function SignatureElectronique({ onSign, label = 'Signez ici' }) {
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [valeur, setValeur] = useState('')
  const [busy, setBusy] = useState(false)

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const start = (e) => {
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#1e293b'
    setDrawing(true)
  }

  const move = (e) => {
    if (!drawing) return
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    const { x, y } = getPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const end = () => {
    if (!drawing) return
    setDrawing(false)
    const dataUrl = canvasRef.current.toDataURL('image/png')
    setValeur(dataUrl)
  }

  const clear = () => {
    const canvas = canvasRef.current
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    setValeur('')
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const resize = () => {
      const ratio = devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * ratio
      canvas.height = rect.height * ratio
      canvas.getContext('2d').scale(ratio, ratio)
      canvas.getContext('2d').clearRect(0, 0, rect.width, rect.height)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const confirm = async () => {
    setBusy(true)
    try {
      await onSign(valeur)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="sig-box">
      <p className="muted">{label}</p>
      <canvas
        ref={canvasRef}
        className="sig-canvas"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      />
      <div className="form-actions">
        <button type="button" className="btn small secondary" onClick={clear}>
          <Eraser size={13} /> Effacer
        </button>
        <button
          type="button"
          className="btn small"
          disabled={!valeur || busy}
          onClick={confirm}
        >
          <Check size={13} /> Valider la signature
        </button>
      </div>
    </div>
  )
}