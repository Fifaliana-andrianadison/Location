import './AuthScene.css'

/**
 * Maquette 3D d'un quartier : maisons et immeubles qui sortent de la terre.
 * Couleurs de la plateforme : rouge --primary, bleu marine --sl-blue, blanc / gris clair.
 */
const apt = (x, y, w, d, h, c) => ({ type: 'apt', x, y, w, d, h, c })
const house = (x, y, w, d, h, c, rc) => ({ type: 'house', x, y, w, d, h, c, rc })

const RED = 'var(--primary)'
const DARK_RED = 'var(--primary-dark)'
const NAVY = '#16305a'

// x, y = position | w, d = largeur, profondeur | h = hauteur des murs | c = murs | rc = toit
// L'ordre du tableau = l'ordre d'apparition.
const BUILDINGS = [
  // Bloc haut-gauche
  apt(20, 20, 90, 80, 240, '#eef2f7'),
  house(130, 30, 100, 80, 56, '#ffffff', RED),
  house(20, 140, 100, 80, 56, '#f2f3f5', NAVY),
  house(140, 140, 90, 80, 52, '#ffffff', DARK_RED),
  // Bloc haut-droite
  apt(340, 20, 100, 90, 300, '#dbe4f0'),
  apt(460, 30, 80, 80, 200, '#f2f3f5'),
  house(340, 140, 90, 80, 56, '#ffffff', RED),
  house(450, 140, 90, 80, 54, '#fde8ec', NAVY),
  // Bloc bas-gauche
  house(20, 340, 100, 80, 56, '#f2f3f5', RED),
  house(140, 340, 90, 80, 54, '#ffffff', NAVY),
  house(20, 450, 100, 80, 56, '#ffffff', DARK_RED),
  house(140, 450, 90, 80, 54, '#fde8ec', RED),
  // Bloc bas-droite
  apt(340, 340, 90, 90, 170, '#e5ebf3'),
  house(450, 340, 90, 80, 54, '#ffffff', RED),
  house(340, 450, 90, 80, 56, '#f2f3f5', NAVY),
  house(450, 450, 90, 80, 54, '#ffffff', DARK_RED),
]

const TREES = [
  [236, 128], [128, 126], [322, 128], [546, 126],
  [236, 330], [128, 330], [322, 330], [440, 330],
  [236, 440], [128, 440], [322, 440], [440, 440], [546, 332],
]

const CARS = [
  { dir: 'h', pos: 262, color: '#e4002b', delay: 4.5, dur: 9 },
  { dir: 'h', pos: 292, color: '#ffffff', delay: 6.5, dur: 11, reverse: true },
  { dir: 'v', pos: 258, color: '#f59e0b', delay: 5, dur: 10 },
  { dir: 'v', pos: 290, color: '#3b82f6', delay: 7.5, dur: 12, reverse: true },
]

function Building({ b, i }) {
  const r = Math.round(b.d * 0.4) // hauteur du toit
  const rl = Math.round(Math.hypot(b.d / 2, r)) // longueur d'un pan de toit
  const ra = Math.round((Math.atan2(r, b.d / 2) * 180) / Math.PI) // pente
  const style = {
    left: b.x,
    top: b.y,
    width: b.w,
    height: b.d,
    '--w': `${b.w}px`,
    '--d': `${b.d}px`,
    '--h': `${b.h}px`,
    '--c': b.c,
    '--r': `${r}px`,
    '--rl': `${rl}px`,
    '--ra': `${ra}deg`,
    '--rc': b.rc,
    '--delay': `${(0.3 + i * 0.28).toFixed(2)}s`,
  }
  return (
    <div className={`s3-bld ${b.type}`} style={style}>
      <span className="s3-lot" />
      <span className="s3-dust" />
      <span className="s3-wall front" />
      <span className="s3-wall back" />
      <span className="s3-wall left" />
      <span className="s3-wall right" />
      {b.type === 'house' ? (
        <span className="s3-roof">
          <span className="s3-rs front" />
          <span className="s3-rs back" />
          <span className="s3-gb left" />
          <span className="s3-gb right" />
        </span>
      ) : (
        <span className="s3-top" />
      )}
    </div>
  )
}

export default function AuthScene() {
  return (
    <div className="scene3d" aria-hidden="true">
      <div className="s3-text">
        <span className="s3-bar" />
        <h1>Tany &amp; Toerana</h1>
        <p>Trouvez, louez et gérez vos biens à Madagascar.</p>
      </div>

      <div className="s3-stage">
        <div className="s3-world">
          <div className="s3-ground" />
          <div className="s3-road h" />
          <div className="s3-road v" />
          <div className="s3-cross" />

          {BUILDINGS.map((b, i) => <Building key={i} b={b} i={i} />)}

          {TREES.map(([x, y], i) => (
            <div key={i} className="s3-tree" style={{ left: x, top: y, '--td': `${(3.6 + i * 0.12).toFixed(2)}s` }}>
              <span className="s3-tshadow" />
              <span className="s3-tcrown" />
            </div>
          ))}

          {CARS.map((c, i) => (
            <span
              key={i}
              className={`s3-car ${c.dir}`}
              style={{
                [c.dir === 'h' ? 'top' : 'left']: c.pos,
                '--cc': c.color,
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.dur}s`,
                animationDirection: c.reverse ? 'reverse' : 'normal',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
