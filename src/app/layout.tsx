import 'dotenv/config'
import '@/app/globals.css'
import type { Metadata } from 'next'
import { Nunito_Sans } from 'next/font/google'
import { Toaster } from 'sonner'
import {
  CircleCheck,
  CircleX,
  Info,
  LoaderCircle,
  TriangleAlert,
} from 'lucide-react'

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
      <body className={`${nunitoSans.variable} min-h-dvh antialiased`}>
        {children}
        <Toaster
          icons={{
            success: <CircleCheck className="pr-1" />,
            info: <Info className="pr-1" />,
            warning: <TriangleAlert className="pr-1" />,
            error: <CircleX className="pr-1" />,
            loading: <LoaderCircle className="animate-spin pr-1" />,
          }}
          toastOptions={{
            classNames: {
              error:
                '!bg-[var(--error-background)] !text-[var(--error-foreground)] !border-[var(--error-border)]',
              success:
                '!bg-[var(--success-background)] !text-[var(--success-foreground)] !border-[var(--success-border)]',
              warning:
                '!bg-[var(--warning-background)] !text-[var(--warning-foreground)] !border-[var(--warning-border)]',
              info: '!bg-[var(--info-background)] !text-[var(--info-foreground)] !border-[var(--info-border)]',
            },
          }}
        />
      </body>
    </html>
  )
}
