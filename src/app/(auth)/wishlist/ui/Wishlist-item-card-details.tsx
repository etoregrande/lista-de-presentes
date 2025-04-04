'use client'

import { CreateWishlistItemFormDataType, WishlistItem } from "@/types/wishlistItem"
import { setImageSrc, useGetContext } from "../actions"
import { WishlistContext } from "../context/Wishlist-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button/button"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Controller, useFormContext } from "react-hook-form"

interface WishlistItemCardDetailProps {
    wishlistItem: WishlistItem | undefined
}

export const WishlistItemCardDetails = ({ wishlistItem }: WishlistItemCardDetailProps) => {
    const { router } = useGetContext(WishlistContext)
    const formHook = useFormContext<CreateWishlistItemFormDataType>()
    const {
        register,
        handleSubmit,
        reset,
        setFocus,
        formState: { errors, isSubmitting }
    } = formHook

    if (!wishlistItem) return null
    const imageSrc = setImageSrc(wishlistItem)

    const handleEditWishlistItem = async (formData: CreateWishlistItemFormDataType) => {

    }

    return (

        <div
            onClick={() => router.push('/wishlist', { scroll: false })}
            className="flex fixed inset-0 z-50 items-center justify-center md:bg-[rgba(0,0,0,0.5)]"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="flex flex-col bg-white md:p-6 md:rounded-2xl shadow-lg w-full md:max-w-xl h-full md:h-auto overflow-y-auto"
            >
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="md:w-1/2 w-full relative aspect-square md:aspect-auto md:h-auto max-h-80 md:max-h-none">
                        <Image
                            src={imageSrc}
                            alt="Imagem do produto"
                            fill
                            className="object-cover rounded-lg"
                            priority />
                    </div>

                    <div className="p-4 md:p-0 md:w-1/2 w-full flex flex-col flex-grow gap-4">
                        <h2 className="">{wishlistItem?.name}</h2>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="name">Nome</Label>
                            <Input
                                {...register("name")}
                                placeholder="" />
                            {errors.name && <div className="text-red-500">{errors.name.message}</div>}
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                {...register("description")}
                                placeholder="" />
                            {errors.description && <div className="text-red-500">{errors.description.message}</div>}
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="price">Preço</Label>
                            <Input
                                {...register("price")}
                                type="number"
                                step="any"
                                placeholder="" />
                            {errors.price && <div className="text-red-500">{errors.price.message}</div>}
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="link">Link do produto</Label>
                            <Input
                                {...register("link")}
                                placeholder="" />
                            {errors.link && <div className="text-red-500">{errors.link.message}</div>}
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="image">Imagem do produto</Label>
                            <Input
                                {...register("image")}
                                id="image"
                                type="file"
                            />
                            {errors.image && <div className="text-red-500">{String(errors.image.message)}</div>}
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="priority">Prioridade</Label>
                            <Controller
                                control={formHook.control}
                                name="priority"
                                defaultValue="normal"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Selecione a prioridade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="alta">Alta</SelectItem>
                                            <SelectItem value="normal">Normal</SelectItem>
                                            <SelectItem value="baixa">Baixa</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.priority && <div className="text-red-500">{errors.priority.message}</div>}
                        </div>

                        <div className="flex gap-3 justify-end">
                            <Button
                                onClick={() => router.push('/wishlist', { scroll: false })}
                                variant={"secondary"}
                            >
                                Cancelar
                            </Button>
                            <Button>Salvar</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}