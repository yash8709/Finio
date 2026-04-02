import { useState, useEffect, useRef } from 'react'

interface NumberTickerProps {
  value: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
  formatter?: (value: number) => string
}

export function NumberTicker({
  value,
  duration = 1200,
  className = '',
  prefix = '',
  suffix = '',
  formatter,
}: NumberTickerProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const prevValueRef = useRef(0)

  useEffect(() => {
    const startValue = prevValueRef.current
    const endValue = value
    prevValueRef.current = value

    if (startValue === endValue) {
      setDisplayValue(endValue)
      return
    }

    startTimeRef.current = null

    function animate(timestamp: number) {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // easeOut cubic: 1 - (1 - t)^3
      const easedProgress = 1 - Math.pow(1 - progress, 3)

      const current = startValue + (endValue - startValue) * easedProgress
      setDisplayValue(Math.round(current))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayValue(endValue)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [value, duration])

  const formatted = formatter ? formatter(displayValue) : displayValue.toString()

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  )
}
