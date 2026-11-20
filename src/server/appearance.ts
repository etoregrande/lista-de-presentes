'use server'

import { prisma } from '@/lib/prisma'
import { requireAuthenticatedUserId } from '@/server/session'
import {
  isAppearanceTheme,
  isPalette,
  type AppearanceTheme,
} from '@/lib/appearance'

export async function saveAppearance(palette: string, theme: AppearanceTheme) {
  if (!isPalette(palette) || !isAppearanceTheme(theme)) {
    throw new Error('Invalid appearance preference')
  }
  const id = await requireAuthenticatedUserId()
  await prisma.user.update({
    where: { id },
    data: { appearancePalette: palette, appearanceTheme: theme },
  })
}
