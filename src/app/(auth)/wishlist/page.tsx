import React from "react";
import { Wishlist } from "@/app/(auth)/wishlist/ui/Wishlist";
import { listWishlistItems } from "@/server/wishlistItem";
import { getSessionOnServer } from "@/server/session";
import { Session } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { avatarFallbackString } from "@/server/avatar";


export default async function Page() {
    const wishlistItems = await listWishlistItems()
    const session: Session = await getSessionOnServer()
    const avatarImage = session.user.image ?? ''

    return (
        <>
            <div className="flex justify-between items-center pt-12 lg:pt-10 pb-6 px-4 lg:px-0">
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
                    <AvatarFallback className="text-5xl">{avatarFallbackString(session.user.name)}</AvatarFallback>
                </Avatar>
            </div>
            <Wishlist initialWishlist={wishlistItems} session={session} />

        </>
    )
}
