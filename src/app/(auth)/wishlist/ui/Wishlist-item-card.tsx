import { WishlistItem } from "@/types/wishlistItem"
import Image from "next/image"
import { setImageSrc } from "../actions"
import { AnimatePresence } from "framer-motion"
import { Dispatch, SetStateAction, useState } from "react"
import { WishlistItemCardDetail } from "./Wishlist-item-card-detail"
import { WishlistItemCardView } from "./Wishlist-item-card-view"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface WishlistItemCardProps {
    wishlistItem: WishlistItem
    mode: "edit" | "view"
    setWishlist?: Dispatch<SetStateAction<WishlistItem[]>> | undefined
}

export const WishlistItemCard = ({ wishlistItem, mode, setWishlist }: WishlistItemCardProps) => {
    const [openedWishlistItem, setOpenedWishlistItem] = useState<WishlistItem | null>(null)
    const imageSrc = setImageSrc(wishlistItem)

    const handleOpenWishlistItemCardDetail = () => {
        setOpenedWishlistItem(wishlistItem)
    }

    return (
        <>
            <AnimatePresence>
                {
                    openedWishlistItem && mode === "edit" && setWishlist && <WishlistItemCardDetail
                        wishlistItem={openedWishlistItem}
                        setWishlist={setWishlist}
                        setOpenedWishlistItem={setOpenedWishlistItem}
                    />
                }
                {
                    openedWishlistItem && mode === "view" && <WishlistItemCardView
                        wishlistItem={openedWishlistItem}
                        setOpenedWishlistItem={setOpenedWishlistItem}
                    />
                }
            </AnimatePresence>
            <div
                onClick={handleOpenWishlistItemCardDetail}
                className={`
                    bg-white flex flex-row h-60 rounded-2xl transition-all hover:drop-shadow-xl hover:bg-slate-50
                    ${wishlistItem.is_active
                        ? "active:bg-slate-100 cursor-pointer"
                        : "opacity-50 cursor-pointer"}
                `}
            >
                <div className="w-2/5 h-full relative">
                    <Image
                        src={imageSrc}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                        alt="Imagem do produto"
                        className="object-cover rounded-l-2xl md:rounded-none"
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
                    {wishlistItem.description &&
                        <p className="truncate">{wishlistItem.description}</p>
                    }
                    {!wishlistItem.is_active &&
                        <div className="flex gap-1 items-center">
                            <p className="text-red-500">Produto invisível</p>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span>
                                            <Info className="text-red-500 cursor-pointer" size={20} />
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Este produto não vai aparecer na sua lista compartilhada</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    }
                </div>
            </div >
        </>
    )
}