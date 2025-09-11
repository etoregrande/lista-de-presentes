'use client'

import { Gift } from 'lucide-react'
import { SidebarTrigger } from '../sidebar'

export default function NavbarContent() {
  return (
    <nav className="bg-navbar h-[var(--navbar-height)] w-full pt-[env(safe-area-inset-top)]">
      <div className="flex h-full items-center justify-between pr-4 pl-2 md:pr-8 md:pl-4">
        <SidebarTrigger />
        <div className="text-primary flex items-center gap-2">
          <Gift className="-translate-y-0.5" />
          <p className="text-foreground font-extrabold tracking-tighter">
            Presenteio
          </p>
        </div>
      </div>
    </nav>
  )
}
