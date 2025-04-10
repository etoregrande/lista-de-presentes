'use client'

import { Button } from "@/components/ui/button/button"
import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import clsx from "clsx"
import { Copy } from "lucide-react"
import { toast } from "sonner"

interface CopyWishlistButtonProps {
    userId: string
}

export const CopyWishlistButton = ({ userId }: CopyWishlistButtonProps) => {
    const [copied, setCopied] = useState(false);
    const [sharedUrl, setSharedUrl] = useState("")

    useEffect(() => {
        setSharedUrl(`${window.location.origin}/wishlist/shared/${userId}`)
    }, [userId])

    const handleCopyWishlist = async () => {
        const sharedUrl = `${window.location.origin}/wishlist/shared/${userId}`
        navigator.clipboard.writeText(sharedUrl)

        setCopied(true);
        toast.success('Link copiado!')
        setTimeout(() => setCopied(false), 2000);
    }


    return (
        <div className="flex gap-2 items-end">
            <div className="grid items-center gap-1.5">
                <Label htmlFor="url">Lista compartilhada</Label>
                <Input
                    name="url"
                    defaultValue={sharedUrl}
                    disabled={copied}
                    readOnly
                    className={clsx(
                        "max-w-60",
                        copied && 'border-green-500 text-green-500'
                    )}
                />
            </div>
            <Button
                onClick={handleCopyWishlist}
                disabled={copied}
                size="icon"
            >
                <Copy />
            </Button>
        </div>
    )
}
