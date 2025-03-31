import { listWishListItems } from "@/server/wishlistItem"
import Image from "next/image";
import placeholder from '@/../public/assets/wishlist_item_placehold.webp'

interface WishlistProps {
    user_id?: string
}

export async function Wishlist({ user_id }: WishlistProps) {
    const wishlistItems = await listWishListItems(user_id)

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlistItems.map((item) => {
                const imageSrc =
                    item.image && (item.image.startsWith("http") || item.image.startsWith("/"))
                        ? item.image
                        : placeholder;

                return (
                    <div
                        key={item.id}
                        className="bg-white flex flex-row h-60 rounded-2xl hover:drop-shadow-xl transition-all"
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
                            <h1>{item.name}</h1>
                            <p className="break-words">{item.price}</p>
                            <p className="break-words">Prioridade {item.priority}</p>
                            <p className="break-words">{item.description}</p>
                            <p className="break-words">{item.is_active ? 'Ativo' : 'Inativo'}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    );
}
