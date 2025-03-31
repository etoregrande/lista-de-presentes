import { Suspense } from "react";
import { Wishlist } from "@/components/ui/wishlist/wishlist";

interface SharedWishlistParams {
    params: Promise<{ user_id: string }>;
}

export default async function SharedWishlist({ params }: SharedWishlistParams) {
    const { user_id } = await params

    return (
        <>
            <div className="mt-4">
                <Suspense fallback="Loading...">
                    <Wishlist user_id={user_id} />
                </Suspense>
            </div>
        </>
    )
}
