'use client'

import { authClient } from "@/lib/auth-client"
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button/button"
import { useState } from "react"


export const CopyWishlistButton = () => {
    const [copied, setCopied] = useState(false);

    const handleCopyWishlist = async () => {
        const { data: session } = await authClient.getSession()
        if (!session) {
            console.error('Could not get user Session')
            return
        }

        const userId = session.user.id
        navigator.clipboard.writeText(`${window.location.origin}/wishlist/shared/${userId}`)

        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }


    return (
        <Button
            onClick={handleCopyWishlist}
            disabled={copied}
        >
            {copied ? 'Link copiado!' : 'Copiar link da lista'}
        </Button>
    )
}
