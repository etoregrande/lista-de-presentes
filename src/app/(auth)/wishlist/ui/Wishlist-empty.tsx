type EmptyWishlistProps = {
    isEmpty: boolean
    newItem?: boolean
}

export const EmptyWishlist = ({ isEmpty, newItem }: EmptyWishlistProps) => {
    return (
        isEmpty && !newItem &&
        <div className="flex justify-center min-h-60">
            <p>Sua lista de desejos está vazia!</p>
        </div>
    )
}