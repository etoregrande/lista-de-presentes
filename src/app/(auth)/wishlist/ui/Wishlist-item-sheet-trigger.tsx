import Image from 'next/image'
import { Info } from 'lucide-react'
import clsx from 'clsx'
import { getDisplayPrice } from '@/lib/utils'
import { WishlistItem } from '@/generated/prisma'
import { motion, useReducedMotion } from 'framer-motion'
import { WishlistItemPlaceholder } from '@/components/ui/wishlist-item-placeholder'
import { forwardRef } from 'react'

interface WishlistItemSheetTriggerProps {
  wishlistItem: Partial<WishlistItem>
}

export const WishlistItemSheetTrigger = forwardRef<
  HTMLButtonElement,
  WishlistItemSheetTriggerProps & React.ComponentProps<typeof motion.button>
>(function WishlistItemSheetTrigger({ wishlistItem, ...triggerProps }, ref) {
  const reducedMotion = useReducedMotion()
  return (
    <motion.button
      {...triggerProps}
      ref={ref}
      type="button"
      initial={reducedMotion ? false : { opacity: 0, scale: 0.86, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={reducedMotion ? undefined : { scale: 1.012, y: -3, transition: { duration: 0.22 } }}
      exit={reducedMotion ? undefined : { opacity: 0, scale: 0.96, y: -8 }}
      transition={{
        duration: reducedMotion ? 0 : 0.42,
        ease: 'easeOut',
        layout: reducedMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 300, damping: 24 },
      }}
      className={clsx(
        'group border-border bg-muted-background hover:border-primary focus-visible:ring-ring flex w-full flex-row gap-3 rounded-3xl border p-3 text-left shadow-[0_12px_30px_-22px_rgba(0,0,0,.55)] transition-[border-color,box-shadow] duration-300 hover:shadow-xl focus-visible:ring-2 focus-visible:outline-none md:flex-col md:gap-0',
        !wishlistItem.isActive && 'border-dashed'
      )}
    >
      <div className="border-border relative aspect-square size-24 shrink-0 overflow-hidden rounded-2xl border bg-[image:var(--gradient)] md:h-auto md:w-full">
        {wishlistItem.image ? (
          <Image src={wishlistItem.image} fill alt="Imagem do produto" sizes="(max-width: 768px) 100vw, 350px" className="object-cover transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.06]" loading="lazy" />
        ) : (
          <WishlistItemPlaceholder className="absolute inset-0 m-auto size-[68%] transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.08]" />
        )}
      </div>

      <div className="flex w-full flex-row justify-between gap-4 overflow-hidden py-1 md:px-2 md:pt-3 md:pb-2">
        <div className="flex min-w-0 flex-col justify-center text-left md:justify-start">
          <p className="truncate text-base leading-tight font-bold tracking-tight md:text-lg" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
            {wishlistItem.name}
          </p>
          {typeof wishlistItem.price === 'number' && wishlistItem.price > 0 && (
            <p className="text-primary mt-1 flex-shrink-0 text-base font-semibold whitespace-nowrap md:text-lg">
              {getDisplayPrice(wishlistItem.price)}
            </p>
          )}
        </div>

        {!wishlistItem.isActive && (
          <div className="flex gap-1">
            <p className="text-destructive">Invisível</p>
            <Info
              className="text-destructive"
              size={20}
              aria-label="Este produto não vai aparecer na sua lista compartilhada"
            />
          </div>
        )}
      </div>
    </motion.button>
  )
})
