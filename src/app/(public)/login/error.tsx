'use client'

import { ErrorFallback } from '@/components/ui/error-fallback'

export default function Error(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorFallback {...props} publicPage />
}
