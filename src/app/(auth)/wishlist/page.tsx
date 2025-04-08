import React, { Suspense } from "react";
import { SignOutButton } from "@/components/ui/button/signOutButton";
import { CopyWishlistButton } from "@/app/(auth)/wishlist/ui/Copy-wishlist-button";
import { Wishlist } from "@/app/(auth)/wishlist/ui/Wishlist";
import { listWishlistItems } from "@/server/wishlistItem";
import { getSessionOnServer } from "@/server/session";
import { redirect } from "next/navigation";


export default async function Page() {
    const session = await getSessionOnServer()
    if (!session) redirect('/login')

    const wishlistItems = await listWishlistItems()

    return (
        <>
            <div className="flex flex-col gap-2 mt-4">
                <div className="flex flex-row gap-2 mt-4 justify-between items-end">
                    <CopyWishlistButton userId={session.user.id} />
                    <SignOutButton />
                </div>
                <Suspense fallback="Carregando...">
                    <Wishlist initialWishlist={wishlistItems} />
                </Suspense>
            </div>
        </>
    )
}