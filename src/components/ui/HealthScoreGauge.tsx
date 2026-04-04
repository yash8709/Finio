import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import type { HealthScoreData } from '../../types'

interface HealthScoreGaugeProps {
  data: HealthScoreData
  size?: 'default' | 'large'
}

export function HealthScoreGauge({ data, size = 'default' }: HealthScoreGaugeProps) {
  const isLarge = size === 'large'
  const viewW = isLarge ? 280 : 200
  const viewH = isLarge ? 160 : 120
  const cx = viewW / 2
  const cy = isLarge ? 130 : 95
  const radius = isLarge ? 100 : 72
  const strokeWidth = isLarge ? 14 : 12

  // Arc geometry — semicircle from 180° to 0°
  const arcLength = Math.PI * radius // Half circumference

  // Tick positions at 0, 25, 50, 75, 100
  const tickValues = [0, 25, 50, 75, 100]

  // Score display counter
  const [displayScore, setDisplayScore] = useState(0)
  const animationRef = useRef<number>(0)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    startTimeRef.current = null
    const targetScore = data.score
    const duration = 1200

    const animateCount = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayScore(Math.round(eased * targetScore))

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateCount)
      }
    }

    animationRef.current = requestAnimationFrame(animateCount)
    return () => cancelAnimationFrame(animationRef.current)
  }, [data.score])

  // Arc path helper (clockwise from left to right)
  function describeArc(
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number,
  ): string {
    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy - r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy - r * Math.sin(endAngle)
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`
  }

  const trackPath = describeArc(cx, cy, radius, Math.PI, 0)

  // Calculate tick mark positions
  function getTickPosition(value: number) {
    const angle = Math.PI - (value / 100) * Math.PI
    const innerR = radius - strokeWidth / 2 - 2
    const outerR = radius + strokeWidth / 2 + 2
    return {
      x1: cx + innerR * Math.cos(angle),
      y1: cy - innerR * Math.sin(angle),
      x2: cx + outerR * Math.cos(angle),
      y2: cy - outerR * Math.sin(angle),
    }
  }

  return (
    <svg
      viewBox={`0 0 ${viewW} ${viewH}`}
      className="w-full"
      style={{ maxWidth: isLarge ? 280 : 200 }}
    >
      {/* Track arc */}
      <path
        d={trackPath}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Tick marks */}
      {tickValues.map((val) => {
        const tick = getTickPosition(val)
        return (
          <line
            key={val}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={1.5}
          />
        )
      })}

      {/* Score arc (animated) */}
      <motion.path
        d={trackPath}
        fill="none"
        stroke={data.color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={arcLength}
        initial={{ strokeDashoffset: arcLength }}
        animate={{ strokeDashoffset: arcLength - (data.score / 100) * arcLength }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          filter: `drop-shadow(0 0 8px ${data.color}40)`,
        }}
      />

      {/* Glow effect on score arc */}
      <motion.path
        d={trackPath}
        fill="none"
        stroke={data.color}
        strokeWidth={strokeWidth + 8}
        strokeLinecap="round"
        strokeDasharray={arcLength}
        initial={{ strokeDashoffset: arcLength }}
        animate={{ strokeDashoffset: arcLength - (data.score / 100) * arcLength }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        opacity={0.08}
      />

      {/* Min label */}
      <text
        x={cx - radius - (isLarge ? 16 : 12)}
        y={cy + 4}
        fill="#4B5563"
        fontSize={isLarge ? 11 : 9}
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
      >
        0
      </text>

      {/* Max label */}
      <text
        x={cx + radius + (isLarge ? 16 : 12)}
        y={cy + 4}
        fill="#4B5563"
        fontSize={isLarge ? 11 : 9}
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
      >
        100
      </text>

      {/* Score number */}
      <text
        x={cx}
        y={cy - (isLarge ? 12 : 8)}
        fill={data.color}
        fontSize={isLarge ? 40 : 32}
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="JetBrains Mono, monospace"
      >
        {displayScore}
      </text>

      {/* Grade label */}
      <text
        x={cx}
        y={cy + (isLarge ? 16 : 12)}
        fill="#9CA3AF"
        fontSize={isLarge ? 13 : 11}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Sora, sans-serif"
      >
        {data.label}
      </text>
    </svg>
  )
}
