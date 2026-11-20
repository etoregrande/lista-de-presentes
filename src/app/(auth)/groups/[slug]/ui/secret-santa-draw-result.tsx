'use client'

import type { User } from '@/generated/prisma'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { LoaderCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { setAvatarFallbackString } from '@/lib/utils'
import { Doodle1 } from './assets/doodle1'
import { Doodle2 } from './assets/doodle2'
import { Sprinkles1 } from './assets/sprinkles1'
import { Sprinkles2 } from './assets/sprinkles2'

interface SecretSantaDrawResultProps {
  receiver: Partial<User> | null
}

export const SecretSantaDrawResult = ({
  receiver,
}: SecretSantaDrawResultProps) => {
  const router = useRouter()
  const reducedMotion = useReducedMotion()
  const [revealed, setRevealed] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!receiver) {
    return (
      <div className="bg-muted relative flex min-h-40 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl">
        <Sprinkles2 className="text-primary absolute -top-6 left-0 hidden size-20 opacity-60 sm:block" />
        <p className="text-muted-foreground text-center break-words">
          O sorteio ainda não foi realizado
        </p>
        <Sprinkles1 className="text-primary absolute right-0 -bottom-6 hidden size-30 opacity-60 sm:block" />
      </div>
    )
  }

  return (
    <div className="h-40 w-full [perspective:1200px]">
      <motion.div
        className="relative h-full w-full"
        animate={{ rotateY: revealed ? 180 : 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.58, ease: [0.25, 0.8, 0.25, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <button
          type="button"
          onClick={() => setRevealed(true)}
          aria-hidden={revealed}
          tabIndex={revealed ? -1 : 0}
          className="group bg-muted hover:bg-accent border-border absolute inset-0 flex w-full items-center justify-center overflow-hidden rounded-2xl border p-5 text-center transition-[background-color,scale] duration-300 motion-safe:hover:scale-[1.015]"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'translateZ(1px)', pointerEvents: revealed ? 'none' : 'auto' }}
        >
          <Doodle1 className="text-primary absolute top-0 left-3 hidden h-full w-auto opacity-60 transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.12] md:block" />
          <span className="relative font-bold md:text-lg">
            <span className="md:hidden">Toque para revelar seu amigo secreto!</span>
            <span className="hidden md:inline">Clique para revelar seu amigo secreto!</span>
          </span>
          <Doodle2 className="text-primary absolute top-0 right-3 hidden h-full w-auto opacity-60 transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.12] md:block" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (loading || !receiver.id) return
            setLoading(true)
            router.push(`/wishlist/shared/${receiver.id}`)
          }}
          aria-hidden={!revealed}
          tabIndex={revealed ? 0 : -1}
          className="bg-muted-background hover:bg-accent border-border absolute inset-0 flex w-full items-center gap-4 overflow-hidden rounded-2xl border p-5 text-left transition-colors md:gap-6"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg) translateZ(1px)', pointerEvents: revealed ? 'auto' : 'none' }}
        >
          {loading ? (
            <LoaderCircle className="text-primary mx-auto size-6 animate-spin" aria-label="Abrindo lista" />
          ) : (
            <>
              <Avatar className="border-border size-16 shrink-0 border md:size-20">
                <AvatarImage src={receiver.image ?? ''} />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xl font-bold">
                  {setAvatarFallbackString(receiver.name ?? '')}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0">
                <span className="block truncate text-lg font-bold md:text-xl">{receiver.name}</span>
                <span className="text-primary block font-semibold">Ver lista de presentes</span>
              </span>
            </>
          )}
        </button>
      </motion.div>
    </div>
  )
}
