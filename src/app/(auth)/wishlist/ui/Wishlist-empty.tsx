import { useGetContext } from "../actions"
import { WishlistContext } from "../context/Wishlist-context"

type EmptyWishlistProps = {
    isEmpty: boolean
}

export const EmptyWishlist = ({ isEmpty }: EmptyWishlistProps) => {
    const { newItem } = useGetContext(WishlistContext)

    return (
        isEmpty && !newItem &&
        <div className="flex justify-center min-h-60">
            <p>Sua lista de desejos está vazia!</p>
        </div>
    )
}