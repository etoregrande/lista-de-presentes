import { WishlistItem } from "@/types/wishlistItem";
import placeholder from "@/../public/assets/image-placeholder.svg";

export const setImageSrc = (wishlistItem: WishlistItem) => {
  const image = wishlistItem.image;

  const imageSrc =
    typeof image === "string" &&
    (image.startsWith("http") ||
      image.startsWith("blob:") ||
      image.startsWith("/"))
      ? image
      : placeholder;

  return imageSrc;
};
