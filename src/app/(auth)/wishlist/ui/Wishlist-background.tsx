export const WishlistBackground = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -right-60 -bottom-60 size-[550px] rounded-full bg-[var(--hero-end)] opacity-30 blur-3xl" />
      <div className="absolute -top-60 left-1/4 size-[500px] rounded-full bg-[var(--hero-start)] opacity-25 blur-3xl" />
    </div>
  )
}
