import { Button } from "@/components/ui/button/button";
import { SignOutButton } from "@/components/ui/button/signOutButton";

export default function WishlistLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <>
      <nav className="bg-slate-100 h-14 w-full fixed top-0 z-50">
        <div className="sm:max-w-5xl mx-auto h-full flex items-center justify-between">
          <Button>Minha lista</Button>
          <SignOutButton>Sair</SignOutButton>
        </div>
      </nav>
      <main className="bg-white min-h-screen mt-14">
        <div className="sm:max-w-5xl mx-auto flex flex-col gap-4">
          {children}
        </div>
      </main>
    </>
  );
}
