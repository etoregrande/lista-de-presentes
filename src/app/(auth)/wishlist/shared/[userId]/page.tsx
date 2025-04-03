import { listWishlistItems } from "@/server/wishlistItem";
import { Suspense } from "react";
import { SharedWishlist } from "../../ui/Wishlist-shared";

interface SharedWishlistParams {
    params: Promise<{ userId: string }>;
}


export default async function SharedWishlistPage({ params }: SharedWishlistParams) {
    const { userId } = await params
    const wishlistItems = await listWishlistItems(userId)

    return (
        <>
            <div className="mt-4">
                <Suspense fallback="Loading...">
                    <SharedWishlist initialWishlist={wishlistItems} />
                </Suspense>
            </div>
        </>
    )
}
