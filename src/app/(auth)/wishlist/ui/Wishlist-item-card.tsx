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
import { motion } from "framer-motion"

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

            <motion.div
                onClick={handleOpenWishlistItemCardDetail}
                layout="position"
                exit={{ opacity: 0, scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={clsx(
                    "group transition-[padding] duration-200 ease-in-out hover:bg-slate-50 flex flex-col rounded-xl",
                    !wishlistItem.is_active && "opacity-50 cursor-pointer",
                    mode === "view" && wishlistItem.is_purchased && "opacity-50 cursor-pointer",
                )}
                whileHover={{ y: -2 }}
                whileTap={{ y: 1 }}
            >
                <div className="h-full aspect-square relative overflow-hidden rounded-lg">
                    <Image
                        src={imageSrc}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                        alt="Imagem do produto"
                        className="object-cover transition-transform duration-200 ease-in-out group-hover:scale-102"
                        priority
                    />
                </div>

                <div className="flex flex-row justify-between lg:min-h-15 py-2 group-hover:px-2 transition-all duration-200 ease-in-out">
                    <div className="flex flex-col">
                        <p className="truncate font-bold tracking-tight">{wishlistItem.name}</p>
                        {typeof wishlistItem.price === "number" && wishlistItem.price > 0 &&
                            <p className="text-sm text-slate-500 whitespace-nowrap flex-shrink-0">
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                }).format(wishlistItem.price / 100)}
                            </p>
                        }
                    </div>

                    <div>
                        {!wishlistItem.is_active &&
                            <div className="flex gap-1 items-center">
                                <p className="text-red-500">Invisível</p>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="text-red-500 cursor-pointer" size={20} />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Este produto não vai aparecer na sua lista compartilhada</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        }
                    </div>
                </div>
            </motion.div>
        </>
    )
}

