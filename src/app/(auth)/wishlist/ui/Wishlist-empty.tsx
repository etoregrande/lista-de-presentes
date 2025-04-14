import { PackageOpen } from 'lucide-react'

type EmptyWishlistProps = {
  isEmpty: boolean
  newItem?: boolean
}

export const EmptyWishlist = ({ isEmpty, newItem }: EmptyWishlistProps) => {
  return (
    isEmpty &&
    !newItem && (
      <div className="flex min-h-60 flex-col items-center justify-center gap-2 rounded-xl border-1 border-slate-200">
        <PackageOpen className="text-slate-300" />
        <p className="break-words text-slate-500">
          A lista de desejos está vazia
        </p>
      </div>
    )
  )
}
