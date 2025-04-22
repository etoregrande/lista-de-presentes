import './styles.css'
import Navbar from '@/components/ui/navbar/navbar'

export default async function WishlistLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Navbar />
      <main className="pb-40">
        <div className="layout-container">{children}</div>
      </main>
    </>
  )
}
