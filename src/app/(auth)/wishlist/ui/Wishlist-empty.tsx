import { PackageOpen } from "lucide-react"

type EmptyWishlistProps = {
    isEmpty: boolean
    newItem?: boolean
}

export const EmptyWishlist = ({ isEmpty, newItem }: EmptyWishlistProps) => {
    return (
        isEmpty && !newItem &&
        <div className="flex flex-col justify-center items-center gap-2 min-h-60 border-1 border-slate-200 rounded-xl">
            <PackageOpen className="text-slate-300" />
            <p className="text-slate-500 break-words">A lista de desejos está vazia</p>
        </div>
    )
}