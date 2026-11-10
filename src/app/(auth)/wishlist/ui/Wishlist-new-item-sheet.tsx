import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { WishlistItemFormData } from '@/types/wishlistItem'
import { LoaderCircle } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { createWishlistItemWithFeedback } from '@/server/wishlistItem'
import { toast } from 'sonner'
import { getWishlistSaveError } from '@/lib/wishlist-save-error'
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react'
import { WishlistItem } from '@/generated/prisma'
import { WishlistNewItemSheetForm } from './Wishlist-new-item-sheet-form'
import { useSession } from '@/lib/context/session/context'
import {
  Credenza,
  CredenzaBody,
  CredenzaContent,
  CredenzaDescription,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from '@/components/ui/credenza'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ProductPreview } from '@/lib/product-import/preview'

interface WishlistNewItemSheetProps {
  children: ReactNode
  setWishlist: Dispatch<SetStateAction<WishlistItem[]>>
}

export const WishlistNewItemSheet = ({
  children,
  setWishlist,
}: WishlistNewItemSheetProps) => {
  const {
    handleSubmit,
    setError,
    reset,
    formState: { isSubmitting },
  } = useFormContext<WishlistItemFormData>()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [importError, setImportError] = useState('')
  const [importMessage, setImportMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const requestRef = useRef<AbortController | null>(null)
  useEffect(() => () => requestRef.current?.abort(), [])

  const changeImportOpen = (open: boolean) => {
    requestRef.current?.abort()
    requestRef.current = null
    setIsLoading(false)
    setImportError('')
    if (open) setUrl('')
    setIsImportOpen(open)
  }

  const openDraft = (preview?: ProductPreview) => {
    let image: File | null = null
    if (preview?.image) {
      const bytes = Uint8Array.from(atob(preview.image.base64), (char) =>
        char.charCodeAt(0)
      )
      image = new File([bytes], 'produto.webp', { type: preview.image.type })
    }
    reset({
      name: preview?.name ?? '',
      description: preview?.description ?? '',
      price: preview?.price ?? null,
      link: preview?.link ?? '',
      image,
      priority: 'normal',
      isActive: true,
    })
    setImportMessage(preview?.message ?? '')
    changeImportOpen(false)
    setIsSheetOpen(true)
  }

  const importProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isLoading) return
    const controller = new AbortController()
    requestRef.current = controller
    setIsLoading(true)
    setImportError('')
    const timeout = setTimeout(() => controller.abort(), 60000)
    try {
      const response = await fetch('/api/products/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      })
      const data = await response.json()
      if (requestRef.current !== controller) return
      if (!response.ok) {
        setImportError(
          data.error ?? 'Não foi possível buscar o produto. Tente novamente.'
        )
        return
      }
      openDraft(data)
    } catch {
      if (requestRef.current === controller)
        setImportError(
          'A busca demorou demais ou a conexão falhou. Tente novamente ou preencha manualmente.'
        )
    } finally {
      clearTimeout(timeout)
      if (requestRef.current === controller) {
        requestRef.current = null
        setIsLoading(false)
      }
    }
  }

  const session = useSession()
  if (!session) return null

  const onSubmit = async (formData: WishlistItemFormData) => {
    try {
      const newItem = await createWishlistItemWithFeedback(formData)
      if (newItem && 'imageError' in newItem) {
        setError('image', { type: 'server', message: newItem.imageError })
        toast.error(newItem.imageError)
        return
      }
      if (!newItem) {
        toast.error('Erro ao criar novo item')
        return
      }
      setWishlist((prev) => [...prev, newItem])
      setIsSheetOpen(false)
      reset()
      toast.success('Item criado com sucesso!')
    } catch (error) {
      const failure = getWishlistSaveError(error)
      console.error('[wishlist-save-failed]', { code: failure.code })
      toast.error(failure.message, { duration: 12000 })
    }
  }

  return (
    <>
      <Credenza open={isImportOpen} onOpenChange={changeImportOpen}>
        <CredenzaTrigger asChild>{children}</CredenzaTrigger>
        <CredenzaContent
          onCloseAutoFocus={(event) => {
            if (isSheetOpen) event.preventDefault()
          }}
        >
          <CredenzaHeader>
            <CredenzaTitle>Adicionar um presente</CredenzaTitle>
            <CredenzaDescription>
              Cole o link do produto para buscar as informações. Você poderá
              revisar tudo antes de salvar.
            </CredenzaDescription>
          </CredenzaHeader>
          <CredenzaBody className="pb-6 md:pb-0">
            <form
              onSubmit={importProduct}
              className="space-y-4"
              aria-busy={isLoading}
            >
              <div className="space-y-2">
                <Label htmlFor="import-product-url">Link do produto</Label>
                <Input
                  id="import-product-url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://www.loja.com.br/produto"
                  inputMode="url"
                  autoComplete="off"
                  disabled={isLoading}
                  maxLength={4096}
                  required
                  aria-describedby={
                    importError ? 'import-product-error' : undefined
                  }
                />
              </div>
              {importError && (
                <p
                  id="import-product-error"
                  role="alert"
                  className="text-destructive text-sm"
                >
                  {importError}
                </p>
              )}
              <Button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="w-full"
              >
                {isLoading && (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                )}
                <span>
                  {isLoading ? 'Buscando informações…' : 'Buscar produto'}
                </span>
              </Button>
              <span role="status" className="sr-only">
                {isLoading ? 'Buscando informações do produto' : ''}
              </span>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  let link = ''
                  try {
                    const parsed = new URL(
                      /^https?:\/\//i.test(url) ? url : `https://${url}`
                    )
                    if (
                      ['https:', 'http:'].includes(parsed.protocol) &&
                      parsed.hostname.includes('.')
                    )
                      link = parsed.href
                  } catch {
                    /* Empty manual draft. */
                  }
                  openDraft({
                    name: '',
                    description: '',
                    price: null,
                    image: null,
                    link,
                    message: '',
                  })
                }}
              >
                Preencher manualmente
              </Button>
            </form>
          </CredenzaBody>
        </CredenzaContent>
      </Credenza>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="p-0">
          <SheetHeader className="border-border flex-none border-b p-6 text-left">
            <SheetTitle>Novo item</SheetTitle>
            <SheetDescription>
              {importMessage || 'Adicione informações ao seu novo item'}
            </SheetDescription>
          </SheetHeader>
          <WishlistNewItemSheetForm />
          <SheetFooter className="flex-none border-t p-6">
            <Button
              onClick={handleSubmit(onSubmit)}
              className="flex-1"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                'Salvar'
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
