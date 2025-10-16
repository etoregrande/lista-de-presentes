import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { setAvatarFallbackString } from '@/lib/utils'
import { UserXIcon as UserXIcon } from 'lucide-react'
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

  return (
    <div className="group flex w-full items-center gap-2">
      <Avatar className="h-12 w-12">
        <AvatarImage src={participantImage} />
        <AvatarFallback className="bg-navbar-muted-foreground font-bold">
          {setAvatarFallbackString(participantName)}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="truncate" title={participantName}>
          {participantName}
        </p>
        {participantId != user.id ? (
          <Link
            href={`/wishlist/shared/${participantId}`}
            className="text-primary truncate text-sm hover:underline"
          >
            Ver lista de desejos
          </Link>
        ) : (
          <p className="text-muted-foreground truncate text-sm">{user.email}</p>
        )}
      </div>

      {allowRemoveParticipant && (
        <ParticipantListItemRemoveButton participantId={participantId}>
          <Button
            variant="secondary"
            size="icon"
            className="hidden md:group-hover:flex"
          >
            <UserXIcon />
          </Button>
        </ParticipantListItemRemoveButton>
      )}
    </div>
  )
}
