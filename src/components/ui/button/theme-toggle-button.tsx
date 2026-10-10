'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { Switch } from '@/components/ui/switch'
import { Moon, Sun } from 'lucide-react'

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
  return () => observer.disconnect()
}
const getSnapshot = () => document.documentElement.classList.contains('dark')
const getServerSnapshot = () => false

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const theme = isDark ? 'dark' : 'light'

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
    localStorage.setItem('theme', nextTheme)
  }

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (saved) {
      document.documentElement.classList.toggle('dark', saved === 'dark')
    }
  }, [])

  return (
    <button
      onClick={toggleTheme}
      className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
    >
      <Switch checked={theme === 'dark'} />
      {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
      <span>{theme === 'dark' ? 'Escuro' : 'Claro'}</span>
    </button>
  )
}
