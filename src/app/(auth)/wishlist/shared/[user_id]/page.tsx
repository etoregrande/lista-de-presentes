import { Suspense } from "react";
import { Wishlist } from "@/components/ui/wishlist/wishlist";


export default async function Page({ params }: { params: { user_id: string } }) {
    return (
        <>
            <Suspense fallback="Loading...">
                <Wishlist user_id={params.user_id} />
            </Suspense>
        </>
    )
}