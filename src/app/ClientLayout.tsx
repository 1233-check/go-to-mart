'use client'

import { CartProvider } from '@/context/CartContext'
import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'
import Footer from '@/components/Footer'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <CartProvider>
            <Navbar />
            <main className="main-content">
                {children}
            </main>
            <Footer />
            <BottomNav />
        </CartProvider>
    )
}
