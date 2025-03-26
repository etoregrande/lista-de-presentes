import {
    ColumnType,
    Insertable,
    Selectable,
    Updateable,
} from 'kysely'

export type Timestamp = ColumnType<Date, Date | string, Date | string>;


export interface Database {
    account: AccountTable;
    session: SessionTable;
    user: UserTable;
    verification: VerificationTable;
}

export interface UserTable {
    createdAt: Timestamp;
    email: string;
    emailVerified: boolean;
    id: string;
    image: string | null;
    name: string;
    updatedAt: Timestamp;
}
// You should not use the table schema interfaces directly. Instead, you should
// use the `Selectable`, `Insertable` and `Updateable` wrappers. These wrappers
// make sure that the correct types are used in each operation.
//
// Most of the time you should trust the type inference and not use explicit
// types at all. These types can be useful when typing function arguments.
export type User = Selectable<UserTable>
export type NewUser = Insertable<UserTable>
export type UserUpdate = Updateable<UserTable>


export interface AccountTable {
    accessToken: string | null;
    accessTokenExpiresAt: Timestamp | null;
    accountId: string;
    createdAt: Timestamp;
    id: string;
    idToken: string | null;
    password: string | null;
    providerId: string;
    refreshToken: string | null;
    refreshTokenExpiresAt: Timestamp | null;
    scope: string | null;
    updatedAt: Timestamp;
    userId: string;
}
export type Account = Selectable<AccountTable>
export type NewAccount = Insertable<AccountTable>
export type AccountUpdate = Updateable<AccountTable>


export interface SessionTable {
    createdAt: Timestamp;
    expiresAt: Timestamp;
    id: string;
    ipAddress: string | null;
    token: string;
    updatedAt: Timestamp;
    userAgent: string | null;
    userId: string;
}
export type Session = Selectable<SessionTable>
export type NewSession = Insertable<SessionTable>
export type SessionUpdate = Updateable<SessionTable>


export interface VerificationTable {
    createdAt: Timestamp | null;
    expiresAt: Timestamp;
    id: string;
    identifier: string;
    updatedAt: Timestamp | null;
    value: string;
}
export type Verification = Selectable<VerificationTable>
export type NewVerification = Insertable<VerificationTable>
export type VerificationUpdate = Updateable<VerificationTable>
