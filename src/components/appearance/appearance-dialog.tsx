'use client'

import { useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  palettes,
  readPalette,
  setPalette,
  type AppearanceTheme,
  type PaletteName,
} from '@/lib/appearance'
import { saveAppearance } from '@/server/appearance'
import { toast } from 'sonner'

const themes: { value: AppearanceTheme; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'system', label: 'Sistema' },
]

export function AppearanceDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { theme, setTheme } = useTheme()
  const [palette, setDraftPalette] = useState<PaletteName>(readPalette)
  const [draftTheme, setDraftTheme] = useState<AppearanceTheme>(
    (theme as AppearanceTheme) ?? 'system'
  )
  const original = useRef({ palette, theme: draftTheme })
  const [busy, setBusy] = useState(false)
  const saved = useRef(false)

  function close(nextOpen: boolean) {
    if (!nextOpen && !saved.current) {
      setPalette(original.current.palette)
      setTheme(original.current.theme)
    }
    onOpenChange(nextOpen)
  }

  async function confirm() {
    setBusy(true)
    try {
      await saveAppearance(palette, draftTheme)
      saved.current = true
      onOpenChange(false)
    } catch {
      toast.error('Não foi possível salvar a aparência. Tente novamente.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[min(90dvh,760px)] overflow-y-auto p-5 sm:max-w-xl sm:p-7">
        <DialogHeader className="pr-10 text-left">
          <DialogTitle className="text-2xl">Aparência</DialogTitle>
          <DialogDescription>
            Escolha o tema e as cores. Veja a mudança antes de salvar.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <fieldset className="space-y-3">
            <legend className="font-bold">Tema</legend>
            <div className="grid grid-cols-3 gap-2">
              {themes.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={draftTheme === value}
                  onClick={() => {
                    setDraftTheme(value)
                    setTheme(value)
                  }}
                  className={`border-border rounded-xl border px-3 py-3 text-sm font-semibold transition-colors ${draftTheme === value ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-accent'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="space-y-3">
            <legend className="font-bold">Cores</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {palettes.map(({ value, label, colors }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={palette === value}
                  onClick={() => {
                    setDraftPalette(value)
                    setPalette(value)
                  }}
                  className={`flex min-h-14 items-center gap-3 rounded-xl border px-3 text-left text-sm font-semibold transition-colors ${palette === value ? 'border-primary bg-accent' : 'border-border bg-card hover:bg-accent/60'}`}
                >
                  <span
                    aria-hidden="true"
                    className="border-border size-8 shrink-0 rounded-full border"
                    style={{
                      background: `linear-gradient(135deg, ${colors[0]} 50%, ${colors[1]} 50%)`,
                    }}
                  />
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => close(false)}
            disabled={busy}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={confirm} disabled={busy}>
            {busy ? 'Salvando…' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
