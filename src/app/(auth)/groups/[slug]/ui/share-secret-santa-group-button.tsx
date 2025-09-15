'use client'

import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import clsx from 'clsx'
import { Copy as CopyIcon, UserPlus as UserPlusIcon } from 'lucide-react'
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
import { useSecretSantaGroup } from '../context/context'

interface ShareSecretSantaGroupButtonProps {
  className?: string
}

export const ShareSecretSantaGroupButton = ({
  className,
}: ShareSecretSantaGroupButtonProps) => {
  const [copied, setCopied] = useState(false)
  const { secretSantaGroup } = useSecretSantaGroup()
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const sharedUrl = origin
    ? `${origin}/groups/${secretSantaGroup.slug}/join`
    : ''

  const handleCopySecretSantaGroupJoinUrl = async () => {
    navigator.clipboard.writeText(sharedUrl)

    setCopied(true)
    toast.success('Link copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Credenza>
        <CredenzaTrigger asChild>
          <Button size="icontext" className={className}>
            <UserPlusIcon />
            <span className="hidden md:inline">Convidar</span>
          </Button>
        </CredenzaTrigger>
        <CredenzaContent>
          <CredenzaHeader>
            <CredenzaTitle>Link de convite</CredenzaTitle>
            <CredenzaDescription>
              As pessoas podem entrar no seu amigo secreto através do link
              abaixo
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
                onClick={handleCopySecretSantaGroupJoinUrl}
                disabled={copied}
                size="icon"
              >
                <CopyIcon />
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
