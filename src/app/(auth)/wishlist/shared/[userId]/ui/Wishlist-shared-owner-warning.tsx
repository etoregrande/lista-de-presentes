'use client'

import { Button } from '@/components/ui/button/button'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ReactNode, useState } from 'react'

interface WishlistSharedOwnerWarningProps {
  children: ReactNode
  isOwner: boolean
}

export const WishlistSharedOwnerWarning = ({
  children,
  isOwner,
}: WishlistSharedOwnerWarningProps) => {
  const router = useRouter()
  const [isWishlistOwner, setIsWishlistOwner] = useState(isOwner)

  return (
    <>
      {isWishlistOwner ? (
        <div className="flex min-h-[calc(100dvh-var(--navbar-height))] flex-col items-center justify-center px-4 pb-[var(--navbar-height)] text-center">
          <Image
            src="/assets/wishlist/shared-wishlist-warning.svg"
            alt=""
            width={600}
            height={600}
            priority
            className="mx-auto"
          />
          <div className="mt-6 flex max-w-xl flex-col gap-4">
            <h1 className="text-2xl font-black tracking-tight">
              Você quer acessar sua lista de presentes compartilhada?
            </h1>
            <p>
              Se você continuar, poderá ver quais presentes já foram comprados
              para você. Isso pode estragar a surpresa! Se preferir, volte à sua
              página inicial para evitar “spoilers”.
            </p>
            <div className="flex w-full gap-2">
              <Button
                className="flex-1"
                type="button"
                variant="secondary"
                onClick={() => setIsWishlistOwner(false)}
              >
                Quero acessar
              </Button>
              <Button
                className="flex-1"
                type="button"
                onClick={() => router.push('/wishlist')}
              >
                Voltar à página inicial
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>{children}</>
      )}
    </>
  )
}
