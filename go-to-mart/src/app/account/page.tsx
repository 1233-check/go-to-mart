'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { LogOut, Package, MapPin, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import styles from './page.module.css'

export default function AccountPage() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            setLoading(false)
        }
        getUser()
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    if (loading) {
        return (
            <div className={`container ${styles.page}`}>
                <div className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />
            </div>
        )
    }

    if (!user) {
        return (
            <div className={`container ${styles.page}`}>
                <div className={styles.notLoggedIn}>
                    <h2>You&apos;re not logged in</h2>
                    <p>Sign in to view your account, orders, and saved addresses.</p>
                    <Link href="/auth" className={styles.loginBtn}>
                        Sign In / Sign Up
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className={`container ${styles.page}`}>
            <div className={styles.profileCard}>
                <div className={styles.avatar}>
                    {(user.user_metadata?.full_name || user.email || '?')[0].toUpperCase()}
                </div>
                <div className={styles.profileInfo}>
                    <h1 className={styles.name}>{user.user_metadata?.full_name || 'User'}</h1>
                    <p className={styles.email}>{user.email}</p>
                </div>
            </div>

            <div className={styles.menuList}>
                <Link href="/account/orders" className={styles.menuItem}>
                    <Package size={20} />
                    <span>My Orders</span>
                    <ChevronRight size={18} className={styles.menuArrow} />
                </Link>
                <Link href="/account/addresses" className={styles.menuItem}>
                    <MapPin size={20} />
                    <span>Saved Addresses</span>
                    <ChevronRight size={18} className={styles.menuArrow} />
                </Link>
            </div>

            <button onClick={handleSignOut} className={styles.signOutBtn}>
                <LogOut size={18} />
                Sign Out
            </button>
        </div>
    )
}
