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

interface SecretSantaDrawResultProps {
  receiver: Partial<User> | null
}

export const SecretSantaDrawResult = ({
  receiver,
}: SecretSantaDrawResultProps) => {
  const [revealed, setRevealed] = useState(false)

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

  const { name: receiverName, image } = receiver
  const receiverImage = image ?? ''

  return (
    <div
      className={clsx(
        'absolute h-full w-full cursor-pointer rounded-lg transition-all duration-500 ease-in-out transform-3d hover:scale-103',
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
        className="bg-muted-background hover:bg-primary/30 absolute flex h-full w-full rotate-x-180 items-center justify-between gap-6 rounded-lg p-8 duration-200 backface-hidden"
        onClick={() => setRevealed(false)}
      >
        <div className="flex min-w-0 items-center gap-4">
          <Avatar className="size-24">
            <AvatarImage src={receiverImage} />
            <AvatarFallback className="bg-white font-bold">
              <p className="min-w-0 truncate text-2xl">
                {setAvatarFallbackString(receiverName!)}
              </p>
            </AvatarFallback>
          </Avatar>
          <p className="truncate text-xl font-bold">{receiverName}</p>
        </div>
        <p className="font-bold">Esconder</p>
      </div>
    </div>
  )
}
