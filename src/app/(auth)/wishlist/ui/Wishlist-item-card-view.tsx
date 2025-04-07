'use client'

import { WishlistItem } from "@/types/wishlistItem"
import { setImageSrc } from "../actions"
import { Button } from "@/components/ui/button/button"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Modal from "@/components/ui/modal"


interface WishlistItemCardViewProps {
    wishlistItem: WishlistItem
    setOpenedWishlistItem: (wishlistItem: WishlistItem | null) => void
}


export const WishlistItemCardView = ({ wishlistItem, setOpenedWishlistItem }: WishlistItemCardViewProps) => {
    const router = useRouter()
    const [isLoading, setIsloading] = useState(false)

    const handleCloseModal = () => {
        setOpenedWishlistItem(null)
    }

    const imageSrc = setImageSrc(wishlistItem)
    return (
        <Modal handleCloseModal={handleCloseModal}>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/2 w-full relative aspect-square md:aspect-auto md:h-auto max-h-80 md:max-h-none">
                    <Image
                        src={imageSrc}
                        alt="Imagem do produto"
                        fill
                        className="object-cover rounded-lg"
                        priority
                    />
                </div>

                <div
                    className="p-4 md:p-0 md:w-1/2 w-full flex flex-col flex-grow gap-8 justify-between"
                >
                    <div className="flex flex-col gap-1">
                        <h2>{wishlistItem?.name}</h2>
                        {wishlistItem?.price && wishlistItem.price > 0 ?
                            <p className="break-words">{`R$ ${wishlistItem.price / 100}`}</p>
                            :
                            <p className="text-slate-400 break-words">Produto sem preço</p>
                        }

                        {wishlistItem.description ?
                            <p className="break-words text-sm">{wishlistItem?.description}</p>
                            :
                            <p className="text-slate-400 break-words">Produto sem descrição</p>
                        }

                        {wishlistItem.link ?
                            <a href={wishlistItem.link} target="_blank">Link do produto</a>
                            :
                            <p className="text-slate-400 break-words">Produto sem link</p>
                        }
                    </div>


                    <div className="flex gap-3 justify-end">
                        <Button
                            className="flex-1"
                        >
                            Marcar como comprado
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}