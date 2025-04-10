import { WishlistItem } from "@/types/wishlistItem"
import Image from "next/image"
import { setImageSrc } from "../actions"
import { AnimatePresence } from "framer-motion"
import { Dispatch, SetStateAction, useState } from "react"
import { WishlistItemCardDetail } from "./Wishlist-item-card-detail"
import { WishlistItemCardView } from "./Wishlist-item-card-view"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import clsx from "clsx"

interface WishlistItemCardProps {
    wishlistItem: WishlistItem
    mode: "edit" | "view"
    setWishlist: Dispatch<SetStateAction<WishlistItem[]>>
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
                        setWishlist={setWishlist}
                        setOpenedWishlistItem={setOpenedWishlistItem}
                    />
                }
            </AnimatePresence>
            <div
                onClick={handleOpenWishlistItemCardDetail}
                className={clsx(
                    "bg-white flex flex-col rounded-2xl transition-all border-2 sm:border-transparent hover:border-slate-200",
                    !wishlistItem.is_active && "opacity-50 cursor-pointer",
                    mode === "view" && wishlistItem.is_purchased && "opacity-50 cursor-pointer",
                )}
            >
                <div className="h-full aspect-square relative m-2">
                    <Image
                        src={imageSrc}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                        alt="Imagem do produto"
                        className="object-cover rounded-lg"
                        priority />
                </div>
                <div
                    className="flex flex-col gap-2 px-4 pb-4">
                    <div className="flex justify-between items-center gap-2">
                        <h2 className="truncate min-w-0 flex-shrink font-">{wishlistItem.name}</h2>
                        {typeof wishlistItem.price === "number" && wishlistItem.price > 0 &&
                            <p className="text-lg font-black text-burntorange-700 whitespace-nowrap flex-shrink-0">
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                }).format(wishlistItem.price / 100)}
                            </p>
                        }
                    </div>
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