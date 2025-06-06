import type { ColumnType, Insertable, Selectable, Updateable } from 'kysely'

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>

export type Timestamp = ColumnType<Date, Date | string, Date | string>

export interface AccountDB {
  accessToken: string | null
  accessTokenExpiresAt: Timestamp | null
  accountId: string
  createdAt: Timestamp
  id: string
  idToken: string | null
  password: string | null
  providerId: string
  refreshToken: string | null
  refreshTokenExpiresAt: Timestamp | null
  scope: string | null
  updatedAt: Timestamp
  userId: string
}

export interface SessionDB {
  createdAt: Timestamp
  expiresAt: Timestamp
  id: string
  ipAddress: string | null
  token: string
  updatedAt: Timestamp
  userAgent: string | null
  userId: string
}

export interface UserDB {
  createdAt: Timestamp
  email: string
  emailVerified: boolean
  id: string
  image: string | null
  name: string
  updatedAt: Timestamp
}

export interface VerificationDB {
  createdAt: Timestamp | null
  expiresAt: Timestamp
  id: string
  identifier: string
  updatedAt: Timestamp | null
  value: string
}

export interface WishlistItemDB {
  created_at: Generated<Timestamp>
  description: string | null
  id: Generated<string>
  image: string | null
  is_active: Generated<boolean>
  is_purchased: Generated<boolean>
  link: string | null
  name: string
  price: number | null
  priority: Generated<string>
  purchased_at: Timestamp | null
  user_id: string
}

export type WishlistItem = Selectable<WishlistItemDB>
export type NewWishlistItem = Insertable<WishlistItemDB>
export type UpdateWishlistItem = Updateable<WishlistItemDB>

export interface DB {
  account: AccountDB
  session: SessionDB
  user: UserDB
  verification: VerificationDB
  wishlist_item: WishlistItemDB
}
