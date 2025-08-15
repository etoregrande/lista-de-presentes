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
          participantId={participant.id || 'Usuário sem ID'}
          participantName={participant.name || 'Usuário sem nome'}
          participantEmail={participant.email || 'sem email'}
          participantImage={participant.image || ''}
        />
      ))}
    </>
  )
}
