'use client'

import { WishlistItem, EditWishlistItemFormDataType } from "@/types/wishlistItem"
import { setImageSrc } from "../actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button/button"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Controller, useForm } from "react-hook-form"
import { deleteWishlistItem, editWishlistItem } from "@/server/wishlistItem"
import { authClient } from "@/lib/auth-client"
import { Toggle } from "@/components/ui/toggle"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { LoaderCircle, Trash2 } from "lucide-react"
import { redirect } from "next/navigation"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { editWishlistItemFormSchema } from "@/schemas/wishlistItem"
import { Switch } from "@/components/ui/switch"


interface WishlistItemCardDetailProps {
    wishlistItem: WishlistItem
    setOpenedWishlistItem: (wishlistItem: WishlistItem | null) => void
    setWishlist: Dispatch<SetStateAction<WishlistItem[]>>
}


export const WishlistItemCardDetail = ({
    wishlistItem,
    setOpenedWishlistItem,
    setWishlist
}: WishlistItemCardDetailProps
) => {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        control,
        formState: { errors, isSubmitting }
    } = useForm<EditWishlistItemFormDataType>({
        resolver: zodResolver(editWishlistItemFormSchema),
        mode: "onChange",
        defaultValues: {
            name: wishlistItem?.name,
            description: wishlistItem?.description || undefined,
            price: wishlistItem?.price ? wishlistItem.price / 100 : undefined,
            link: wishlistItem?.link,
            priority: wishlistItem?.priority,
            isActive: wishlistItem?.is_active
        }
    })
    const [isLoading, setIsloading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const watchedImage = watch("image")?.[0]

    useEffect(() => {
        if (wishlistItem) {
            reset({
                name: wishlistItem.name,
                description: wishlistItem.description || undefined,
                price: wishlistItem.price ? wishlistItem.price / 100 : undefined,
                link: wishlistItem.link,
                priority: wishlistItem.priority,
                isActive: wishlistItem.is_active
            })
        }
    }, [wishlistItem, reset])

    useEffect(() => {
        const maxFileSize = 5 * 1024 * 1024;
        const imageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

        if (
            !watchedImage ||
            !imageTypes.includes(watchedImage.type) ||
            watchedImage.size > maxFileSize
        ) {
            setPreviewUrl(null)
            return
        }

        const objectUrl = URL.createObjectURL(watchedImage)
        setPreviewUrl(objectUrl)

        return () => URL.revokeObjectURL(objectUrl)
    }, [watchedImage])


    const handleCloseModal = () => {
        setOpenedWishlistItem(null)
        reset()
    }


    const handleDeleteWishlistItem = async () => {
        if (!wishlistItem.id) throw new Error('Unable to get wishlist item id')
        setWishlist((prev) => prev.filter((item) => item.id !== wishlistItem.id));
        setIsloading(true)

        await deleteWishlistItem(wishlistItem.id)

        setIsloading(false)
        handleCloseModal()
        toast.success("Item deletado com sucesso!")
    }


    const handleEditWishlistItem = async (formData: EditWishlistItemFormDataType) => {
        const { data: session } = await authClient.getSession()
        if (!session) redirect('/login')
        if (!wishlistItem.id) throw new Error('Unable to get wishlist item id')

        const updatedItem = await editWishlistItem(formData, wishlistItem.id, session.user.id)

        setWishlist((prev) =>
            prev.map((item) =>
                item.id === wishlistItem.id ?
                    {
                        ...updatedItem as WishlistItem
                    }
                    : item
            )
        )

        handleCloseModal()
        toast.success("Item editado com sucesso!")
    }

    const imageSrc = setImageSrc(wishlistItem)

    return (
        <>
            <div className="flex flex-col md:flex-row gap-4 mb-80 md:mb-0">
                <div className="md:w-1/2 w-full relative aspect-square md:aspect-auto md:h-auto max-h-80 md:max-h-none group">
                    <Label htmlFor="image" className="cursor-pointer block w-full h-full relative">
                        <Image
                            src={previewUrl || imageSrc}
                            alt="Imagem do produto"
                            fill
                            className="object-cover md:rounded-lg"
                            priority
                        />
                        <div className="absolute inset-0 text-center p-12 transition-[background-color] bg-black/40 hover:bg-black/60 flex items-center justify-center text-white text-sm md:text-base font-medium md:rounded-lg">
                            Clique para alterar a imagem
                        </div>
                    </Label>
                </div>


                <form
                    onSubmit={handleSubmit(handleEditWishlistItem)}
                    className="p-4 md:p-0 md:w-1/2 w-full flex flex-col flex-grow gap-4"
                >
                    <div className="flex flew-row justify-between items-center">
                        <Controller
                            control={control}
                            name="isActive"
                            render={({ field }) => (
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        id="isActive"
                                    />
                                    <Label htmlFor="isActive">
                                        {watch("isActive") ?
                                            "Produto visível"
                                            :
                                            "Produto invisível"}
                                    </Label>
                                </div>
                            )}
                        />

                        <Button
                            variant="secondary"
                            type="button"
                            size="icon"
                            onClick={handleDeleteWishlistItem}
                        >
                            {isLoading ?
                                <LoaderCircle className="animate-spin" />
                                :
                                <Trash2 />
                            }
                        </Button>
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="name" className="flex items-center justify-between gap-1">
                            Nome
                            <span className="text-muted-foreground text-xs">obrigatório</span>
                        </Label>
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

                    <div className="grid w-full items-center gap-1.5 hidden">
                        <Label htmlFor="image">Imagem do produto</Label>
                        <Input
                            {...register("image")}
                            id="image"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                        />
                        {errors.image && <div className="text-red-500">{String(errors.image.message)}</div>}
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="priority">Prioridade</Label>
                        <Controller
                            control={control}
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

                    {/* <Button
                            className="flex-1"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {
                                isSubmitting ?
                                    <LoaderCircle className="animate-spin" />
                                    :
                                    "Salvar"
                            }
                        </Button> */}

                </form>
            </div>
        </>
    )
}