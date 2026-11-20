import 'dotenv/config'
import { prisma } from '../src/lib/prisma'

if (process.env.SEED_DEMO_DATA !== 'true' || !['local', 'staging'].includes(process.env.APP_ENV || '')) {
  throw new Error('Demo seed requires SEED_DEMO_DATA=true and APP_ENV=local|staging')
}

const users = [
  { id: 'demo-etore', name: 'Etore Grande', email: 'etore@test.com' },
  { id: 'demo-enzo', name: 'Enzo Pequeno', email: 'etore2@test.com' },
  { id: 'demo-fernanda', name: 'Fernanda Azedo', email: 'etore3@test.com' },
  { id: 'demo-gustavo', name: 'Gustavo Lima', email: 'etore4@test.com' },
  { id: 'demo-maria', name: 'Maria Torniquete', email: 'etore5@test.com' },
] as const

const items = [
  { id: 'demo-item-1', userId: 'demo-etore', name: 'Livro de receitas', price: 8990, priority: 'normal' as const },
  { id: 'demo-item-2', userId: 'demo-etore', name: 'Fone de ouvido', price: 24990, priority: 'alta' as const },
  { id: 'demo-item-3', userId: 'demo-enzo', name: 'Jogo de tabuleiro', price: 14990, priority: 'normal' as const },
  { id: 'demo-item-4', userId: 'demo-fernanda', name: 'Caneca', price: 4990, priority: 'baixa' as const },
  { id: 'demo-item-5', userId: 'demo-gustavo', name: 'Caderno', price: 3990, priority: 'normal' as const },
  { id: 'demo-item-6', userId: 'demo-maria', name: 'Planta', price: 7990, priority: 'normal' as const },
] as const

const groups = [
  { id: 'demo-group-open', name: 'Amigo secreto de teste', slug: 'amigo-secreto-de-teste', isDrawn: false, priceLimit: 20000 },
  { id: 'demo-group-drawn', name: 'Amigo secreto sorteado', slug: 'amigo-secreto-sorteado', isDrawn: true, priceLimit: 15000 },
] as const

async function main() {
  const userIds = new Map<string, string>()
  for (const user of users) {
    const record = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { ...user, emailVerified: true },
    })
    userIds.set(user.id, record.id)
  }

  for (const item of items) {
    await prisma.wishlistItem.upsert({
      where: { id: item.id },
      update: {},
      create: { ...item, userId: userIds.get(item.userId)! },
    })
  }

  const groupIds = new Map<string, string>()
  for (const group of groups) {
    const record = await prisma.secretSantaGroup.upsert({
      where: { slug: group.slug },
      update: {},
      create: {
        ...group,
        ownerId: userIds.get('demo-etore')!,
        drawDate: group.isDrawn ? new Date('2026-11-01T12:00:00Z') : null,
      },
    })
    groupIds.set(group.id, record.id)
    for (const user of users) {
      const userId = userIds.get(user.id)!
      await prisma.userSecretSantaGroup.upsert({
        where: { userId_secretSantaGroupId: { userId, secretSantaGroupId: record.id } },
        update: {},
        create: { userId, secretSantaGroupId: record.id },
      })
    }
    for (const item of items) {
      await prisma.wishlistItemSecretSantaGroup.upsert({
        where: { wishlistItemId_secretSantaGroupId: { wishlistItemId: item.id, secretSantaGroupId: record.id } },
        update: {},
        create: { wishlistItemId: item.id, secretSantaGroupId: record.id },
      })
    }
  }

  const drawnGroup = await prisma.secretSantaGroup.findUniqueOrThrow({
    where: { id: groupIds.get('demo-group-drawn')! },
  })
  if (drawnGroup.isDrawn) {
    for (const [index, user] of users.entries()) {
      const draw = {
        groupId: drawnGroup.id,
        giverId: userIds.get(user.id)!,
        receiverId: userIds.get(users[(index + 1) % users.length].id)!,
      }
      await prisma.secretSantaDraw.upsert({
        where: { groupId_giverId: { groupId: draw.groupId, giverId: draw.giverId } },
        update: {},
        create: draw,
      })
    }
  }
  console.log('Demo seed ready: 5 users, 6 gifts, 2 groups')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
