'use client'

import { useCallback, useEffect, useState, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { followUser, unfollowUser } from '@/server/follow'

type FollowButtonProps = {
  userId: string
  name: string
  isLoggedIn: boolean
  initialFollowing: boolean
}

export function FollowButton({
  userId,
  name,
  isLoggedIn,
  initialFollowing,
}: FollowButtonProps) {
  const router = useRouter()
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [busy, setBusy] = useState(false)
  const intentKey = `follow:${userId}`

  const performFollow = useCallback(async () => {
    setBusy(true)
    try {
      await followUser(userId)
      setIsFollowing(true)
      toast.success(`Você está seguindo ${name}`)
      router.refresh()
    } catch {
      toast.error('Não foi possível seguir esta pessoa. Tente novamente.')
    } finally {
      setBusy(false)
    }
  }, [name, router, userId])

  useEffect(() => {
    if (!isLoggedIn || !sessionStorage.getItem(intentKey)) return
    sessionStorage.removeItem(intentKey)
    if (isFollowing) return
    startTransition(() => {
      void performFollow()
    })
  }, [intentKey, isFollowing, isLoggedIn, performFollow])

  async function handleFollow() {
    if (!isLoggedIn) {
      sessionStorage.setItem(intentKey, '1')
      const callbackUrl = `${window.location.pathname}${window.location.search}`
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
      return
    }
    await performFollow()
  }

  async function handleUnfollow() {
    setBusy(true)
    try {
      await unfollowUser(userId)
      setIsFollowing(false)
      toast.success(`Você deixou de seguir ${name}`)
      router.refresh()
    } catch {
      toast.error('Não foi possível deixar de seguir. Tente novamente.')
    } finally {
      setBusy(false)
    }
  }

  if (isFollowing) {
    return (
      <div className="flex shrink-0 flex-col items-center gap-1">
        <span className="border-border bg-card text-foreground inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-bold shadow-sm">
          <Heart
            className="fill-primary text-primary size-5"
            aria-hidden="true"
          />
          Seguindo
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={handleUnfollow}
        >
          Deixar de seguir
        </Button>
      </div>
    )
  }

  return (
    <Button
      type="button"
      size="lg"
      className="shrink-0"
      disabled={busy}
      onClick={handleFollow}
      aria-busy={busy}
    >
      {busy ? (
        <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
      ) : (
        <Heart className="size-5" aria-hidden="true" />
      )}
      Seguir
    </Button>
  )
}
