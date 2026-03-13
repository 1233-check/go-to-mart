'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Product } from '@/lib/types'
import ProductCard from '@/components/ProductCard'
import { Heart } from 'lucide-react'
import Link from 'next/link'

export default function WishlistPage() {
    const supabase = createClient()
    const [wishlistProducts, setWishlistProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchWishlist()
    }, [])

    const fetchWishlist = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setLoading(false)
            return
        }

        const { data, error } = await supabase.from('wishlists').select(`
            product_id,
            products:product_id (*)
        `).eq('user_id', user.id)

        if (data) {
            // @ts-ignore - joining relation
            const products = data.map(item => item.products).filter(p => p !== null) as Product[]
            setWishlistProducts(products)
        }
        setLoading(false)
    }

    if (loading) return <div className="container" style={{ padding: '2rem 0' }}>Loading wishlist...</div>

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>My Wishlist</h1>

            {wishlistProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
                    <Heart size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p>Your wishlist is empty.</p>
                    <Link href="/categories" style={{ display: 'inline-block', marginTop: '1.5rem', padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white', textDecoration: 'none', fontWeight: 600, borderRadius: '0.5rem' }}>
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                    {wishlistProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    )
}
