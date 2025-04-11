// import Image from "next/image"
// import placeholder from "@/../public/assets/image-placeholder.svg"
// import clsx from "clsx"
// import { Label } from "@/components/ui/label"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button/button"
// import { CreateWishlistItemFormDataType, WishlistItem } from "@/types/wishlistItem"
// import { SubmitHandler, useFormContext } from "react-hook-form"
// import { authClient } from "@/lib/auth-client"
// import { createWishlistItem } from "@/server/wishlistItem"
// import { Dispatch, useEffect, useRef } from "react"
// import { redirect } from "next/navigation"
// import { toast } from "sonner"
// import { motion } from "framer-motion"


// interface WishlistItemCardNewProps {
//     newItem: boolean
//     setNewItem: (newItem: boolean) => void
//     setWishlist: Dispatch<React.SetStateAction<WishlistItem[]>>
// }


// export const WishlistItemCardNew = ({ newItem, setNewItem, setWishlist }: WishlistItemCardNewProps) => {
//     const formHook = useFormContext<CreateWishlistItemFormDataType>()
//     const ref = useRef<HTMLDivElement>(null)
//     const {
//         register,
//         handleSubmit,
//         reset,
//         setFocus,
//         formState: { errors, isSubmitting }
//     } = formHook

//     useEffect(() => {
//         setFocus("name");
//     }, [setFocus]);

//     useEffect(() => {
//         if (!newItem) return;

//         const handleClickOutside = (event: MouseEvent) => {
//             if (ref.current && !ref.current.contains(event.target as Node)) {
//                 setWishlist((prev) => prev.filter((item) => item.id !== "new"))
//                 setNewItem(false);
//                 reset();
//             }
//         };

//         document.addEventListener("mousedown", handleClickOutside);

//         return () => {
//             document.removeEventListener("mousedown", handleClickOutside);
//         };
//     }, [newItem, setNewItem, setWishlist, reset]);

//     const handleCreateWishlistItem: SubmitHandler<CreateWishlistItemFormDataType> = async (formData: CreateWishlistItemFormDataType) => {
//         if (isSubmitting) return;

//         const { data: session } = await authClient.getSession()
//         if (!session) redirect('/login')

//         const newWishlistItem = await createWishlistItem(formData, session?.user.id);
//         setWishlist((prev) =>
//             prev.map((item) => item.id === "new" ? newWishlistItem as WishlistItem : item)
//         );
//         setNewItem(false)

//         reset();
//         toast.success("Item criado com sucesso!")
//     };

//     return (
//         <motion.div
//             ref={ref}
//             key="newItem"
//             layout="position"
//             initial={{ opacity: 0, scale: 0.9 }
//             }
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, x: 20 }}
//             transition={{ duration: 0.1 }}
//             className={
//                 clsx(
//                     "group transition-all duration-200 ease-in-out bg-slate-50 flex flex-col rounded-xl",
//                     isSubmitting ?? "bg-gray-200"
//                 )}
//         >
//             <div className="flex-shrink h-full relative">
//                 <Image
//                     src={placeholder}
//                     fill
//                     sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
//                     alt="Produto sem imagem"
//                     className="object-cover rounded-l-2xl"
//                     priority />
//             </div>
//             <form
//                 className="flex flex-col py-4 px-2 transition-all duration-200 ease-in-out"
//                 onSubmit={handleSubmit(handleCreateWishlistItem)}
//             >
//                 <div className="grid w-full items-center gap-1.5">
//                     <Label htmlFor="name">Nome do item</Label>
//                     <Input
//                         {...register("name")}
//                         placeholder=""
//                     />
//                     {errors.name && <div className="text-red-500 text-sm truncate">{errors.name.message}</div>}
//                 </div>

//                 <Button
//                     className="md:hidden"
//                     disabled={isSubmitting}
//                 >
//                     Enviar
//                 </Button>
//             </form>
//         </motion.div >
//     )
// }