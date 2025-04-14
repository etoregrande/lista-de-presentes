import { signOut } from '@/server/auth'
import { Button } from '@/components/ui/button/button'
import { ReactNode } from 'react'

export function SignOutButton({ children }: { children: ReactNode }) {
    return <Button onClick={signOut}>{children}</Button>
}
