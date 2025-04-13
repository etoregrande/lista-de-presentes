import React from "react";
import { Wishlist } from "./ui/Wishlist";
import { listWishlistItems } from "@/server/wishlistItem";
import { getSessionOnServer } from "@/server/session";
import { Session } from "@/lib/auth";
import { redirect } from "next/navigation";


export default async function Page() {
    const wishlistItems = await listWishlistItems()
    const session: Session | null = await getSessionOnServer()

    if (!session) redirect('/login')

    const avatarImage = session.user.image ?? ''


    return (
        <div className="pt-8 pb-16 lg:pb-0">
            <Wishlist initialWishlist={wishlistItems} session={session} />
        </div>
    )
}
