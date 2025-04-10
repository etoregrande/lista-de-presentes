import 'dotenv/config'
import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from 'sonner';

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"]
})

export const metadata: Metadata = {
  title: "Presenteio",
  description: "Crie sua lista de presentes para seu aniversário ou evento",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${nunitoSans.variable} antialiased bg-peachyellow-300`}
      >
        {process.env.NODE_ENV === "development" && (
          <div className="flex justify-center bg-red-500 text-white w-full p-2">
            <p>Development</p>
          </div>
        )}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
