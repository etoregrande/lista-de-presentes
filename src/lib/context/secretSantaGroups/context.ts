'use client'

import { createContext } from 'react'
import { SecretSantaGroup } from '@/generated/prisma'

export const SecretSantaGroupsContext = createContext<SecretSantaGroup[]>([])
