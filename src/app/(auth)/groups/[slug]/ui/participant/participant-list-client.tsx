'use client'

import { User } from '@/generated/prisma'
import { ParticipantListItem } from './participant-list-item'

interface ParticipantListClientProps {
  participants: Partial<User>[]
}

export const ParticipantListClient = ({
  participants,
}: ParticipantListClientProps) => {
  return (
    <>
      {participants.map((participant) => (
        <ParticipantListItem
          key={participant.id}
          userName={participant.name || 'Usuário sem nome'}
          userEmail={participant.email || 'sem email'}
          userImage={participant.image || ''}
        />
      ))}
    </>
  )
}
