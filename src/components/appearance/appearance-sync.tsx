'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { isAppearanceTheme, isPalette, setPalette } from '@/lib/appearance'

export function AppearanceSync({
  palette,
  theme,
}: {
  palette: string | null
  theme: string | null
}) {
  const { setTheme } = useTheme()
  const appliedPreference = useRef<string | null>(null)
  useEffect(() => {
    const preference = `${palette ?? ''}:${theme ?? ''}`
    if (appliedPreference.current === preference) return
    appliedPreference.current = preference
    setPalette(palette && isPalette(palette) ? palette : 'cherry')
    setTheme(theme && isAppearanceTheme(theme) ? theme : 'system')
  }, [palette, theme, setTheme])
  return null
}
