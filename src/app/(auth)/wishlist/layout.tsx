export default function WishlistLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <div className="bg-white min-h-screen">
      <div className="sm:max-w-7xl mx-auto px-4 flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
}
