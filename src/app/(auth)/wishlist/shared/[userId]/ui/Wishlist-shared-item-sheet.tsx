import { Button } from '@/components/ui/button/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Dispatch, ReactNode, SetStateAction, useState } from 'react'
import { getDisplayPrice } from '@/lib/utils'
import { WishlistItem } from '@/types/db'
import { WishlistSharedItemSheetForm } from './Wishlist-shared-item-sheet-form'
import { purchaseWishlistItem } from '@/server/wishlistItem'

interface WishlistSharedItemSheetProps {
  children: ReactNode
  wishlistItem: Partial<WishlistItem>
  setWishlist: Dispatch<SetStateAction<Partial<WishlistItem>[]>>
}

export const WishlistSharedItemSheet = ({
  children,
  wishlistItem,
  setWishlist,
}: WishlistSharedItemSheetProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false)

  const onSubmit = async () => {
    if (!wishlistItem.id) throw new Error('Failed to get wishlist item id')
    const isPurchased = wishlistItem.is_purchased ? false : true
    const updatedWishlistItem = await purchaseWishlistItem(
      wishlistItem,
      isPurchased
    )

    try {
      if (!updatedWishlistItem) {
        alert(
          'Parece que esse item já foi atualizado por outra pessoa. Atualize a página para ver a lista atualizada!'
        )
        window.location.reload()
        return
      }
      setWishlist((prev) =>
        prev.map((item) =>
          item.id === wishlistItem.id
            ? (updatedWishlistItem as WishlistItem)
            : item
        )
      )
      setIsSheetOpen(false)
    } catch (error) {
      console.error('Erro ao atualizar o item:', error)
      alert('Ocorreu um erro ao tentar atualizar o item.')
    }
  }

  return (
    <>
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
          <WishlistSharedItemSheetForm
            wishlistItem={wishlistItem}
            setWishlist={setWishlist}
            setIsSheetOpen={setIsSheetOpen}
          />
          <SheetFooter className="flex-none border-t p-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant={
                    wishlistItem.is_purchased ? 'destructive' : 'default'
                  }
                >
                  {wishlistItem.is_purchased
                    ? 'Desfazer compra'
                    : 'Marcar como comprado'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {wishlistItem.is_purchased
                      ? 'Você quer desmarcar este item?'
                      : 'Você comprou este item?'}
                  </DialogTitle>
                  <DialogDescription>
                    {wishlistItem.is_purchased
                      ? 'Se você marcou esse item como comprado por engano pode confirmar para torná-lo disponível novamente. Deseja confirmar?'
                      : 'Se você marcar como comprado, outras pessoas não vão comprar este produto. Deseja confirmar?'}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancelar
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button type="submit" onClick={onSubmit}>
                      Confirmar
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
