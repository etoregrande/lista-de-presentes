import { getSessionOnServer } from '@/server/session'
import NavbarContent from './navbar-content'

export default async function Navbar() {
    const session = await getSessionOnServer()

    return <NavbarContent session={session} />
}
