import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  CreateWishlistItemFormDataType,
  WishlistItem,
} from '@/types/wishlistItem'
import { setImageSrc } from '../actions'
import { WishlistItemCardDetail } from './Wishlist-item-card-detail'
import { Info, LoaderCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { SubmitHandler, useFormContext } from 'react-hook-form'
import { redirect } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { createWishlistItem } from '@/server/wishlistItem'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { getDisplayPrice } from '@/lib/utils'

interface WishlistItemCardProps {
  wishlistItem: WishlistItem
  mode: 'edit' | 'new'
  setNewItem?: Dispatch<SetStateAction<boolean>>
  setWishlist: Dispatch<SetStateAction<WishlistItem[]>>
}

export const WishlistItemCard = ({
  wishlistItem,
  mode,
  setNewItem,
  setWishlist,
}: WishlistItemCardProps) => {
  const [openedWishlistItem, setOpenedWishlistItem] =
    useState<WishlistItem | null>(null)
  const [openItem, setOpenItem] = useState<boolean>(false)
  const { imageSrc, isPlaceholder } = setImageSrc(wishlistItem)
  const ref = useRef<HTMLDivElement>(null)

  const formHook = useFormContext<CreateWishlistItemFormDataType>()
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors, isSubmitting },
  } = formHook

  useEffect(() => {
    if (mode === 'new') setFocus('name')
  }, [mode, setFocus])

  useEffect(() => {
    if (mode != 'new') return

    const handleClickOutside = (event: MouseEvent) => {
      if (!setNewItem) return

      if (ref.current && !ref.current.contains(event.target as Node)) {
        setWishlist((prev) => prev.filter((item) => item.id !== 'new'))
        reset()
        setNewItem(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mode, setWishlist, setNewItem, reset])

  const handleOpenWishlistItemCardDetail = () => {
    setOpenedWishlistItem(wishlistItem)
  }

  const handleCreateWishlistItem: SubmitHandler<
    CreateWishlistItemFormDataType
  > = async (formData: CreateWishlistItemFormDataType) => {
    if (isSubmitting) return
    if (!setNewItem) return

    const { data: session } = await authClient.getSession()
    if (!session) redirect('/login')

    const newWishlistItem = await createWishlistItem(formData, session?.user.id)
    setWishlist((prev) =>
      prev.map((item) =>
        item.id === 'new' ? (newWishlistItem as WishlistItem) : item
      )
    )
    setNewItem(false)

    reset()
    toast.success('Item criado com sucesso!')
  }

  const cardContent = (
    <motion.div
      ref={ref}
      onClick={handleOpenWishlistItemCardDetail}
      layout={mode !== 'new' ? 'position' : false}
      initial={{ scale: 0.85 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      whileHover={mode !== 'new' ? { y: -2 } : undefined}
      whileTap={mode !== 'new' ? { y: 1 } : undefined}
      className={clsx(
        'group flex flex-row gap-4 rounded-xl transition-[padding] duration-200 ease-in-out hover:bg-slate-50 md:flex-col md:gap-0',
        !wishlistItem.is_active && 'cursor-pointer opacity-50',
        mode === 'new' && 'bg-slate-50'
      )}
    >
      <div className="bg-secondary-foreground relative aspect-square h-full min-h-20 min-w-20 overflow-hidden rounded-lg">
        <Image
          src={imageSrc}
          fill
          alt="Imagem do produto"
          className={clsx(
            'transition-transform duration-200 ease-in-out group-hover:scale-102',
            !isPlaceholder && 'object-cover',
            isPlaceholder && 'object-contain'
          )}
          priority
        />
      </div>

      {mode === 'edit' && (
        <div className="flex w-full flex-row justify-between gap-4 overflow-hidden py-2 transition-all duration-200 ease-in-out group-hover:px-2 md:min-h-15">
          <div className="flex min-w-0 flex-col justify-center md:justify-start">
            <p className="truncate font-bold tracking-tight">
              {wishlistItem.name}
            </p>
            {typeof wishlistItem.price === 'number' &&
              wishlistItem.price > 0 && (
                <p className="flex-shrink-0 text-sm whitespace-nowrap text-slate-500">
                  {getDisplayPrice(wishlistItem.price)}
                </p>
              )}
          </div>

          {!wishlistItem.is_active && (
            <div className="flex items-center gap-1">
              <p className="text-red-500">Invisível</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="cursor-pointer text-red-500" size={20} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Este produto não vai aparecer na sua lista compartilhada
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      )}

      {mode === 'new' && (
        <form
          className="flex w-full flex-row items-center justify-between gap-2 py-4 pr-4 transition-all duration-200 ease-in-out md:pl-4"
          onSubmit={handleSubmit(handleCreateWishlistItem)}
        >
          <div className="grid w-full items-center gap-1.5">
            <Input {...register('name')} placeholder="Nome do item" />
            {errors.name && (
              <div className="truncate text-sm text-red-500">
                {errors.name.message}
              </div>
            )}
          </div>

          <Button className="md:hidden" disabled={isSubmitting}>
            {isSubmitting ? <LoaderCircle className="animate-spin" /> : 'Criar'}
          </Button>
        </form>
      )}
    </motion.div>
  )

  return mode === 'edit' ? (
    <Sheet open={openItem} onOpenChange={setOpenItem}>
      <SheetTrigger asChild>{cardContent}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="max-w-[90%] truncate overflow-hidden whitespace-nowrap">
            {wishlistItem.name}
          </SheetTitle>
          <SheetDescription>
            Informações sobre o item que deseja ganhar
          </SheetDescription>
        </SheetHeader>
        {openedWishlistItem && mode === 'edit' && setWishlist && (
          <WishlistItemCardDetail
            wishlistItem={openedWishlistItem}
            setOpenedWishlistItem={setOpenedWishlistItem}
            setWishlist={setWishlist}
            setOpenItem={setOpenItem}
          />
        )}
      </SheetContent>
    </Sheet>
  ) : (
    cardContent
  )
}
