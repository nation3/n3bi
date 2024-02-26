import { useEffect, useState } from "react"

export function useIsMounted() {
  console.info('useIsMounted')

  const [isMounted, setMounted] = useState(false)
  
  useEffect(() => {
    console.info('useEffect')
    setMounted(true)
  }, [])

  return isMounted
}
