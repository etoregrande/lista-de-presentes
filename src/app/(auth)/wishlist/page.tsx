'use client'

import { Button } from "@/components/ui/button";
import { getSession } from "@/server/session";
import { signOut } from "@/server/users";
import { sign } from "crypto";
import { useState } from "react";

export default function Page() {
    const [loading, setLoading] = useState(false);

    const handleSignOut = async () => {
        setLoading(true);
        await signOut();
        setLoading(false);
    }

    return (
        <>
            <p>Wishlist Auth protected page</p>
            <Button onClick={handleSignOut} disabled={loading}>{loading ? 'Carregando...' : 'Logout'}</Button>
        </>
    )
}