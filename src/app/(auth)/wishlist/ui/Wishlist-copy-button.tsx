'use client'

import { Button } from '@/components/ui/button/button'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import clsx from 'clsx'
import { Copy, Share } from 'lucide-react'
import { toast } from 'sonner'
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from '@/components/ui/credenza'

interface WishlistCopyButtonProps {
  className?: string
  userId: string
}

export const WishlistCopyButton = ({
  className,
  userId,
}: WishlistCopyButtonProps) => {
  const [copied, setCopied] = useState(false)
  const [sharedUrl, setSharedUrl] = useState('')

  useEffect(() => {
    setSharedUrl(`${window.location.origin}/wishlist/shared/${userId}`)
  }, [userId])

  const handleCopyWishlist = async () => {
    const sharedUrl = `${window.location.origin}/wishlist/shared/${userId}`
    navigator.clipboard.writeText(sharedUrl)

    setCopied(true)
    toast.success('Link copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Credenza>
        <CredenzaTrigger asChild>
          <Button variant="secondary" size="icontext" className={className}>
            <Share />
            <span className="hidden md:inline">Compartilhar</span>
          </Button>
        </CredenzaTrigger>
        <CredenzaContent>
          <CredenzaHeader>
            <CredenzaTitle>Link de compartilhamento</CredenzaTitle>
            <CredenzaDescription>
              Recomendamos que você{' '}
              <span className="font-bold">não acesse</span> a lista
              compartilhada porque outras pessoas vão marcar os items que já
              compraram.
            </CredenzaDescription>
          </CredenzaHeader>
          <CredenzaBody>
            <div className="flex items-end gap-2">
              <Input
                name="url"
                placeholder="Carregando..."
                defaultValue={sharedUrl}
                disabled={copied}
                readOnly
                className={clsx(
                  'max-w-60',
                  copied && 'border-green-700 text-green-700'
                )}
              />
              <Button
                onClick={handleCopyWishlist}
                disabled={copied}
                size="icon"
              >
                <Copy />
              </Button>
            </div>
          </CredenzaBody>
          <CredenzaFooter className="md:hidden">
            <></>
          </CredenzaFooter>
        </CredenzaContent>
      </Credenza>
    </>
  )
}
