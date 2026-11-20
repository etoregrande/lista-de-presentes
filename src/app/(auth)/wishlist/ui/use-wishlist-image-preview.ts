import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import type { WishlistItemFormData } from '@/types/wishlistItem'

export function useWishlistImagePreview() {
  const { watch, trigger } = useFormContext<WishlistItemFormData>()
  const image = watch('image')
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(
    null
  )

  useEffect(() => {
    if (!(image instanceof File)) return

    let cancelled = false
    let url: string | null = null
    trigger('image').then((isValid) => {
      if (cancelled) return
      if (isValid) {
        url = URL.createObjectURL(image)
        setPreview({ file: image, url })
      } else {
        setPreview(null)
      }
    })

    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [image, trigger])

  return preview && preview.file === image ? preview.url : null
}
