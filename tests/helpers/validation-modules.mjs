import { z } from 'zod'
import psl from 'psl'
import { loadModule } from './load-module.mjs'

// Real validation schemas, shared by action tests; only unrelated utility
// dependencies are stubbed. URL validation still uses the real domain parser.
const utils = loadModule('src/lib/utils.ts', {
  clsx: { clsx() {} },
  'tailwind-merge': { twMerge() {} },
  psl,
  nanoid: { nanoid() {} },
  slugify() {},
})
export const imageSchemas = loadModule('src/schemas/image.ts', { zod: { z } })
export const commonSchemas = loadModule('src/schemas/common.ts', { zod: { z } })
export const wishlistSchemas = loadModule('src/schemas/wishlistItem.ts', {
  zod: { z },
  './image': imageSchemas,
  './common': commonSchemas,
  '@/lib/utils': utils,
})
export const groupSchemas = loadModule('src/schemas/secretSantaGroup.ts', {
  zod: { z },
  './common': commonSchemas,
})
export const avatarSchemas = loadModule('src/schemas/avatarImage.ts', {
  zod: { z },
  './image': imageSchemas,
})
export const validationModules = {
  zod: { z },
  '@/schemas/common': commonSchemas,
  '@/schemas/wishlistItem': wishlistSchemas,
  '@/schemas/secretSantaGroup': groupSchemas,
  '@/schemas/avatarImage': avatarSchemas,
}
