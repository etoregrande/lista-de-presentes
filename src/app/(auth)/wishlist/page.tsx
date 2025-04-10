import React, { Suspense } from "react";
import { Wishlist } from "@/app/(auth)/wishlist/ui/Wishlist";
import { listWishlistItems } from "@/server/wishlistItem";
import { getSessionOnServer } from "@/server/session";
import { Session } from "@/lib/auth";


export default async function Page() {
    const wishlistItems = await listWishlistItems()
    const session: Session = await getSessionOnServer()

    return (
        <>
            <div className="pt-10">
                <Suspense fallback="Carregando...">
                    <Wishlist initialWishlist={wishlistItems} session={session} />
                </Suspense>
            </div>
        </>
    )
}
