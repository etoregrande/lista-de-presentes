import { WishlistItem } from "@/types/wishlistItem";
import { Context, useContext } from "react";
import placeholder from '@/../public/assets/image-placeholder.svg'

export function useGetContext<T>(context: Context<T | null>) {
    const contextParams = useContext(context);
    if (!contextParams) {
        throw new Error("Este componente deve ser usado dentro do contexto apropriado");
    }

    return contextParams;
}

export const setImageSrc = (wishlistItem: WishlistItem) => {
    const imageSrc = wishlistItem.image && (wishlistItem.image.startsWith("http") || wishlistItem.image.startsWith("/"))
        ? wishlistItem.image
        : placeholder;

    return imageSrc
}