import React, { Suspense } from "react";
import { Wishlist } from "@/app/(auth)/wishlist/ui/Wishlist";
import { listWishlistItems } from "@/server/wishlistItem";
import { getSessionOnServer } from "@/server/session";
import { Session } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export default async function Page() {
    const wishlistItems = await listWishlistItems()
    const session: Session = await getSessionOnServer()
    const avatarImage = session.user.image ?? ''

    return (
        <>
            <div className="flex justify-between items-center py-10">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900">
                        <span className="block text-lg font-normal text-slate-500">
                            Boas-vindas ao seu Presenteio,
                        </span>
                        {session.user.name}
                    </h1>
                </div>
                <Avatar className="w-30 h-30">
                    <AvatarImage src={avatarImage} />
                    <AvatarFallback className="text-5xl">CN</AvatarFallback>
                </Avatar>
            </div>
            <Wishlist initialWishlist={wishlistItems} session={session} />

        </>
    )
}
