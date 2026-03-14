import type { Metadata } from 'next'
import './globals.css'
import ClientLayout from './ClientLayout'

export const metadata: Metadata = {
  title: 'GoToMart — Fresh Groceries Delivered Fast',
  description: 'Order fresh fruits, vegetables, dairy, snacks and everyday essentials online. Delivered to your doorstep in 30–45 minutes.',
  keywords: 'grocery delivery, fresh vegetables, fruits, online grocery, GoToMart',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
