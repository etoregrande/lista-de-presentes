import { WishlistItem } from "@/types/wishlistItem"
import Image from "next/image"
import placeholder from '@/../public/assets/image-placeholder.svg'

export const WishlistItemCard = (wishlistItem: WishlistItem) => {
    const imageSrc =
        wishlistItem.image && (wishlistItem.image.startsWith("http") || wishlistItem.image.startsWith("/"))
            ? wishlistItem.image
            : placeholder;

    return (
        <div
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