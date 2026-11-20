'use client'

import { useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from '@/components/ui/credenza'
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
    <Credenza open={open} onOpenChange={close}>
      <CredenzaContent className="bg-card max-h-[min(90dvh,760px)] gap-0 overflow-hidden p-0 data-[vaul-drawer-direction=bottom]:max-h-[90dvh] sm:max-w-xl">
        <CredenzaHeader className="shrink-0 px-5 pt-6 pb-4 text-left sm:px-7 sm:pt-7">
          <CredenzaTitle className="text-2xl">Aparência</CredenzaTitle>
          <CredenzaDescription>
            Escolha o tema e as cores. Veja a mudança antes de salvar.
          </CredenzaDescription>
        </CredenzaHeader>
        <div className="min-h-0 space-y-6 overflow-y-auto px-5 pb-4 sm:px-7">
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
        <CredenzaFooter className="shrink-0 px-5 pt-2 pb-5 sm:px-7 sm:pb-7">
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
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  )
}
