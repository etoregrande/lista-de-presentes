'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export function ErrorFallback({
  error,
  reset,
  publicPage = false,
}: {
  error: Error & { digest?: string }
  reset: () => void
  publicPage?: boolean
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main
      className={
        publicPage
          ? 'flex min-h-dvh flex-col items-center justify-center bg-[image:var(--gradient)] p-6'
          : 'layout-container flex min-h-[70dvh] flex-col items-center justify-center'
      }
    >
      <div className="surface-panel p-10 text-center">
        <h2 className="page-heading">Something went wrong!</h2>
        <Button className="mt-6" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  )
}
