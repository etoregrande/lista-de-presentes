import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { setAvatarFallbackString } from '@/lib/utils'
import { UserXIcon as UserXIcon } from 'lucide-react'
import { ParticipantListItemRemoveButton } from './participant-list-item-remove-button'
import { useSecretSantaGroup } from '../../context/context'
import { useSession } from '@/lib/context/session/context'

interface ParticipantProps {
  participantId: string
  participantName: string
  participantEmail: string
  participantImage: string
}

export const ParticipantListItem = ({
  participantId,
  participantName,
  participantEmail,
  participantImage,
}: ParticipantProps) => {
  const { isOwner, secretSantaGroup } = useSecretSantaGroup()
  const { user } = useSession()

  const allowRemoveParticipant =
    isOwner && user.id != participantId && !secretSantaGroup.isDrawn

  return (
    <div className="group flex items-center gap-2">
      <div className="flex w-full items-center gap-2">
        <Avatar className="h-12 w-12">
          <AvatarImage src={participantImage} />
          <AvatarFallback className="bg-navbar-muted-foreground font-bold">
            {setAvatarFallbackString(participantName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate" title={participantName}>
            {participantName}
          </p>
          <p
            className="text-muted-foreground truncate text-sm"
            title={participantEmail}
          >
            {participantEmail}
          </p>
        </div>
      </div>
      {allowRemoveParticipant && (
        <ParticipantListItemRemoveButton participantId={participantId}>
          <Button
            variant={'secondary'}
            size={'icon'}
            className="md:hidden md:group-hover:flex"
          >
            <UserXIcon />
          </Button>
        </ParticipantListItemRemoveButton>
      )}
    </div>
  )
}
