// Beige-tinted grain SVG
const GRAIN_SVG = `<svg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'><filter id='grain'><feTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='4' stitchTiles='stitch' result='noise'/><feColorMatrix type='matrix' values='0 0 0 0 0.76 0 0 0 0 0.68 0 0 0 0 0.58 0 0 0 1 0' in='noise' result='beige'/></filter><rect width='100%' height='100%' filter='url(%23grain)'/></svg>`

export const GRAIN_DATA_URI = `url("data:image/svg+xml,${encodeURIComponent(GRAIN_SVG)}")`

export const grainBackgroundStyle: React.CSSProperties = {
  backgroundImage: GRAIN_DATA_URI,
  backgroundRepeat: 'repeat',
  backgroundSize: '256px 256px',
}

type GrainBackgroundProps = {
  children: React.ReactNode
  className?: string
}

/**
 * GrainBackground - Wraps content with a vintage grainy texture that scrolls with content
 */
export function GrainBackground(props: GrainBackgroundProps) {
  const { children, className = '' } = props

  return (
    <div className={`relative ${className}`}>
      {/* Grain layer - scrolls with content */}
      <div
        className='pointer-events-none absolute inset-0 opacity-100'
        style={{
          ...grainBackgroundStyle,
          mixBlendMode: 'overlay',
        }}
        aria-hidden='true'
      />
      {/* Content */}
      {children}
    </div>
  )
}
