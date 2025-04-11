import React from "react";
import { Wishlist } from "@/app/(auth)/wishlist/ui/Wishlist";
import { listWishlistItems } from "@/server/wishlistItem";
import { getSessionOnServer } from "@/server/session";
import { Session } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { avatarFallbackString } from "@/server/avatar";
import { getDisplayName } from "@/lib/utils";


export default async function Page() {
    const wishlistItems = await listWishlistItems()
    const session: Session = await getSessionOnServer()
    const avatarImage = session.user.image ?? ''


    return (
        <>
            <div className="flex justify-between items-center pt-16 pb-12 px-4 lg:px-0">
                <div className="w-full overflow-hidden">
                    <h1 className="truncate text-3xl md:text-4xl font-bold text-slate-900">
                        <span className="truncate block text-base md:text-lg font-normal text-slate-500">
                            Boas-vindas ao seu Presenteio,
                        </span>
                        {getDisplayName(session.user.name)}
                    </h1>
                </div>
                <Avatar className="w-20 h-20 md:w-30 md:h-30">
                    <AvatarImage src={avatarImage} />
                    <AvatarFallback className="text-4xl md:text-5xl">{avatarFallbackString(session.user.name)}</AvatarFallback>
                </Avatar>
            </div>
            <Wishlist initialWishlist={wishlistItems} session={session} />

        </>
    )
}
