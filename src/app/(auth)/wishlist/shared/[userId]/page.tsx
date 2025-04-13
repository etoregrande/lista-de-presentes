import { listWishlistItems } from "@/server/wishlistItem";
import { WishlistShared } from "./ui/Wishlist-shared";
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
            <div className="pt-8 pb-16 lg:pb-0">
                <h1 className="block text-[var(--muted-foreground)] pb-8 px-4 md:px-8 lg:px-0 truncate">Você está vendo a lista de presentes de
                    <span className="block font-bold text-[var(--foreground)] text-2xl tracking-tight truncate">{wishlistOwner.name}</span>
                </h1>
                <WishlistShared initialWishlist={wishlistItems} />
            </div>
        </>
    )
}
