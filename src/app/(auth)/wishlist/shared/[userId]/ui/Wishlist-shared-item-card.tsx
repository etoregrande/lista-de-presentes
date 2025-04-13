import { Dispatch, SetStateAction, useRef, useState } from "react"
import Image from "next/image"
import { WishlistItem } from "@/types/wishlistItem"
import { setImageSrc } from "../actions"
import { AnimatePresence } from "framer-motion"
import { WishlistSharedItemCardDetail } from "./Wishlist-shared-item-card-detail"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import clsx from "clsx"
import { motion } from "framer-motion"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface WishlistSharedItemCardProps {
    wishlistItem: WishlistItem
    setWishlist: Dispatch<SetStateAction<WishlistItem[]>>
}

export const WishlistSharedItemCard = ({ wishlistItem, setWishlist }: WishlistSharedItemCardProps) => {
    const [openedWishlistItem, setOpenedWishlistItem] = useState<WishlistItem | null>(null)
    const [openItem, setOpenItem] = useState<boolean>(false)
    const imageSrc = setImageSrc(wishlistItem)
    const ref = useRef<HTMLDivElement>(null)

    const handleOpenWishlistItemCardDetail = () => {
        setOpenedWishlistItem(wishlistItem)
    }

    const cardContent = (
        <motion.div
            ref={ref}
            onClick={handleOpenWishlistItemCardDetail}
            layout="position"
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            whileHover={{ y: -2 }}
            whileTap={{ y: 1 }}
            className={clsx(
                "group transition-[padding] duration-200 ease-in-out hover:bg-slate-50 flex flex-row gap-4 md:gap-0 md:flex-col rounded-xl",
                wishlistItem.is_purchased && "opacity-50 cursor-pointer",
            )}
        >
            <div className="h-full aspect-square relative overflow-hidden rounded-lg min-h-20 min-w-20">
                <Image
                    src={imageSrc}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                    alt="Imagem do produto"
                    className="object-cover transition-transform duration-200 ease-in-out group-hover:scale-102"
                    priority
                />
            </div>

            <div className="flex flex-row w-full gap-2 justify-between items-center md:min-h-15 py-2 group-hover:px-2 transition-all duration-200 ease-in-out">
                <div className="flex flex-col min-w-0">
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
    )

    return (
        <>
            <Sheet open={openItem} onOpenChange={setOpenItem}>
                <SheetTrigger asChild>
                    {cardContent}
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle className="truncate whitespace-nowrap overflow-hidden max-w-[90%]">{wishlistItem.name}</SheetTitle>
                        <SheetDescription>
                            Informações sobre o item que deseja ganhar
                        </SheetDescription>
                    </SheetHeader>
                    {
                        openedWishlistItem && <WishlistSharedItemCardDetail
                            wishlistItem={openedWishlistItem}
                            setWishlist={setWishlist}
                            setOpenedWishlistItem={setOpenedWishlistItem}
                        />
                    }
                </SheetContent>
            </Sheet>
        </>
    )
}

