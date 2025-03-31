import { Suspense } from "react";
import { Wishlist } from "@/components/ui/wishlist/wishlist";
import { CreateWishlistItemForm } from "@/components/ui/wishlist/CreateWishlistItemForm"
import { SignOutButton } from "@/components/ui/button/signOutButton";
import { CopyWishlistButton } from "@/components/ui/wishlist/CopyWishlistButton";


export default async function Page() {

    return (
        <>
            <div className="flex gap-2 mt-4">
                <SignOutButton />
                <CopyWishlistButton />
            </div>

            <Suspense fallback="Loading...">
                <Wishlist />
            </Suspense>
            <CreateWishlistItemForm />
        </>
    )
}