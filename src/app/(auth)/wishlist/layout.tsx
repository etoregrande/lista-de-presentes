export default function WishlistLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-violet-100 min-h-screen">
      <div className="sm:max-w-7xl mx-auto px-4">
        {children}
      </div>
    </div>
  );
}
