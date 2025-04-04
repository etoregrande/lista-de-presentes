import Image from "next/image"
import placeholder from "@/../public/assets/image-placeholder.svg"
import clsx from "clsx"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button/button"
import { CreateWishlistItemFormDataType } from "@/types/wishlistItem"
import { Controller, SubmitHandler, useFormContext } from "react-hook-form"
import { authClient } from "@/lib/auth-client"
import { createWishlistItem } from "@/server/wishlistItem"
import { WishlistContext } from "../context/Wishlist-context"
import { useGetContext } from "../actions"
import { useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


export const WishlistItemCardForm = () => {
    const formHook = useFormContext<CreateWishlistItemFormDataType>()
    const {
        register,
        handleSubmit,
        reset,
        setFocus,
        formState: { errors, isSubmitting }
    } = formHook
    const {
        router,
        newItem,
        setNewItem
    } = useGetContext(WishlistContext)

    useEffect(() => {
        if (newItem) {
            setFocus("name");
        }
    }, [newItem, setFocus]);

    const handleCreateWishlistItem: SubmitHandler<CreateWishlistItemFormDataType> = async (formData: CreateWishlistItemFormDataType) => {

        const { data: session } = await authClient.getSession()
        if (!session) {
            throw new Error('Unable to get user data')
        }
        console.log(formData)
        await createWishlistItem(formData, session?.user.id);
        setNewItem(false)
        reset();
        router.refresh()
    };

    return (
        newItem &&
        <div
            key="newItem"
            className={clsx(
                "flex flex-row h-60 rounded-2xl drop-shadow-lg",
                isSubmitting ? "bg-gray-200" : "bg-white"
            )}
        >
            <div className="w-2/5 h-full relative">
                <Image
                    src={placeholder}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                    alt="Produto sem imagem"
                    className="object-cover rounded-l-2xl"
                    priority />
            </div>
            <div
                className="w-3/5 p-4 flex flex-col gap-2">
                <form
                    onSubmit={handleSubmit(handleCreateWishlistItem)}>
                    <Label htmlFor="Nome">Nome</Label>
                    <Input
                        {...register("name")}
                        id="name"
                        placeholder="Nome do item"
                    />
                    {errors.name && <div className="text-red-500">{errors.name.message}</div>}

                    <Label htmlFor="Nome">Preço</Label>
                    <Input
                        {...register("price")}
                        id="price"
                        type="number"
                        step="any"
                    />
                    {errors.price && <div className="text-red-500">{errors.price.message}</div>}

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="priority">Prioridade</Label>
                        <Controller
                            name="priority"
                            control={formHook.control}
                            defaultValue="normal"
                            render={({ field }) => (
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
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

                    <Button className="md:invisible">Enviar</Button>
                </form>
            </div>
        </div>
    )
}