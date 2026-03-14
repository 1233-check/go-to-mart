'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Product } from '@/lib/types'
import ProductCard from '@/components/ProductCard'
import { Search as SearchIcon } from 'lucide-react'
import styles from './page.module.css'

function SearchResults() {
    const searchParams = useSearchParams()
    const query = searchParams.get('q') || ''
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (!query.trim()) { setProducts([]); return }
        setLoading(true)
        async function search() {
            const { data } = await supabase
                .from('products')
                .select('*, category:categories(*)')
                .ilike('name', `%${query}%`)
                .eq('is_active', true)
                .limit(50)
            if (data) setProducts(data)
            setLoading(false)
        }
        search()
    }, [query])

    return (
        <div className={`container ${styles.page}`}>
            <div className={styles.header}>
                <SearchIcon size={24} className={styles.icon} />
                <h1 className={styles.title}>
                    {query ? `Results for "${query}"` : 'Search Products'}
                </h1>
            </div>

            {!query && (
                <p className={styles.hint}>Use the search bar above to find products.</p>
            )}

            {loading ? (
                <div className={styles.grid}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: 260, borderRadius: 'var(--radius-lg)' }} />
                    ))}
                </div>
            ) : query && products.length === 0 ? (
                <div className={styles.empty}>
                    <p>No products found for &quot;{query}&quot;. Try a different search term.</p>
                </div>
            ) : (
                <>
                    {products.length > 0 && (
                        <p className={styles.count}>{products.length} product{products.length !== 1 ? 's' : ''} found</p>
                    )}
                    <div className={styles.grid}>
                        {products.map(p => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="container" style={{ padding: '40px 0' }}><div className="skeleton" style={{ height: 40, width: '50%' }} /></div>}>
            <SearchResults />
        </Suspense>
    )
}
