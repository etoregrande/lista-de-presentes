'use server'

import { listSecretSantaGroupParticipants } from '@/server/secretSantaGroup'
import { ParticipantListClient } from './participant-list-client'

interface ParticipantListProps {
  groupId: string
}

export const ParticipantList = async ({ groupId }: ParticipantListProps) => {
  let participants = await listSecretSantaGroupParticipants(groupId)
  if (!participants) participants = []

  return <ParticipantListClient participants={participants} />
}
