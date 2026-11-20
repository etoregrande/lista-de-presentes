'use client'

import { PackageOpen } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

type EmptyWishlistProps = {
  isEmpty?: boolean
  newItem?: boolean
}

export const EmptyWishlist = ({ isEmpty, newItem }: EmptyWishlistProps) => {
  const reducedMotion = useReducedMotion()
  return (
    <AnimatePresence initial={false}>
      {isEmpty && !newItem && (
        <motion.div
          initial={
            reducedMotion ? false : { scale: 0.5, opacity: 0.6, height: 0 }
          }
          animate={{ scale: 1, opacity: 1, height: 'auto' }}
          exit={
            reducedMotion ? undefined : { scale: 0.5, opacity: 0, height: 0 }
          }
          transition={{ duration: reducedMotion ? 0 : 0.4 }}
          className="surface-panel flex min-h-64 flex-col items-center justify-center gap-4 border-dashed p-8"
        >
          <span className="bg-accent text-primary rounded-3xl p-5">
            <PackageOpen className="size-10" />
          </span>
          <p className="text-center break-words text-[var(--muted-foreground)]">
            A lista de desejos está vazia
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
