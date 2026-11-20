'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <main className="layout-container flex min-h-[70dvh] flex-col items-center justify-center">
      <div className="surface-panel p-10 text-center">
        <h2 className="page-heading">Something went wrong!</h2>
        <Button
          className="mt-6"
          onClick={
            // Attempt to recover by trying to re-render route
            () => reset()
          }
        >
          Try again
        </Button>
      </div>
    </main>
  )
}
