'use client'

import { WishlistItem } from "@/types/wishlistItem"
import { setImageSrc } from "../../../actions"
import { Button } from "@/components/ui/button/button"
import Image from "next/image"
import Modal from "@/components/ui/modal"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { purchaseWishlistItem } from "@/server/wishlistItem"
import { Dispatch, SetStateAction } from "react"
import { useRouter } from "next/navigation"


interface WishlistSharedItemDetailProps {
    wishlistItem: WishlistItem
    setOpenedWishlistItem: (wishlistItem: WishlistItem | null) => void
    setWishlist: Dispatch<SetStateAction<WishlistItem[]>>
}

export const WishlistSharedItemCardDetail = ({
    wishlistItem,
    setOpenedWishlistItem,
    setWishlist
}: WishlistSharedItemDetailProps) => {
    const router = useRouter()

    const handleCloseModal = () => {
        setOpenedWishlistItem(null)
    }

    const setItemPurchased = async () => {
        if (!wishlistItem.id) throw new Error("Failed to get wishlist item id")
        const isPurchased = wishlistItem.is_purchased ? false : true
        const updatedWishlistItem = await purchaseWishlistItem(wishlistItem, isPurchased)

        try {
            if (!updatedWishlistItem) {
                alert("Parece que esse item já foi atualizado por outra pessoa. Atualize a página para ver a lista atualizada!");
                window.location.reload()
                return
            }
            setWishlist((prev) =>
                prev.map((item) =>
                    item.id === wishlistItem.id ? updatedWishlistItem as WishlistItem : item
                ))
            setOpenedWishlistItem(null)

        } catch (error) {
            console.error("Erro ao atualizar o item:", error);
            alert("Ocorreu um erro ao tentar atualizar o item.");
        }
    }

    const imageSrc = setImageSrc(wishlistItem)
    return (
        <Modal handleCloseModal={handleCloseModal}>
            <div className="flex flex-col md:flex-row gap-4 mb-80 md:mb-0">
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
                        <h2>{wishlistItem.name}</h2>
                        {wishlistItem.price && wishlistItem.price > 0 ?
                            <p className="break-words">{`R$ ${wishlistItem.price / 100}`}</p>
                            :
                            <p className="text-slate-400 break-words">Produto sem preço</p>
                        }

                        {wishlistItem.description ?
                            <p className="break-words text-sm">{wishlistItem.description}</p>
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
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant={wishlistItem.is_purchased ? "destructive" : "default"}>
                                    {
                                        wishlistItem.is_purchased ?
                                            "Desfazer compra"
                                            :
                                            "Marcar como comprado"
                                    }
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>
                                        {
                                            wishlistItem.is_purchased ?
                                                "Você quer desmarcar este item?"
                                                :
                                                "Você comprou este item?"
                                        }
                                    </DialogTitle>
                                    <DialogDescription>
                                        {
                                            wishlistItem.is_purchased ?
                                                "Se você marcou esse item como comprado por engano pode confirmar para torná-lo disponível novamente. Deseja confirmar?"
                                                :
                                                "Se você marcar como comprado, outras pessoas não vão comprar este produto. Deseja confirmar?"
                                        }
                                    </DialogDescription>
                                </DialogHeader>

                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary">
                                            Cancelar
                                        </Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                        <Button type="submit" onClick={setItemPurchased}>
                                            Confirmar
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        </Modal>
    )
}