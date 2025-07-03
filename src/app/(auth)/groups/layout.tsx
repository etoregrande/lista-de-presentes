import Image from 'next/image'
import Navbar from '@/components/ui/navbar/navbar'

export default async function WishlistLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Navbar />
      <Image
        src="/assets/wishlist/gift-bg.svg"
        alt="imagem de fundo"
        width={600}
        height={600}
        className="fixed -bottom-40 -left-40 -z-10 hidden opacity-50 lg:block"
      />
      <Image
        src="/assets/wishlist/gift2-bg.svg"
        alt="imagem de fundo"
        width={600}
        height={600}
        className="fixed -right-40 -bottom-40 -z-10 hidden opacity-50 lg:block"
      />
      <div className="layout-container">{children}</div>
    </>
  )
}
