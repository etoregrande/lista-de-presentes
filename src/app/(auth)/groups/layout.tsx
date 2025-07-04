import Navbar from '@/components/ui/navbar/navbar'

export default async function WishlistLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}
