import { Suspense } from "react";
import { Wishlist } from "@/components/ui/wishlist/wishlist";

interface SharedWishlistProps {
    params: { user_id: string };
}

export default async function SharedWishlist({ params }: SharedWishlistProps) {
    return (
        <>
            <Suspense fallback="Loading...">
                <Wishlist user_id={params.user_id} />
            </Suspense>
        </>
    )
}