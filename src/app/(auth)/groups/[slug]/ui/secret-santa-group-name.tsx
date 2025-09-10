'use client'

import Image from 'next/image'
import { useSecretSantaGroup } from '../context/context'
import clsx from 'clsx'

interface SecretSantaGroupNameProps {
  truncate?: boolean
}

export const SecretSantaGroupName = ({
  truncate,
}: SecretSantaGroupNameProps) => {
  const { secretSantaGroup } = useSecretSantaGroup()
  const shouldTruncate = secretSantaGroup.name.length > 100 || truncate

  return (
    <div className="flex w-full items-center gap-4">
      <div className="bg-muted-background relative aspect-square h-16 w-16 rounded-md">
        <Image
          src={
            secretSantaGroup.image || '/assets/secretSanta/imageFallback.svg'
          }
          alt=""
          fill
          className="rounded-md object-cover object-center"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h1
          className={clsx(
            'min-w-0 text-2xl font-bold',
            shouldTruncate && 'truncate'
          )}
        >
          <span className="block text-base font-normal text-slate-500">
            Amigo secreto
          </span>
          <span>{secretSantaGroup.name}</span>
        </h1>
      </div>
    </div>
  )
}
