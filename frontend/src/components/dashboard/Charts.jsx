import React from 'react'

export function Bar({ label, value, max, color = '#4f46e5' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div style={{ marginBottom: '0.7rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.3rem' }}>
        <span>{label}</span>
        <strong>{Number(value).toLocaleString('fr-FR')}</strong>
      </div>
      <div style={{ height: 10, background: '#eef2f7', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

export function PieChart({ data, total, size = 140 }) {
  const sum = total || data.reduce((a, d) => a + d.value, 0) || 1
  let acc = 0
  const gradient = data.map((d) => {
    const start = (acc / sum) * 360
    acc += d.value
    const end = (acc / sum) * 360
    return `${d.color} ${start}deg ${end}deg`
  }).join(', ')
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
      <div style={{ width: size, height: size, borderRadius: '50%', background: `conic-gradient(${gradient})`, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: size * 0.16, background: '#fff', borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
          {sum === 1 && data.every((d) => d.value === 0) ? 0 : (total || data.reduce((a, d) => a + d.value, 0))}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 120 }}>
        {data.map((d) => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: d.color }} />
            <span style={{ flex: 1 }}>{d.label}</span>
            <strong>{Number(d.value).toLocaleString('fr-FR')}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

export function LineChart({ values = [], labels = [], color = '#4f46e5', height = 120 }) {
  const w = 300
  const h = height
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1
  const pts = values.map((v, i) => {
    const x = values.length <= 1 ? w / 2 : (i / (values.length - 1)) * (w - 20) + 10
    const y = h - 10 - ((v - min) / range) * (h - 20)
    return `${x},${y}`
  }).join(' ')
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ overflow: 'visible' }}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {values.map((v, i) => {
          const x = values.length <= 1 ? w / 2 : (i / (values.length - 1)) * (w - 20) + 10
          const y = h - 10 - ((v - min) / range) * (h - 20)
          return <circle key={i} cx={x} cy={y} r="4" fill={color} />
        })}
      </svg>
      {labels.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748b', marginTop: '0.25rem' }}>
          {labels.map((l, i) => <span key={i}>{l}</span>)}
        </div>
      )}
    </div>
  )
}