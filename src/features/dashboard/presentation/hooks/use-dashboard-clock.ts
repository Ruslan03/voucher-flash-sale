'use client'

import { useEffect, useState } from 'react'

export function useDashboardClock(initial: number) {
  const [now, setNow] = useState(initial)
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  return now
}
