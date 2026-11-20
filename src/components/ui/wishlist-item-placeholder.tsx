import { cn } from '@/lib/utils'

export function WishlistItemPlaceholder({
  className,
}: {
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 320 320"
      fill="none"
      role="img"
      aria-label="Imagem ilustrativa de um presente"
      className={cn('text-primary', className)}
    >
      <rect x="77" y="130" width="166" height="119" rx="18" fill="var(--secondary-foreground)" />
      <rect x="63" y="112" width="194" height="42" rx="12" fill="var(--primary)" />
      <path d="M160 113v136M130 113h60" stroke="var(--secondary)" strokeWidth="14" strokeLinecap="round" />
      <path d="M160 110c-27-3-48-14-48-31 0-12 11-20 23-17 18 4 25 27 25 48Zm0 0c27-3 48-14 48-31 0-12-11-20-23-17-18 4-25 27-25 48Z" stroke="currentColor" strokeWidth="12" strokeLinejoin="round" />
      <circle cx="69" cy="77" r="5" fill="var(--decorative)" />
      <circle cx="249" cy="78" r="4" fill="var(--decorative)" />
      <path d="m80 193-9 5 9 5 5 9 5-9 9-5-9-5-5-9-5 9ZM242 205l-7 4 7 4 4 7 4-7 7-4-7-4-4-7-4 7Z" fill="var(--decorative)" />
    </svg>
  )
}
