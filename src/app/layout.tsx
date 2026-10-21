import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { RootProvider } from '@/composition/store/provider'

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Voucher Flash Sale — Vibrant Flash Commerce',
  description: 'High-velocity Indonesian flash-sale marketplace built with Next.js Clean Architecture',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f8f9fa] text-[#14213d] font-sans">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  )
}
