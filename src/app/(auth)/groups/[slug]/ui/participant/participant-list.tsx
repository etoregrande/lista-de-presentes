'use client'

import { useSecretSantaGroup } from '../../context/context'
import { ParticipantListItem } from './participant-list-item'

export const ParticipantList = () => {
  const { participants } = useSecretSantaGroup()

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
