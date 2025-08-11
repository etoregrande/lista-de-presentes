import { prisma } from '../src/lib/prisma'

console.log('🚀 Seed iniciado')

async function main() {
  // Erase previous data (dev only)
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  console.log('🔄 Limpou as tabelas user e account')

  const now = new Date()

  // Users
  const users = [
    {
      id: '3QwdkfB8Kk3l2LoQUg5kI5eKu9PwbomJ',
      name: 'Etore Grande',
      email: 'etore@test.com',
      emailVerified: true,
      image: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'DkjQiZVsVC1UXo5kgwSKRXUswcR8ce7U',
      name: 'Enzo Pequeno',
      email: 'etore2@test.com',
      emailVerified: true,
      image: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'GjTbMHQHMMuQCAG6ESH1qIXDHxyCI1yC',
      name: 'Fernanda Azedo Azedo',
      email: 'etore3@test.com',
      emailVerified: true,
      image: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'SDeuZwhft0qH4XSbeVOWW0o2H0aF1Pi6',
      name: 'Gustavo Lima',
      email: 'etore4@test.com',
      emailVerified: true,
      image: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'SEORaJS61rTUId2SEL39cGaRhPWeQALn',
      name: 'Torniquete Maria',
      email: 'etore5@test.com',
      emailVerified: true,
      image: null,
      createdAt: now,
      updatedAt: now,
    },
  ]

  for (const user of users) {
    const createdUser = await prisma.user.create({ data: user })
    console.log(`✅ Usuário criado: ${createdUser.name} (${createdUser.id})`)
  }

  // Accounts
  const accounts = [
    {
      id: 'J5zr2wOKiuRHAK7uJfOLgeuJm0ccFkQO',
      accountId: 'SDeuZwhft0qH4XSbeVOWW0o2H0aF1Pi6',
      providerId: 'credential',
      password:
        'bd7754a49e44f9d6c737ed7ec8909274:17789ff7ad3687dbba07f5102eaff1af3e3e723fbea5cc75f6d20174f5ca0a0c0f1acb4da55db40aef5cf21958234a917100e270e2600ee0dd60a1e676dadfe2',
      userId: 'SDeuZwhft0qH4XSbeVOWW0o2H0aF1Pi6',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'PerABHPMZsiAv4BoOCx7e8xKE5URTsLc',
      accountId: '3QwdkfB8Kk3l2LoQUg5kI5eKu9PwbomJ',
      providerId: 'credential',
      password:
        '482d156ec4407755a70917a5d19e5db9:da460a7040d1f1f5c47c806cc70951970b597e1fac1bd21332455833f41d61add98ed0bf35b31c93d0d0953975bc6e26944e13530817d9c30b25663c96b83a96',
      userId: '3QwdkfB8Kk3l2LoQUg5kI5eKu9PwbomJ',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'XzcDOpsMjBUWX8UTWVe8suTxDrkELYtn',
      accountId: 'DkjQiZVsVC1UXo5kgwSKRXUswcR8ce7U',
      providerId: 'credential',
      password:
        'f3c6aee8a6af79607ba98ca274f10de2:16a31230ca8680e0dc11c7644f776793ae33212710a3f88bbd3b91de71db9d2719dd56ee3f6b8d2f3c71dfcdb5fdd9a2133ed562ebde6132c8b74c7669cf2aa2',
      userId: 'DkjQiZVsVC1UXo5kgwSKRXUswcR8ce7U',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'YfyPNJLuAACjCS2K2Sqh2Bcg03KANeu3',
      accountId: 'GjTbMHQHMMuQCAG6ESH1qIXDHxyCI1yC',
      providerId: 'credential',
      password:
        '20a6a4e0ea121521a66a1598c7b92ec8:a5f0b36f211442632d9beb309f38ab2a3c162954c87bfe3ff4766c032b85db3d01dedf2d56905dab930dd967924dd93595d46d685463de9296de9efa6f5c33b3',
      userId: 'GjTbMHQHMMuQCAG6ESH1qIXDHxyCI1yC',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'ygqeRDs5LtrDKrKSchNeXLXK1CTXXDwh',
      accountId: 'SEORaJS61rTUId2SEL39cGaRhPWeQALn',
      providerId: 'credential',
      password:
        '0f51ea2fcc99d1a2122e158eabb1567c:2e9f057f65b93520ae10bede4073504b532b003a2d1e9fa5813005bbdef4544b62fef5122b025d6fa96910b433fe4372d13a92f8b268f16b6b430657fb11d7f1',
      userId: 'SEORaJS61rTUId2SEL39cGaRhPWeQALn',
      createdAt: now,
      updatedAt: now,
    },
  ]

  for (const account of accounts) {
    const createdAccount = await prisma.account.create({ data: account })
    console.log(
      `✅ Conta criada: ${createdAccount.id} para usuário ${createdAccount.userId}`
    )
  }

  console.log('🎉 Seed concluída com usuários e contas!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
