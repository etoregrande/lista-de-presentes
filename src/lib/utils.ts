import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import psl from 'psl'

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

export const getFirstName = (fullName: string) => {
  if (!fullName?.trim()) return undefined

  const names = fullName.trim().split(' ')
  const firstName = names[0]

  return firstName
}

export const getLastName = (fullName: string) => {
  if (!fullName?.trim()) return undefined

  const names = fullName.trim().split(' ')
  const lastName = names.length > 1 ? names[names.length - 1] : null

  return lastName
}

export const getDisplayPrice = (priceInCents: number) => {
  if (!Number.isInteger(priceInCents)) {
    throw new Error('The price must be an integer.')
  }

  const displayPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(priceInCents / 100)

  return displayPrice
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

export const capitalizeFirstLetter = (string: string) => {
  if (!string) return string
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

export const sanitizeLinkUrl = (link: string | null) => {
  const sanitizedLink =
    link && !link.startsWith('http://') && !link.startsWith('https://')
      ? `https://${link}`
      : link

  return sanitizedLink
}

export const isSafeUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)

    if (!['http:', 'https:'].includes(parsed.protocol)) return false

    const hostname = parsed.hostname.toLowerCase()

    if (
      hostname === 'localhost' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    )
      return false

    const ipRegex = /^(?:\d{1,3}\.){3}\d{1,3}$/
    if (ipRegex.test(hostname)) return false

    const parsedDomain = psl.parse(hostname)
    if ('domain' in parsedDomain && parsedDomain.domain) {
      return true
    }

    return false
  } catch {
    return false
  }
}
