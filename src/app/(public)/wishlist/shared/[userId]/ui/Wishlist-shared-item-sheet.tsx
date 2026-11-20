import { Button } from '@/components/ui/button'
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
import { ProductDialogSurface } from '@/components/ui/product-dialog-surface'
import { Dispatch, ReactNode, SetStateAction, useState } from 'react'
import { getDisplayPrice } from '@/lib/utils'
import { WishlistItem } from '@/types/wishlistItem'
import { WishlistSharedItemSheetContent } from './Wishlist-shared-item-sheet-content'
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
    const updatedWishlistItem = await purchaseWishlistItem(wishlistItem)

    try {
      if (!updatedWishlistItem) {
        alert(
          'Não foi possível alterar este item. Ele pode ter sido atualizado por outra pessoa, ou a compra pertence a outro navegador. Atualize a página para conferir.'
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
      <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <ProductDialogSurface>
          <DialogHeader className="border-border flex-none border-b px-6 py-5 text-left md:px-8">
            <DialogTitle className="max-w-[calc(100%-2rem)] truncate text-xl font-black">
              {wishlistItem.name}
            </DialogTitle>
            <DialogDescription>
              <span className="text-sm break-words text-[var(--muted-foreground)]">
                {wishlistItem.price && wishlistItem.price > 0
                  ? getDisplayPrice(wishlistItem.price)
                  : 'Produto sem preço'}
              </span>
            </DialogDescription>
          </DialogHeader>
          <WishlistSharedItemSheetContent
            wishlistItem={wishlistItem}
            setWishlist={setWishlist}
            setIsSheetOpen={setIsSheetOpen}
          />
          <DialogFooter className="border-border flex-none border-t p-5 md:px-8">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant={wishlistItem.isPurchased ? 'destructive' : 'default'}
                >
                  {wishlistItem.isPurchased
                    ? 'Desfazer compra'
                    : 'Marcar como comprado'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {wishlistItem.isPurchased
                      ? 'Você quer desmarcar este item?'
                      : 'Você comprou este item?'}
                  </DialogTitle>
                  <DialogDescription>
                    {wishlistItem.isPurchased
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
          </DialogFooter>
        </ProductDialogSurface>
      </Dialog>
    </>
  )
}
