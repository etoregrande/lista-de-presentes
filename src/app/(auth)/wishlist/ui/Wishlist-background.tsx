// import { useSidebar } from '@/components/ui/sidebar'
import Image from 'next/image'

export const WishlistBackground = () => {
  // const { open } = useSidebar()

  return (
    <>
      {/* <Image
        src="/assets/wishlist/gift-bg.svg"
        alt="imagem de fundo"
        width={600}
        height={600}
        className={clsx(
          'fixed -bottom-40 -z-10 hidden opacity-50 transition-all duration-300 lg:block',
          open ? 'left-20' : '-left-40'
        )}
      /> */}
      <Image
        src="/assets/wishlist/gift2-bg.svg"
        alt="imagem de fundo"
        width={600}
        height={600}
        className="fixed -right-40 -bottom-40 -z-10 hidden opacity-50 lg:block"
      />
    </>
  )
}
