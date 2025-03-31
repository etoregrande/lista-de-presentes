import { Suspense } from "react";
import { Wishlist } from "@/components/ui/wishlist/wishlist";
import { CreateWishlistItemForm } from "@/components/ui/wishlist/CreateWishlistItemForm"
import { SignOutButton } from "@/components/ui/button/signOutButton";


export default async function Page() {
    return (
        <>
            <p>Wishlist Auth protected page</p>
            <SignOutButton />
            <Suspense fallback="Loading...">
                <Wishlist />
            </Suspense>
            <CreateWishlistItemForm />
        </>
    )
}