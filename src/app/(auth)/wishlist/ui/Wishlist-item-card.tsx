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
            className="bg-white flex flex-row h-60 rounded-2xl hover:drop-shadow-xl hover:bg- transition-all active:bg-slate-100"
        >
            <div className="w-2/5 h-full relative">
                <Image
                    src={imageSrc}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                    alt="Imagem do produto"
                    className="object-cover rounded-l-2xl"
                    priority />
            </div>
            <div
                className="w-3/5 p-4 flex flex-col gap-2">
                <h2>{wishlistItem.name}</h2>
                {typeof wishlistItem.price === "number" && wishlistItem.price > 0 &&
                    <p className="break-words">{`R$ ${wishlistItem.price / 100}`}</p>
                }
                {wishlistItem.priority &&
                    <p className="break-words">Prioridade {wishlistItem.priority}</p>
                }
                {wishlistItem.link &&
                    <p className="break-words">{wishlistItem.link}</p>
                }
                {wishlistItem.description &&
                    <p className="break-words">{wishlistItem.description}</p>
                }
                {wishlistItem.is_active &&
                    <p className="break-words">{wishlistItem.is_active ? 'Ativo' : 'Inativo'}</p>
                }
            </div>
        </div>
    )
}