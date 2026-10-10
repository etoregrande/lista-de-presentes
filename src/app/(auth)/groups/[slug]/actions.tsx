'use server'

import {
  createSecretSantaGroupDraw,
  deleteSecretSantaGroup,
  leaveSecretSantaGroup,
  removeSecretSantaGroupParticipant,
} from '@/server/secretSantaGroup'

export async function deleteSecretSantaGroupAction(groupId: string) {
  try {
    return await deleteSecretSantaGroup(groupId)
  } catch {
    return { success: false, error: 'Unable to delete group' }
  }
}

export async function holdSecretSantaDrawAction(groupId: string) {
  try {
    return await createSecretSantaGroupDraw(groupId)
  } catch {
    return { success: false, error: 'Unable to hold draw' }
  }
}

export async function leaveSecretSantaGroupAction(groupId: string) {
  try {
    return await leaveSecretSantaGroup(groupId)
  } catch {
    return { success: false, error: 'Unable to leave group' }
  }
}

export async function removeSecretSantaGroupParticipantAction(
  groupId: string,
  participantId: string
) {
  try {
    return await removeSecretSantaGroupParticipant(groupId, participantId)
  } catch {
    return { success: false, error: 'Unable to remove participant' }
  }
}
