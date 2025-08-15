import Image from 'next/image'

export const SecretSantaGroupBackground = () => {
  return (
    <>
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
