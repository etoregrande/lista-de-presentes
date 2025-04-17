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
import { CreateWishlistItemFormDataType } from '@/types/wishlistItem'
import { LoaderCircle } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { createWishlistItem } from '@/server/wishlistItem'
import { redirect } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { toast } from 'sonner'
import { Dispatch, ReactNode, SetStateAction, useState } from 'react'
import { WishlistItem } from '@/types/db'
import { WishlistNewItemForm } from './Wishlist-new-item-form'

interface WishlistNewItemProps {
  children: ReactNode
  setWishlist: Dispatch<SetStateAction<Partial<WishlistItem>[]>>
}

export const WishlistNewItem = ({
  children,
  setWishlist,
}: WishlistNewItemProps) => {
  const {
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useFormContext<CreateWishlistItemFormDataType>()
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const onSubmit = async (formData: CreateWishlistItemFormDataType) => {
    console.log(formData)

    const { data: session } = await authClient.getSession()
    if (!session) redirect('/login')

    const newItem: Partial<WishlistItem> | null = await createWishlistItem(
      formData,
      session.user.id
    )
    if (!newItem) {
      return toast.error('Erro ao criar novo item')
    }
    setWishlist((prev) => [...prev, newItem])

    setIsSheetOpen(false)
    reset()
    toast.success('Item editado com sucesso!')
  }

  console.log(errors)
  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent side="right" className="p-0">
          <SheetHeader className="border-border flex-none border-b p-6 text-left">
            <SheetTitle>Novo item</SheetTitle>
            <SheetDescription>
              Adicione informações ao seu novo item
            </SheetDescription>
          </SheetHeader>
          <WishlistNewItemForm />
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
    </>
  )
}
