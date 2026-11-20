'use client'

import Image from 'next/image'
import { useSecretSantaGroup } from '../context/context'
import clsx from 'clsx'
import type { SecretSantaGroup } from '@/generated/prisma'
import { UsersRound } from 'lucide-react'

interface SecretSantaGroupNameProps {
  truncate?: boolean
}

export const SecretSantaGroupName = ({
  truncate,
}: SecretSantaGroupNameProps) => {
  const { secretSantaGroup } = useSecretSantaGroup()
  return (
    <SecretSantaGroupHeading group={secretSantaGroup} truncate={truncate} />
  )
}

export const SecretSantaGroupHeading = ({
  group: secretSantaGroup,
  truncate,
}: SecretSantaGroupNameProps & {
  group: Pick<SecretSantaGroup, 'name' | 'image'>
}) => {
  const shouldTruncate = secretSantaGroup.name.length > 100 || truncate

  return (
    <div className="flex w-full items-center gap-4">
      <div className="bg-secondary text-secondary-foreground border-border relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl border shadow-sm">
        {secretSantaGroup.image ? (
          <Image
            src={secretSantaGroup.image}
            alt=""
            fill
            className="object-cover object-center"
          />
        ) : (
          <UsersRound className="size-8" aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h1
          className={clsx(
            'min-w-0 text-2xl font-black tracking-tight md:text-3xl',
            shouldTruncate && 'truncate'
          )}
        >
          <span className="text-muted-foreground block text-base font-normal">
            Amigo secreto
          </span>
          <span>{secretSantaGroup.name}</span>
        </h1>
      </div>
    </div>
  )
}
