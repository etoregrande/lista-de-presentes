interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params

  return (
    <>
      <main className="layout-container flex flex-col gap-10 md:flex-row">
        <section className="flex w-full flex-col gap-10 md:w-2/3">
          <article className="grid w-full gap-2">
            <h2 className="text-lg font-bold">{slug}</h2>
          </article>
        </section>
      </main>
    </>
  )
}
