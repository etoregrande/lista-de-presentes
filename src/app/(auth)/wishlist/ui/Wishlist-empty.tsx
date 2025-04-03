type EmptyWishlistProps = {
    isEmpty: boolean
}

export const EmptyWishlist = ({ isEmpty }: EmptyWishlistProps) => {

    return (
        isEmpty &&
        <div className="flex justify-center min-h-60">
            <p>Sua lista de desejos está vazia!</p>
        </div>
    )
}