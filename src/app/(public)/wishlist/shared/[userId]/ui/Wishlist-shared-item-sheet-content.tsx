import Image from 'next/image'
import { Dispatch, SetStateAction } from 'react'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { WishlistItem } from '@/generated/prisma'
import placeholder from '@/../public/assets/wishlist-item-placeholder.svg'
import { ExternalLink, Link2Off } from 'lucide-react'
import { Label } from '@/components/ui/label'

interface WishlistSharedItemSheetContentProps {
  wishlistItem: Partial<WishlistItem>
  setWishlist: Dispatch<SetStateAction<Partial<WishlistItem>[]>>
  setIsSheetOpen: Dispatch<SetStateAction<boolean>>
}

export const WishlistSharedItemSheetContent = ({
  wishlistItem,
}: WishlistSharedItemSheetContentProps) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-6 p-6">
        <AspectRatio
          ratio={16 / 9}
          className="bg-secondary-foreground rounded-md"
        >
          <Image
            src={wishlistItem.image ?? placeholder}
            alt="Imagem do produto"
            fill
            sizes="(max-width: 768px) 100vw, 350px"
            className="rounded-md object-cover"
            priority
          />
        </AspectRatio>

        <div className="space-y-2">
          <Label>Descrição</Label>
          {wishlistItem.description ? (
            <p className="text-muted-foreground break-words">
              {`"${wishlistItem.description}"`}
            </p>
          ) : (
            <p className="text-muted-foreground text-sm break-words">
              Produto sem descrição
            </p>
          )}
        </div>

        {wishlistItem.link ? (
          <a
            href={wishlistItem.link}
            target="_blank"
            className="border-border hover:bg-primary-foreground hover:border-primary-foreground transition-[background-color, border] flex gap-4 rounded-md border p-4 duration-200"
          >
            <ExternalLink className="text-primary" />
            <p>Link para comprar</p>
          </a>
        ) : (
          <div className="bg-muted flex gap-4 rounded-md p-4 duration-200">
            <Link2Off className="text-muted-foreground" />
            <p className="text-muted-foreground">Sem link para comprar</p>
          </div>
        )}
      </div>
    </div>
  )
}
