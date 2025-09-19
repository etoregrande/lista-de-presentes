'use client'

import { User } from '@/generated/prisma'
import clsx from 'clsx'
import { useState } from 'react'
import { Doodle1 } from './assets/doodle1'
import { Doodle2 } from './assets/doodle2'
import { Sprinkles1 } from './assets/sprinkles1'
import { Sprinkles2 } from './assets/sprinkles2'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { setAvatarFallbackString } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { LoaderCircle as LoaderCircleIcon } from 'lucide-react'
import { useSecretSantaGroup } from '../context/context'

interface SecretSantaDrawResultProps {
  receiver: Partial<User> | null
}

export const SecretSantaDrawResult = ({
  receiver,
}: SecretSantaDrawResultProps) => {
  const router = useRouter()
  const {
    secretSantaGroup: { priceLimit },
  } = useSecretSantaGroup()
  const [revealed, setRevealed] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!receiver) {
    return (
      <div className="bg-muted relative flex min-h-40 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-slate-200">
        <Sprinkles2 className="text-primary absolute -top-6 left-0 size-20" />
        <p className="text-center break-words text-[var(--muted-foreground)]">
          O sorteio ainda não foi realizado
        </p>
        <Sprinkles1 className="text-primary absolute right-0 -bottom-6 size-30" />
      </div>
    )
  }

  const navigateToReceiverWishlist = () => {
    if (loading) return

    setLoading(true)

    const params = new URLSearchParams()

    if (priceLimit) params.set('priceLimit', (priceLimit / 100).toString())
    const searchString = params.toString() ? `?${params.toString()}` : ''

    router.push(`/wishlist/shared/${receiverId}${searchString}`)
  }

  const { name: receiverName, image, id: receiverId } = receiver
  const receiverImage = image ?? ''

  return (
    <div
      className={clsx(
        'absolute h-full min-h-30 w-full cursor-pointer rounded-lg transition-all duration-500 ease-in-out transform-3d hover:scale-103 md:min-h-40',
        revealed && 'rotate-x-180'
      )}
    >
      <div
        className="group bg-muted hover:bg-muted/50 absolute flex h-full w-full items-center justify-between gap-2 rounded-lg p-10 duration-200 backface-hidden hover:px-8"
        onClick={() => setRevealed(true)}
      >
        <Doodle1 className="text-primary h-full w-auto shrink-0" />
        <p className="text-center font-bold duration-200 xl:text-xl xl:font-semibold">
          <span className="block md:hidden">
            Toque para revelar seu amigo secreto!
          </span>
          <span className="hidden md:block">
            Clique para revelar seu amigo secreto!
          </span>
        </p>
        <Doodle2 className="text-primary h-full w-auto shrink-0" />
      </div>

      <div
        className="bg-muted-background hover:bg-primary/30 absolute flex h-full w-full rotate-x-180 flex-col justify-center gap-2 rounded-lg px-8 duration-200 backface-hidden md:flex-row md:items-center md:justify-between md:gap-6"
        onClick={() => navigateToReceiverWishlist()}
      >
        {!loading ? (
          <>
            <div className="flex min-w-0 items-center gap-4">
              <Avatar className="size-16 md:size-24">
                <AvatarImage src={receiverImage} />
                <AvatarFallback className="bg-white font-bold">
                  <p className="min-w-0 truncate text-2xl">
                    {setAvatarFallbackString(receiverName!)}
                  </p>
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-xl font-bold">{receiverName}</p>
                <p className="text-primary font-bold">Ver lista de presentes</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex w-full items-center justify-center">
            <LoaderCircleIcon className="text-primary animate-spin pr-1" />
          </div>
        )}
      </div>
    </div>
  )
}
