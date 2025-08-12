'use client'

import { ReactNode } from 'react'
import { GroupDeleteButton } from './group-delete-button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { GroupHoldDrawButton } from './group-hold-draw-button'

interface GroupEditProps {
  children: ReactNode
}

export const GroupEditDialog = ({ children }: GroupEditProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="p-0">
        <SheetHeader className="border-border flex-none border-b p-6 text-left">
          <SheetTitle>Configurar amigo secreto</SheetTitle>
          <SheetDescription>
            Altere as informações desse amigo secreto
          </SheetDescription>
        </SheetHeader>
        <GroupDeleteButton />
        <GroupHoldDrawButton />
        <SheetFooter className="flex-none border-t p-6">
          {/* <Button
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
          </Button> */}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
