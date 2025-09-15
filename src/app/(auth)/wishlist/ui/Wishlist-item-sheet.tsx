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
import { useFormContext } from 'react-hook-form'
import { updateWishlistItem } from '@/server/wishlistItem'
import { Dispatch, ReactNode, SetStateAction, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { getDisplayPrice } from '@/lib/utils'
import { WishlistItem } from '@/generated/prisma'
import { WishlistItemSheetForm } from './Wishlist-item-sheet-form'
import { useSession } from '@/lib/context/session/context'

interface WishlistItemSheetProps {
  children: ReactNode
  wishlistItem: Partial<WishlistItem>
  setWishlist: Dispatch<SetStateAction<Partial<WishlistItem>[]>>
}

export const WishlistItemSheet = ({
  children,
  wishlistItem,
  setWishlist,
}: WishlistItemSheetProps) => {
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useFormContext<WishlistItemFormData>()
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false)
  const { user } = useSession()

  const onSubmit = async (formData: WishlistItemFormData) => {
    if (!wishlistItem.id) throw new Error('Unable to get wishlist item id')

    const updatedItem = await updateWishlistItem(
      formData,
      wishlistItem.id,
      user.id
    )

    setWishlist((prev) =>
      prev.map((item) =>
        item.id === wishlistItem.id
          ? {
              ...(updatedItem as WishlistItem),
            }
          : item
      )
    )

    setIsSheetOpen(false)
    toast.success('Item editado com sucesso!')
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger>{children}</SheetTrigger>
      <SheetContent side="right" className="p-0">
        <SheetHeader className="border-border flex-none border-b p-6 text-left">
          <SheetTitle>{wishlistItem.name}</SheetTitle>
          <SheetDescription>
            <span className="text-sm break-words text-[var(--muted-foreground)]">
              {wishlistItem.price && wishlistItem.price > 0
                ? getDisplayPrice(wishlistItem.price)
                : 'Produto sem preço'}
            </span>
          </SheetDescription>
        </SheetHeader>
        <WishlistItemSheetForm
          wishlistItem={wishlistItem}
          setWishlist={setWishlist}
          setIsSheetOpen={setIsSheetOpen}
        />
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
