'use client'

import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signOut } from "@/server/auth";
import { type CreateWishlistItemFormData } from "@/types/wishlistItem";
import { createWishlistItemFormSchema } from "@/schemas/wishlistItem";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function Page() {
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<CreateWishlistItemFormData>({
        // defaultValues: { email: "etore@test.com", password: "test1234" },
        resolver: zodResolver(createWishlistItemFormSchema)
    });

    const handleSignOut = async () => {
        setLoading(true);
        await signOut();
        setLoading(false);
    }

    const handleCreateWishListItem: SubmitHandler<CreateWishlistItemFormData> = async (data: CreateWishlistItemFormData) => {
        console.log('form submited')
        const response = await fetch("/api/wishlist", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            console.error("Error creating new item");
            return;
        }

        console.log(await response.json());
    }

    return (
        <>
            <p>Wishlist Auth protected page</p>
            <Button onClick={handleSignOut} disabled={loading}>{loading ? 'Carregando...' : 'Logout'}</Button>

            <form
                onSubmit={handleSubmit(handleCreateWishListItem)}
                className='flex flex-col space-y-4 justify-center px-4 h-screen max-w-sm mx-auto'
            >
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                        {...register("name")}
                        id="name"
                    />
                    {errors.name && <div className="text-red-500">{errors.name.message}</div>}
                </div>

                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                        {...register("description")}
                        id="description"
                    />
                    {errors.description && <div className="text-red-500">{errors.description.message}</div>}
                </div>

                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="price">Preço</Label>
                    <Input
                        {...register("price")}
                        id="price"
                        type="number"
                    />
                    {errors.price && <div className="text-red-500">{errors.price.message}</div>}
                </div>

                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="link">Link do produto</Label>
                    <Input
                        {...register("link")}
                        id="link"
                    />
                    {errors.link && <div className="text-red-500">{errors.link.message}</div>}
                </div>

                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="image">Imagem do produto</Label>
                    <Input
                        {...register("image")}
                        id="image"
                    />
                    {errors.image && <div className="text-red-500">{errors.image.message}</div>}
                </div>

                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select
                        {...register("priority")}
                        defaultValue="normal"
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue defaultValue={"1"} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="alta">Alta</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="baixa">Baixa</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.priority && <div className="text-red-500">{errors.priority.message}</div>}
                </div>
                <Button disabled={isSubmitting} type="submit">
                    {isSubmitting ? 'Carregando...' : '+ Novo'}

                </Button>
            </form>
        </>
    )
}