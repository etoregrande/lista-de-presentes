'use client'

import { Button } from '@/components/ui/button'
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
import { useSession } from '@/lib/context/session/context'

interface WishlistShareButtonProps {
  className?: string
}

export const WishlistShareButton = ({
  className,
}: WishlistShareButtonProps) => {
  const [copied, setCopied] = useState(false)
  const [sharedUrl, setSharedUrl] = useState('')
  const session = useSession()

  useEffect(() => {
    if (!session) return
    setSharedUrl(
      `${window.location.origin}/wishlist/shared/${session?.user.id}`
    )
  }, [session])

  if (!session) return null

  const handleCopyWishlist = async () => {
    const sharedUrl = `${window.location.origin}/wishlist/shared/${session.user.id}`
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
              <span className="text-primary font-bold">não acesse</span> a lista
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
                  'h-11 max-w-60 md:h-9',
                  copied && 'border-green-700 text-green-700'
                )}
              />
              <Button
                autoFocus={true}
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
