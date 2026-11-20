'use client'

import { Gift } from 'lucide-react'
import { SidebarTrigger } from '../sidebar'

export default function NavbarContent() {
  return (
    <>
      <div
        aria-hidden="true"
        className="h-[var(--navbar-height)] shrink-0 md:hidden"
      />
      <nav className="bg-navbar border-navbar-border fixed inset-x-0 top-0 z-30 h-[var(--navbar-height)] w-full border-b pt-[env(safe-area-inset-top)] backdrop-blur-xl md:sticky md:inset-x-auto">
        <div className="flex h-full items-center justify-between pr-4 pl-2 md:pr-8 md:pl-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
          </div>
          <div className="text-primary flex items-center gap-2">
            <span className="bg-accent rounded-xl p-2">
              <Gift className="size-5" />
            </span>
            <p className="text-foreground text-lg font-black tracking-tight">
              Presenteio
            </p>
          </div>
        </div>
      </nav>
    </>
  )
}
