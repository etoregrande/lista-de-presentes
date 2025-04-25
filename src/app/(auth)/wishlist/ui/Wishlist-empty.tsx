import { PackageOpen } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

type EmptyWishlistProps = {
  isEmpty?: boolean
  newItem?: boolean
}

export const EmptyWishlist = ({ isEmpty, newItem }: EmptyWishlistProps) => {
  return (
    <AnimatePresence initial={false}>
      {isEmpty && !newItem && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0.6, height: 0 }}
          animate={{ scale: 1, opacity: 1, height: 'auto' }}
          exit={{ scale: 0.5, opacity: 0, height: 0 }}
          transition={{ duration: 0.4 }}
          className="flex min-h-60 flex-col items-center justify-center gap-2 rounded-xl border-1 border-slate-200"
        >
          <PackageOpen className="text-primary" />
          <p className="text-center break-words text-[var(--muted-foreground)]">
            A lista de desejos está vazia
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
