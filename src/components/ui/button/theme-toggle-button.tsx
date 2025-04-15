'use client'

import { useEffect, useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark')
        ? 'dark'
        : 'light'
    }
    return 'light'
  })

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
    localStorage.setItem('theme', nextTheme)
    setTheme(nextTheme)
  }

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (saved) {
      document.documentElement.classList.toggle('dark', saved === 'dark')
      setTheme(saved)
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
