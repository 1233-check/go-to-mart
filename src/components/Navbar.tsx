'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { Search, ShoppingCart, User, MapPin } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './Navbar.module.css'

export default function Navbar() {
    const { itemCount } = useCart()
    const [query, setQuery] = useState('')
    const router = useRouter()

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`)
        }
    }

    return (
        <header className={styles.header}>
            <div className={styles.topBar}>
                <div className={`container ${styles.topBarInner}`}>
                    <div className={styles.location}>
                        <MapPin size={14} />
                        <span>Deliver to <strong>Your Location</strong></span>
                    </div>
                    <div className={styles.topLinks}>
                        <span>Delivery in 30-45 min</span>
                    </div>
                </div>
            </div>

            <nav className={`container ${styles.nav}`}>
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoIcon}>🛒</span>
                    <span className={styles.logoText}>
                        Go<span className={styles.logoHighlight}>To</span>Mart
                    </span>
                </Link>

                <form className={styles.searchBar} onSubmit={handleSearch}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search for groceries, fruits, snacks..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </form>

                <div className={styles.actions}>
                    <Link href="/auth" className={styles.actionBtn}>
                        <User size={22} />
                        <span className={styles.actionLabel}>Account</span>
                    </Link>
                    <Link href="/cart" className={styles.cartBtn}>
                        <ShoppingCart size={22} />
                        {itemCount > 0 && <span className="badge">{itemCount}</span>}
                        <span className={styles.actionLabel}>Cart</span>
                    </Link>
                </div>
            </nav>
        </header>
    )
}
