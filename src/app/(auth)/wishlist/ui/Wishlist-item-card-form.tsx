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
import { WishlistContext } from "../context/Wishlist-context"
import { useGetContext } from "../actions"
import { useEffect, useRef } from "react"


export const WishlistItemCardForm = () => {
    const formHook = useFormContext<CreateWishlistItemFormDataType>()
    const ref = useRef<HTMLDivElement>(null)
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

    useEffect(() => {
        if (!newItem) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setNewItem(false);
                reset();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [newItem, setNewItem, reset]);

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
            ref={ref}
            key="newItem"
            className={clsx(
                "flex flex-row h-60 rounded-2xl drop-shadow-lg border-4 border-slate-400",
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
                    onSubmit={handleSubmit(handleCreateWishlistItem)}
                    className="flex flex-col gap-4">
                    <h2 className="">Novo item</h2>
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                            {...register("name")}
                            placeholder="" />
                        {errors.name && <div className="text-red-500 truncate">{errors.name.message}</div>}
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="link">Link do produto</Label>
                        <Input
                            {...register("link")}
                            placeholder="" />
                        {errors.link && <div className="text-red-500">{errors.link.message}</div>}
                    </div>

                    <Button className="md:invisible">Enviar</Button>
                </form>
            </div>
        </div>
    )
}