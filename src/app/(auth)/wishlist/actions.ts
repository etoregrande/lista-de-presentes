import { Context, useContext } from "react"

export const getContext = (context: Context<any | null>) => {
    const contextParams = useContext(context)
    if (!contextParams) {
        throw new Error('NewWishlistItemCard must be used within a WishlistContextProvider')
    }

    return contextParams
}