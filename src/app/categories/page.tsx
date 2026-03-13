'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Category } from '@/lib/types'
import styles from './page.module.css'

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function load() {
            const { data } = await supabase
                .from('categories')
                .select('*')
                .eq('is_active', true)
                .order('sort_order')
            if (data) setCategories(data)
            setLoading(false)
        }
        load()
    }, [])

    return (
        <div className={`container ${styles.page}`}>
            <h1 className={styles.title}>All Categories</h1>
            <p className={styles.subtitle}>Browse from 13 categories of everyday essentials</p>

            {loading ? (
                <div className={styles.grid}>
                    {Array.from({ length: 13 }).map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />
                    ))}
                </div>
            ) : (
                <div className={`${styles.grid} stagger-children`}>
                    {categories.map(cat => (
                        <Link key={cat.id} href={`/category/${cat.id}`} className={styles.card}>
                            <span className={styles.icon}>{cat.icon}</span>
                            <span className={styles.name}>{cat.name}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
