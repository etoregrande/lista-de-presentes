'use client'

import { CredenzaContent } from '@/components/ui/credenza'

export function ProductDialogSurface({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CredenzaContent className="bg-card gap-0 overflow-hidden p-0 shadow-2xl data-[vaul-drawer-direction=bottom]:max-h-[90dvh] data-[vaul-drawer-direction=bottom]:rounded-t-3xl md:flex md:max-h-[min(86dvh,760px)] md:w-[min(94vw,980px)] md:max-w-[980px] md:rounded-3xl md:border-0 md:bg-transparent md:shadow-none">
      <div className="bg-card border-border flex min-h-0 w-full flex-col overflow-hidden md:max-h-[min(86dvh,760px)] md:rounded-3xl md:border md:shadow-2xl">
        {children}
      </div>
    </CredenzaContent>
  )
}
