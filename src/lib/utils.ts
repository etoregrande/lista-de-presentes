import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getDisplayName = (fullName: string) => {
  if (!fullName?.trim()) return "Usuário"

  const names = fullName.trim().split(' ')
  const firstName = names[0]
  const lastName = names.length > 1 ? names[names.length - 1] : null

  return lastName ? `${firstName} ${lastName}` : firstName
}
