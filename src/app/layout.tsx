import 'dotenv/config'
import '@/app/globals.css'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { palettes } from '@/lib/appearance'
import {
  CircleCheck,
  CircleX,
  Info,
  LoaderCircle,
  TriangleAlert,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Presenteio',
  description: 'Crie sua lista de presentes para seu aniversário ou evento',
}

const dmSans = localFont({
  src: '../../public/fonts/dm-sans-latin.woff2',
  variable: '--font-dm-sans',
  display: 'swap',
  weight: '400 800',
})
const fraunces = localFont({
  src: '../../public/fonts/fraunces-latin.woff2',
  variable: '--font-fraunces',
  display: 'swap',
  weight: '600 900',
})
const paletteNames = JSON.stringify(palettes.map(({ value }) => value))

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" data-palette="cherry" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              `try{var p=localStorage.getItem('presenteio-palette');if(${paletteNames}.includes(p))document.documentElement.dataset.palette=p}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${dmSans.variable} ${fraunces.variable} min-h-dvh antialiased`}
      >
        <ThemeProvider>
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
        </ThemeProvider>
      </body>
    </html>
  )
}
