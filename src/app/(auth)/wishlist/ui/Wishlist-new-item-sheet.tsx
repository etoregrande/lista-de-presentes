import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet'
import { WishlistItemFormData } from '@/types/wishlistItem'
import { LoaderCircle } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { createWishlistItem } from '@/server/wishlistItem'
import { toast } from 'sonner'
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'
import { WishlistItem } from '@/generated/prisma'
import { WishlistNewItemSheetForm } from './Wishlist-new-item-sheet-form'
import { useSession } from '@/lib/context/session/context'

interface WishlistNewItemSheetProps {
  children: ReactNode
  setWishlist: Dispatch<SetStateAction<Partial<WishlistItem>[]>>
}

export const WishlistNewItemSheet = ({
  children,
  setWishlist,
}: WishlistNewItemSheetProps) => {
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useFormContext<WishlistItemFormData>()
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  useEffect(() => {
    if (isSheetOpen) {
      reset()
    }
  }, [isSheetOpen, reset])

  const session = useSession()
  if (!session) return null
  const { user } = session

  const onSubmit = async (formData: WishlistItemFormData) => {
    const newItem: Partial<WishlistItem> | null = await createWishlistItem(
      formData,
      user.id
    )
    if (!newItem) {
      return toast.error('Erro ao criar novo item')
    }
    setWishlist((prev) => [...prev, newItem])

    setIsSheetOpen(false)
    reset()
    toast.success('Item editado com sucesso!')
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="p-0">
        <SheetHeader className="border-border flex-none border-b p-6 text-left">
          <SheetTitle>Novo item</SheetTitle>
          <SheetDescription>
            Adicione informações ao seu novo item
          </SheetDescription>
        </SheetHeader>
        <WishlistNewItemSheetForm />
        <SheetFooter className="flex-none border-t p-6">
          <Button
            onClick={handleSubmit(onSubmit)}
            className="flex-1"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              'Salvar'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
