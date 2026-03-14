'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { Home, Grid3X3, ShoppingCart, User } from 'lucide-react'
import styles from './BottomNav.module.css'

const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/categories', icon: Grid3X3, label: 'Categories' },
    { href: '/cart', icon: ShoppingCart, label: 'Cart', showBadge: true },
    { href: '/account', icon: User, label: 'Account' },
]

export default function BottomNav() {
    const pathname = usePathname()
    const { itemCount } = useCart()

    return (
        <nav className={styles.bottomNav}>
            {navItems.map(item => {
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
                const Icon = item.icon
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                    >
                        <div className={styles.iconWrap}>
                            <Icon size={22} />
                            {item.showBadge && itemCount > 0 && (
                                <span className="badge">{itemCount}</span>
                            )}
                        </div>
                        <span className={styles.label}>{item.label}</span>
                    </Link>
                )
            })}
        </nav>
    )
}
