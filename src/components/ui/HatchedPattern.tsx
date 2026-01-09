type HatchedPatternProps = {
  className?: string
  color?: string
  backgroundColor?: string
  strokeWidth?: number
  spacing?: number
  angle?: number
}

export function HatchedPattern(props: HatchedPatternProps) {
  const {
    className = '',
    color = '#f59e0b',
    backgroundColor = 'transparent',
    strokeWidth = 1,
    spacing = 6,
    angle = 45,
  } = props

  const patternId = `hatch-${angle}-${spacing}`

  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      xmlns='http://www.w3.org/2000/svg'
      preserveAspectRatio='none'
    >
      <defs>
        <pattern
          id={patternId}
          patternUnits='userSpaceOnUse'
          width={spacing}
          height={spacing}
          patternTransform={`rotate(${angle})`}
        >
          <line x1='0' y1='0' x2='0' y2={spacing} stroke={color} strokeWidth={strokeWidth} />
        </pattern>
      </defs>
      <rect width='100%' height='100%' fill={backgroundColor} />
      <rect width='100%' height='100%' fill={`url(#${patternId})`} />
    </svg>
  )
}
