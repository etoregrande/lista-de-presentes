'use server'

import {
  createSecretSantaGroupDraw,
  deleteSecretSantaGroup,
  deleteSecretSantaGroupParticipant,
} from '@/server/secretSantaGroup'

export async function deleteSecretSantaGroupAction(
  userId: string,
  groupId: string
) {
  return await deleteSecretSantaGroup(userId, groupId)
}

export async function holdSecretSantaDrawAction(groupId: string) {
  return await createSecretSantaGroupDraw(groupId)
}

export async function leaveSecretSantaGroupAction(
  userId: string,
  groupId: string
) {
  return await deleteSecretSantaGroupParticipant(userId, groupId)
}
