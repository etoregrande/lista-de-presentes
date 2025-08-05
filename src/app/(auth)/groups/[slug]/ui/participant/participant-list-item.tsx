import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { setAvatarFallbackString } from '@/lib/utils'

interface ParticipantProps {
  userName: string
  userEmail: string
  userImage: string
}

export const ParticipantListItem = ({
  userName,
  userEmail,
  userImage,
}: ParticipantProps) => {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-12 w-12">
        <AvatarImage src={userImage} />
        <AvatarFallback className="bg-navbar-muted-foreground font-bold">
          {setAvatarFallbackString(userName)}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="truncate">{userName}</p>
        <p className="text-muted-foreground truncate text-sm">{userEmail}</p>
      </div>
    </div>
  )
}
