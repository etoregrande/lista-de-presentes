import { User } from '@/generated/prisma'

interface DrawResultProps {
  receiver: Partial<User> | null
}

export const DrawResult = ({ receiver }: DrawResultProps) => {
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
