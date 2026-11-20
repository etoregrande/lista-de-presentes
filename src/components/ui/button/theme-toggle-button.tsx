'use client'

import { useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const subscribe = () => () => {}
const modes = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
  { value: 'system', label: 'Preferência do navegador', icon: Monitor },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
  const current =
    modes.find(({ value }) => value === (mounted ? theme : 'system')) ??
    modes[2]
  const Icon = current.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={`Tema: ${current.label}`}
          title={`Tema: ${current.label}`}
        >
          <Icon aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={current.value} onValueChange={setTheme}>
          {modes.map(({ value, label, icon: ModeIcon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <ModeIcon aria-hidden="true" className="size-4" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
