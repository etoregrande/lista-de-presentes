import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getDisplayName = (fullName: string) => {
  if (!fullName?.trim()) return undefined

  const names = fullName.trim().split(' ')
  const firstName = names[0]
  const lastName = names.length > 1 ? names[names.length - 1] : null

  return lastName ? `${firstName} ${lastName}` : firstName
}

export const setAvatarFallbackString = (name: string) => {
  if (!name) return 'NO'

  const splitName: string[] = name.trim().split(' ')

  if (splitName.length > 1) {
    const lastName = splitName.pop() as string

    const firstNameFirstLetter = splitName[0].charAt(0).toUpperCase()
    const lastNameFirstLetter = lastName[0].charAt(0).toUpperCase()

    return `${firstNameFirstLetter}${lastNameFirstLetter}`
  }

  const nameFirstLetter = splitName[0].charAt(0).toUpperCase()
  const nameSecondLetter = splitName[0].charAt(1).toUpperCase()

  return `${nameFirstLetter}${nameSecondLetter}`
}