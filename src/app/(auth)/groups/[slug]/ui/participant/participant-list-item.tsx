import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { setAvatarFallbackString } from '@/lib/utils'
import { ArrowUpRight, UserXIcon as UserXIcon } from 'lucide-react'
import { ParticipantListItemRemoveButton } from './participant-list-item-remove-button'
import { useSecretSantaGroup } from '../../context/context'
import { useSession } from '@/lib/context/session/context'
import Link from 'next/link'

interface ParticipantProps {
  participantId: string
  participantName: string
  participantImage: string
}

export const ParticipantListItem = ({
  participantId,
  participantName,
  participantImage,
}: ParticipantProps) => {
  const { isOwner, secretSantaGroup } = useSecretSantaGroup()
  const session = useSession()

  if (!session) return null
  const { user } = session

  const allowRemoveParticipant =
    isOwner && user.id != participantId && !secretSantaGroup.isDrawn

  const content = (
    <>
      <Avatar className="border-primary/20 size-12 border">
        <AvatarImage src={participantImage} />
        <AvatarFallback className="bg-accent text-accent-foreground font-bold">
          {setAvatarFallbackString(participantName)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold" title={participantName}>
          {participantName}
        </p>
        {participantId === user.id && (
          <p className="text-muted-foreground truncate text-sm">{user.email}</p>
        )}
      </div>
      {participantId !== user.id && (
        <ArrowUpRight
          className="text-primary size-5 shrink-0"
          aria-hidden="true"
        />
      )}
    </>
  )

  return (
    <div className="group flex w-full items-center gap-2">
      {participantId !== user.id ? (
        <Link
          href={`/wishlist/shared/${participantId}`}
          aria-label={`Ver lista de desejos de ${participantName}`}
          className="hover:bg-accent focus-visible:ring-ring flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          {content}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3 p-2">
          {content}
        </div>
      )}

      {allowRemoveParticipant && (
        <ParticipantListItemRemoveButton participantId={participantId}>
          <Button
            variant="secondary"
            size="icon"
            className="flex shrink-0"
            aria-label={`Remover ${participantName}`}
          >
            <UserXIcon />
          </Button>
        </ParticipantListItemRemoveButton>
      )}
    </div>
  )
}
