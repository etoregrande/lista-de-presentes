import Image from "next/image"
import placeholder from "@/../public/assets/image-placeholder.svg"
import clsx from "clsx"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button/button"
import { CreateWishlistItemFormDataType, WishlistItem } from "@/types/wishlistItem"
import { SubmitHandler, useFormContext } from "react-hook-form"
import { authClient } from "@/lib/auth-client"
import { createWishlistItem } from "@/server/wishlistItem"
import { Dispatch, useEffect, useRef } from "react"
import { redirect, useRouter } from "next/navigation"
import { toast } from "sonner"


interface WishlistItemCardNewProps {
    isOpen: boolean
    setIsOpen: (newItem: boolean) => void
    setWishlist: Dispatch<React.SetStateAction<WishlistItem[]>>
}


export const WishlistItemCardNew = ({ isOpen, setIsOpen, setWishlist }: WishlistItemCardNewProps) => {
    const formHook = useFormContext<CreateWishlistItemFormDataType>()
    const ref = useRef<HTMLDivElement>(null)
    const {
        register,
        handleSubmit,
        reset,
        setFocus,
        formState: { errors, isSubmitting }
    } = formHook

    useEffect(() => {
        if (isOpen) {
            setFocus("name");
        }
    }, [isOpen, setFocus]);

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
                reset();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, setIsOpen, reset]);

    const handleCreateWishlistItem: SubmitHandler<CreateWishlistItemFormDataType> = async (formData: CreateWishlistItemFormDataType) => {
        if (isSubmitting) return;

        const { data: session } = await authClient.getSession()
        if (!session) redirect('/login')

        const newWishlistItem = await createWishlistItem(formData, session?.user.id);
        setWishlist((prev) => [...prev, newWishlistItem as WishlistItem])

        setIsOpen(false)
        reset();
        toast.success("Item criado com sucesso!")
    };

    return (
        isOpen &&
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
            <form
                className="w-3/5 p-4 flex flex-col gap-2 justify-between"
                onSubmit={handleSubmit(handleCreateWishlistItem)}
            >
                <h2 className="">Novo item</h2>
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                        {...register("name")}
                        placeholder="" />
                    {errors.name && <div className="text-red-500 truncate">{errors.name.message}</div>}
                </div>

                <Button
                    className="md:invisible"
                    disabled={isSubmitting}
                >
                    Enviar
                </Button>
            </form>
        </div>
    )
}