import { WishlistItem } from "@/types/wishlistItem";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { createContext, Dispatch, ReactNode, SetStateAction, useState } from "react";

export type WishlistContextType = {
    newItem: boolean
    setNewItem: Dispatch<SetStateAction<boolean>>
    router: AppRouterInstance
};

export const WishlistContext = createContext<WishlistContextType | null>(null)

export const WishlistContextProvider = ({ children }: { children: ReactNode }) => {
    const router = useRouter()
    const [newItem, setNewItem] = useState(false)

    return (

        <WishlistContext.Provider value={{ router, newItem, setNewItem }}>
            {children}
        </WishlistContext.Provider>
    )
}

