// 'use client'

// import { zodResolver } from "@hookform/resolvers/zod";
// import { type WishlistItemFormDataType } from "@/types/wishlistItem";
// import { createWishlistItemFormSchema } from "@/schemas/wishlistItem";
// import { Button } from "@/components/ui/button/button";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { SubmitHandler, useForm } from "react-hook-form";
// import { createWishlistItem } from "@/server/wishlistItem";
// import { authClient } from "@/lib/auth-client";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";


// export function CreateWishlistItemForm() {
//     const router = useRouter()
//     const [userId, setUserId] = useState<string>();

//     useEffect(() => {
//         const fetchSession = async () => {
//             const { data: session } = await authClient.getSession();
//             if (!session) {
//                 router.push("/login");
//             } else {
//                 setUserId(session.user.id);
//             }
//         };
//         fetchSession();
//     }, [router]);


//     const handleCreateWishlistItem: SubmitHandler<WishlistItemFormDataType> = async (data: WishlistItemFormDataType) => {
//         await createWishlistItem(data, userId!);
//         router.refresh()
//     };

//     return (
//         <form
//             onSubmit={handleSubmit(handleCreateWishlistItem)}
//             className='flex flex-col space-y-4 justify-center px-4 h-screen max-w-sm mx-auto'
//         >
//             <div className="grid w-full max-w-sm items-center gap-1.5">
//                 <Label htmlFor="name">Nome</Label>
//                 <Input
//                     {...register("name")}
//                     id="name"
//                 />
//                 {errors.name && <div className="text-red-500">{errors.name.message}</div>}
//             </div>

//             <div className="grid w-full max-w-sm items-center gap-1.5">
//                 <Label htmlFor="description">Descrição</Label>
//                 <Textarea
//                     {...register("description")}
//                     id="description"
//                 />
//                 {errors.description && <div className="text-red-500">{errors.description.message}</div>}
//             </div>

//             <div className="grid w-full max-w-sm items-center gap-1.5">
//                 <Label htmlFor="price">Preço</Label>
//                 <Input
//                     {...register("price")}
//                     id="price"
//                     type="number"
//                 />
//                 {errors.price && <div className="text-red-500">{errors.price.message}</div>}
//             </div>

//             <div className="grid w-full max-w-sm items-center gap-1.5">
//                 <Label htmlFor="link">Link do produto</Label>
//                 <Input
//                     {...register("link")}
//                     id="link"
//                 />
//                 {errors.link && <div className="text-red-500">{errors.link.message}</div>}
//             </div>

//             <div className="grid w-full max-w-sm items-center gap-1.5">
//                 <Label htmlFor="image">Imagem do produto</Label>
//                 <Input
//                     {...register("image")}
//                     id="image"
//                     type="file"
//                 />
//                 {errors.image && <div className="text-red-500">{String(errors.image.message)}</div>}
//             </div>

//             <div className="grid w-full max-w-sm items-center gap-1.5">
//                 <Label htmlFor="priority">Prioridade</Label>
//                 <Select
//                     {...register("priority")}
//                     defaultValue="normal"
//                 >
//                     <SelectTrigger className="w-full">
//                         <SelectValue defaultValue={"1"} />
//                     </SelectTrigger>
//                     <SelectContent>
//                         <SelectItem value="alta">Alta</SelectItem>
//                         <SelectItem value="normal">Normal</SelectItem>
//                         <SelectItem value="baixa">Baixa</SelectItem>
//                     </SelectContent>
//                 </Select>
//                 {errors.priority && <div className="text-red-500">{errors.priority.message}</div>}
//             </div>
//             <Button disabled={isSubmitting} type="submit">
//                 {isSubmitting ? 'Carregando...' : '+ Novo'}

//             </Button>
//         </form>
//     )

// }
