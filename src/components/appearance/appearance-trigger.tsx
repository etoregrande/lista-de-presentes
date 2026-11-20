'use client'

import { useState } from 'react'
import { Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppearanceDialog } from './appearance-dialog'

export function AppearanceTrigger() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Aparência"
        title="Aparência"
        onClick={() => setOpen(true)}
      >
        <Palette aria-hidden="true" />
      </Button>
      {open && <AppearanceDialog open={open} onOpenChange={setOpen} />}
    </>
  )
}
