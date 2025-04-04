import { WishlistItem } from "@/types/wishlistItem"
import Image from "next/image"
import { setImageSrc, useGetContext } from "../actions"
import { WishlistContext } from "../context/Wishlist-context"
import { useSearchParams } from "next/navigation"

interface WishlistItemCardProps {
    wishlistItem: WishlistItem
}

export const WishlistItemCard = ({ wishlistItem }: WishlistItemCardProps) => {
    const { router } = useGetContext(WishlistContext)
    const searchParams = useSearchParams()
    const imageSrc = setImageSrc(wishlistItem)

    const handleOpenWishlistItemCardDetails = () => {
        console.log('Card click')
        const params = new URLSearchParams(searchParams.toString())
        if (!wishlistItem.id) {
            throw new Error('Unable to get wishlist item id')
        }

        params.set('item', wishlistItem.id)
        router.push(`wishlist?item=${wishlistItem.id}`, { scroll: false })
    }

    return (
        <div
            onClick={handleOpenWishlistItemCardDetails}
            className="bg-white flex flex-row h-60 rounded-2xl hover:drop-shadow-xl hover:bg- transition-all"
        >
            <div className="w-2/5 h-full relative">
                <Image
                    src={imageSrc}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                    alt="Produto sem imagem"
                    className="object-cover rounded-l-2xl"
                    priority />
            </div>
            <div
                className="w-3/5 p-4 flex flex-col gap-2">
                <h2>{wishlistItem.name}</h2>
                <p className="break-words">{wishlistItem.price}</p>
                <p className="break-words">Prioridade {wishlistItem.priority}</p>
                <p className="break-words">{wishlistItem.description}</p>
                <p className="break-words">{wishlistItem.is_active ? 'Ativo' : 'Inativo'}</p>
            </div>
        </div>
    )
}