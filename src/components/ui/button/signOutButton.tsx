import { signOut } from "@/server/auth";
import { Button } from "@/components/ui/button/button";

export function SignOutButton() {
    return (
        <Button onClick={signOut}>Logout</Button>
    )
}