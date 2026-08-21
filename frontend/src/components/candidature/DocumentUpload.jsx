import { useRef, useState } from 'react'
import { FileUp, X, FileText } from 'lucide-react'

export default function DocumentUpload({ onChange, accept = '.pdf,image/png,image/jpeg,image/jpg' }) {
  const [files, setFiles] = useState([])
  const inputRef = useRef(null)

  const handleFiles = (e) => {
    const list = Array.from(e.target.files || [])
    const merged = [...files, ...list].slice(0, 5)
    setFiles(merged)
    onChange(merged)
    e.target.value = ''
  }

  const remove = (i) => {
    const next = files.filter((_, idx) => idx !== i)
    setFiles(next)
    onChange(next)
  }

  return (
    <div className="form-row">
      <label>Documents (CIN, justificatif de revenus…) — facultatif</label>
      <div
        className="drop-zone"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const list = Array.from(e.dataTransfer.files || [])
          const merged = [...files, ...list].slice(0, 5)
          setFiles(merged)
          onChange(merged)
        }}
      >
        <FileUp size={22} />
        <p>Cliquez ou déposez vos fichiers ici (PDF, PNG, JPG — 5 max)</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden-file"
          onChange={handleFiles}
        />
      </div>
      {files.length > 0 && (
        <ul className="doc-list">
          {files.map((f, i) => (
            <li key={i}>
              <FileText size={14} />
              <span>{f.name}</span>
              <button type="button" className="icon-btn" onClick={() => remove(i)} title="Retirer">
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}