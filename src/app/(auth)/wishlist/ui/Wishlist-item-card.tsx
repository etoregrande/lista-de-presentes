import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { CreateWishlistItemFormDataType, WishlistItem } from "@/types/wishlistItem"
import { setImageSrc } from "../actions"
import { WishlistItemCardDetail } from "./Wishlist-item-card-detail"
import { Info, LoaderCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import clsx from "clsx"
import { motion } from "framer-motion"
import { SubmitHandler, useFormContext } from "react-hook-form"
import { redirect } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { createWishlistItem } from "@/server/wishlistItem"
import { toast } from "sonner"
import { Button } from "@/components/ui/button/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface WishlistItemCardProps {
    wishlistItem: WishlistItem
    mode: "edit" | "new"
    setNewItem?: Dispatch<SetStateAction<boolean>>
    setWishlist: Dispatch<SetStateAction<WishlistItem[]>>
}

export const WishlistItemCard = ({ wishlistItem, mode, setNewItem, setWishlist }: WishlistItemCardProps) => {
    const [openedWishlistItem, setOpenedWishlistItem] = useState<WishlistItem | null>(null)
    const [openItem, setOpenItem] = useState<boolean>(false)
    const imageSrc = setImageSrc(wishlistItem)
    const ref = useRef<HTMLDivElement>(null)

    const formHook = useFormContext<CreateWishlistItemFormDataType>()
    const {
        register,
        handleSubmit,
        reset,
        setFocus,
        formState: { errors, isSubmitting }
    } = formHook

    useEffect(() => {
        if (mode === "new") setFocus("name");
    }, [mode, setFocus]);

    useEffect(() => {
        if (mode != "new") return;

        const handleClickOutside = (event: MouseEvent) => {
            if (!setNewItem) return

            if (ref.current && !ref.current.contains(event.target as Node)) {
                setWishlist((prev) => prev.filter((item) => item.id !== "new"))
                reset();
                setNewItem(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [mode, setWishlist, setNewItem, reset]);

    const handleOpenWishlistItemCardDetail = () => {
        setOpenedWishlistItem(wishlistItem)
    }

    const handleCreateWishlistItem: SubmitHandler<CreateWishlistItemFormDataType> = async (formData: CreateWishlistItemFormDataType) => {
        if (isSubmitting) return;
        if (!setNewItem) return

        const { data: session } = await authClient.getSession()
        if (!session) redirect('/login')

        const newWishlistItem = await createWishlistItem(formData, session?.user.id);
        setWishlist((prev) =>
            prev.map((item) => item.id === "new" ? newWishlistItem as WishlistItem : item)
        );
        setNewItem(false);

        reset();
        toast.success("Item criado com sucesso!")
    };

    const cardContent = (
        <motion.div
            ref={ref}
            onClick={handleOpenWishlistItemCardDetail}
            layout={mode !== "new" ? "position" : false}
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            whileHover={mode !== "new" ? { y: -2 } : undefined}
            whileTap={mode !== "new" ? { y: 1 } : undefined}
            className={clsx(
                "group transition-[padding] duration-200 ease-in-out hover:bg-slate-50 flex flex-row gap-4 md:gap-0 md:flex-col rounded-xl",
                !wishlistItem.is_active && "opacity-50 cursor-pointer",
                mode === "new" && "bg-slate-50"
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

            {mode === "edit" &&
                <div className="overflow-hidden flex flex-row w-full gap-10 justify-between items-center md:min-h-15 py-2 group-hover:px-2 transition-all duration-200 ease-in-out">
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
            }

            {mode === "new" &&
                <form
                    className="flex flex-row justify-between w-full gap-2 items-center py-4 md:pl-4 pr-4 transition-all duration-200 ease-in-out"
                    onSubmit={handleSubmit(handleCreateWishlistItem)}
                >
                    <div className="grid w-full items-center gap-1.5">
                        <Input
                            {...register("name")}
                            placeholder="Nome do item"
                        />
                        {errors.name && <div className="text-red-500 text-sm truncate">{errors.name.message}</div>}
                    </div>

                    <Button
                        className="md:hidden"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ?
                            <LoaderCircle className="animate-spin" />
                            :
                            "Criar"
                        }
                    </Button>
                </form>
            }
        </motion.div>
    )

    return (
        mode === "edit" ? (
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
                        openedWishlistItem && mode === "edit" && setWishlist && <WishlistItemCardDetail
                            wishlistItem={openedWishlistItem}
                            setOpenedWishlistItem={setOpenedWishlistItem}
                            setWishlist={setWishlist}
                            setOpenItem={setOpenItem}
                        />
                    }
                </SheetContent>
            </Sheet>
        ) : (
            cardContent
        )
    )
}

