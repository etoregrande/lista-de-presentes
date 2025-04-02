import Image from "next/image"
import placeholder from "@/../public/assets/image-placeholder.svg"
import clsx from "clsx"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button/button"
import { CreateWishlistItemFormDataType } from "@/types/wishlistItem"
import { SubmitHandler, useFormContext } from "react-hook-form"
import { authClient } from "@/lib/auth-client"
import { createWishlistItem } from "@/server/wishlistItem"
import { WishlistContext } from "../context/WishlistContext"
import { useGetContext } from "../actions"



export const NewWishlistItemCard = () => {
    const formHook = useFormContext<CreateWishlistItemFormDataType>()
    const { register, handleSubmit, formState: { errors, isSubmitting } } = formHook
    const {
        router,
        newItem,
        setNewItem
    } = useGetContext(WishlistContext)

    const handleCreateWishlistItem: SubmitHandler<CreateWishlistItemFormDataType> = async (formData: CreateWishlistItemFormDataType) => {

        const { data: session } = await authClient.getSession()
        if (!session) {
            throw new Error('Unable to get user data')
        }

        setNewItem(false)
        await createWishlistItem(formData, session?.user.id);

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
                    />
                    {errors.price && <div className="text-red-500">{errors.price.message}</div>}
                    <Button className="md:invisible">Enviar</Button>
                </form>
                <Button onClick={() => { console.log(newItem) }}>newItem</Button>
            </div>
        </div>
    )
}