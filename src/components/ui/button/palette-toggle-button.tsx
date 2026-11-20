'use client'

import { useSyncExternalStore } from 'react'
import { Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  palettes,
  readPalette,
  setPalette,
  subscribePalette,
  isPalette,
} from '@/lib/appearance'

export function PaletteToggle() {
  const palette = useSyncExternalStore(
    subscribePalette,
    readPalette,
    () => 'cherry'
  )
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Escolher paleta de cores"
          title="Escolher paleta de cores"
        >
          <Palette aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[min(70dvh,28rem)] overflow-y-auto"
      >
        <DropdownMenuRadioGroup
          value={palette}
          onValueChange={(value) => {
            if (isPalette(value)) setPalette(value)
          }}
        >
          {palettes.map(({ value, label, colors }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <span
                aria-hidden="true"
                className="border-border size-5 shrink-0 rounded-full border shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${colors[0]} 50%, ${colors[1]} 50%)`,
                }}
              />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
