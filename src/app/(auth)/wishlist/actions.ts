import { WishlistItem } from "@/types/wishlistItem";
import placeholder from '@/../public/assets/image-placeholder.svg'


export const setImageSrc = (wishlistItem: WishlistItem) => {
    const imageSrc = wishlistItem.image && (wishlistItem.image.startsWith("http") || wishlistItem.image.startsWith("/"))
        ? wishlistItem.image
        : placeholder;

    return imageSrc
}