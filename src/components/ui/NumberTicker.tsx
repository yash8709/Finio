import { useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  duration?: number
  prefix?: string
}

export function NumberTicker({ 
  value, 
  duration = 1200,
  prefix = ''
}: Props) {
  const [display, setDisplay] = useState(0)
  const startTime = useRef<number | null>(null)
  const startValue = useRef(0)
  const rafId = useRef<number>(0)
  
  useEffect(() => {
    startValue.current = display
    startTime.current = null
    
    const animate = (timestamp: number) => {
      if (!startTime.current) {
        startTime.current = timestamp
      }
      
      const elapsed = timestamp - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(
        startValue.current + 
        (value - startValue.current) * eased
      )
      
      setDisplay(current)
      
      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate)
      }
    }
    
    rafId.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId.current)
  }, [value, duration])
  
  return (
    <span>
      {prefix}
      {new Intl.NumberFormat('en-IN').format(display)}
    </span>
  )
}
