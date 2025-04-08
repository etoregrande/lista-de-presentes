import { listWishlistItems } from "@/server/wishlistItem";
import { Suspense } from "react";
import { SharedWishlist } from "../../ui/Wishlist-shared";
import { getUserById } from "@/lib/repositories/UserRepository";

interface SharedWishlistParams {
    params: Promise<{ userId: string }>;
}


export default async function SharedWishlistPage({ params }: SharedWishlistParams) {
    const { userId } = await params
    const wishlistItems = await listWishlistItems(userId)
    const wishlistOwner = await getUserById(userId)
    if (!wishlistOwner) throw new Error('Error fetching wishlist owner')

    return (
        <>
            <div className="mt-10">
                <h1 className="mb-10">Lista de presentes de {wishlistOwner.name}</h1>
                <Suspense fallback="Loading...">
                    <SharedWishlist initialWishlist={wishlistItems} />
                </Suspense>
            </div>
        </>
    )
}
