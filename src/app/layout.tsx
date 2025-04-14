import 'dotenv/config'
import '@/app/globals.css'
import type { Metadata } from 'next'
import { Nunito_Sans } from 'next/font/google'
import { Toaster } from 'sonner'

const nunitoSans = Nunito_Sans({
    variable: '--font-nunito-sans',
    subsets: ['latin'],
})

export const metadata: Metadata = {
    title: 'Presenteio',
    description: 'Crie sua lista de presentes para seu aniversário ou evento',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="pt-BR">
            <body
                className={`${nunitoSans.variable} bg-peachyellow-300 antialiased`}
            >
                {children}
                <Toaster />
            </body>
        </html>
    )
}
