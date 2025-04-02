import React, { Suspense } from "react";
import { SignOutButton } from "@/components/ui/button/signOutButton";
import { CopyWishlistButton } from "@/app/(auth)/wishlist/ui/CopyWishlistButton";
import { Wishlist } from "@/app/(auth)/wishlist/ui/Wishlist";
import { listWishlistItems } from "@/server/wishlistItem";


export default async function Page() {
    const wishlist = await listWishlistItems()

    return (
        <>
            <div className="flex flex-col gap-2 mt-4">
                <div className="flex flex-row gap-2 mt-4">
                    <SignOutButton />
                    <CopyWishlistButton />
                </div>
                <Suspense fallback="Carregando...">
                    <Wishlist initialWishlist={wishlist} />
                </Suspense>
            </div>
        </>
    )
}