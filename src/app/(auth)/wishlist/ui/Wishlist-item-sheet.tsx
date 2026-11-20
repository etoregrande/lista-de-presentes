import { Button } from '@/components/ui/button'
import { Dialog, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { ProductDialogSurface } from '@/components/ui/product-dialog-surface'
import { WishlistItemFormData } from '@/types/wishlistItem'
import { useFormContext } from 'react-hook-form'
import { updateWishlistItemWithFeedback } from '@/server/wishlistItem'
import { Dispatch, ReactNode, SetStateAction, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { getWishlistSaveError } from '@/lib/wishlist-save-error'
import { WishlistItem } from '@/generated/prisma'
import { WishlistItemSheetForm } from './Wishlist-item-sheet-form'
import { useSession } from '@/lib/context/session/context'

interface WishlistItemSheetProps {
  children: ReactNode
  wishlistItem: WishlistItem
  setWishlist: Dispatch<SetStateAction<WishlistItem[]>>
}

export const WishlistItemSheet = ({
  children,
  wishlistItem,
  setWishlist,
}: WishlistItemSheetProps) => {
  const {
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useFormContext<WishlistItemFormData>()
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false)

  const session = useSession()
  if (!session) return null

  const onSubmit = async (formData: WishlistItemFormData) => {
    if (!wishlistItem.id) throw new Error('Unable to get wishlist item id')

    try {
      const updatedItem = await updateWishlistItemWithFeedback(
        formData,
        wishlistItem.id
      )
      if (updatedItem && 'imageError' in updatedItem) {
        setError('image', { type: 'server', message: updatedItem.imageError })
        toast.error(updatedItem.imageError)
        return
      }
      if (!updatedItem) {
        toast.error('Erro ao editar item')
        return
      }
      setWishlist((prev) =>
        prev.map((item) => (item.id === wishlistItem.id ? updatedItem : item))
      )
      setIsSheetOpen(false)
      toast.success('Item editado com sucesso!')
    } catch (error) {
      const failure = getWishlistSaveError(error)
      console.error('[wishlist-save-failed]', { code: failure.code })
      toast.error(failure.message, { duration: 12000 })
    }
  }

  return (
    <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <ProductDialogSurface>
        <WishlistItemSheetForm
          wishlistItem={wishlistItem}
          setWishlist={setWishlist}
          setIsSheetOpen={setIsSheetOpen}
        />
        <DialogFooter className="border-border flex-none !flex-row gap-3 border-t p-5 md:px-8">
          <Button
            variant="outline"
            type="button"
            className="flex-1"
            onClick={() => setIsSheetOpen(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
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
        </DialogFooter>
      </ProductDialogSurface>
    </Dialog>
  )
}
