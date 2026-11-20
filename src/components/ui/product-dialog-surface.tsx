'use client'

import { DialogContent } from '@/components/ui/dialog'

export function ProductDialogSurface({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DialogContent className="top-0 left-0 h-dvh w-screen max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-none border-0 bg-transparent p-0 shadow-none sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[min(86dvh,760px)] sm:w-[min(94vw,980px)] sm:max-w-[980px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl">
      <div className="bg-card border-border flex h-full min-h-0 w-full flex-col overflow-hidden border shadow-2xl sm:h-auto sm:max-h-[min(86dvh,760px)] sm:rounded-3xl">
        {children}
      </div>
    </DialogContent>
  )
}
