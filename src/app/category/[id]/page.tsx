'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Category, Product } from '@/lib/types'
import ProductCard from '@/components/ProductCard'
import { ChevronLeft } from 'lucide-react'
import styles from './page.module.css'

export default function CategoryPage() {
    const params = useParams()
    const id = params.id as string
    const [category, setCategory] = useState<Category | null>(null)
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default')
    const supabase = createClient()

    useEffect(() => {
        async function load() {
            const { data: cat } = await supabase
                .from('categories')
                .select('*')
                .eq('id', id)
                .single()
            if (cat) setCategory(cat)

            let query = supabase
                .from('products')
                .select('*, category:categories(*)')
                .eq('category_id', id)
                .eq('is_active', true)

            if (sortBy === 'price-asc') query = query.order('price', { ascending: true })
            else if (sortBy === 'price-desc') query = query.order('price', { ascending: false })
            else query = query.order('name')

            const { data: prods } = await query
            if (prods) setProducts(prods)
            setLoading(false)
        }
        load()
    }, [id, sortBy])

    return (
        <div className={`container ${styles.page}`}>
            <div className={styles.header}>
                <Link href="/" className={styles.backBtn}>
                    <ChevronLeft size={20} />
                </Link>
                <div className={styles.headerInfo}>
                    {category && (
                        <>
                            <span className={styles.catIcon}>{category.icon}</span>
                            <h1 className={styles.title}>{category.name}</h1>
                        </>
                    )}
                </div>
            </div>

            <div className={styles.toolbar}>
                <span className={styles.count}>
                    {loading ? '...' : `${products.length} products`}
                </span>
                <select
                    className={styles.sortSelect}
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as typeof sortBy)}
                >
                    <option value="default">Sort: A–Z</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                </select>
            </div>

            {loading ? (
                <div className={styles.grid}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: 260, borderRadius: 'var(--radius-lg)' }} />
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className={styles.empty}>
                    <p>No products found in this category.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {products.map(p => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            )}
        </div>
    )
}
