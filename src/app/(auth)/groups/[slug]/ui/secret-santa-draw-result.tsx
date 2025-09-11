import { User } from '@/generated/prisma'

interface SecretSantaDrawResultProps {
  receiver: Partial<User> | null
}

export const SecretSantaDrawResult = ({
  receiver,
}: SecretSantaDrawResultProps) => {
  if (!receiver) {
    return <p>O sorteio ainda não foi realizado!</p>
  }

  const { email, name } = receiver

  return (
    <>
      <p>{name}</p>
      <p>{email}</p>
    </>
  )
}
