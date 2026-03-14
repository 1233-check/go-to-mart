'use client'

import { Product } from '@/lib/types'
import { useCart } from '@/context/CartContext'
import { Plus, Minus, Heart } from 'lucide-react'
import styles from './ProductCard.module.css'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

interface ProductCardProps {
    product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addItem, updateQuantity, getItemQuantity } = useCart()
    const qty = getItemQuantity(product.id)
    const supabase = createClient()
    const [isWishlisted, setIsWishlisted] = useState(false)
    const [isWishlistLoading, setIsWishlistLoading] = useState(false)

    useEffect(() => {
        const checkWishlist = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            const { data } = await supabase.from('wishlists').select('id').eq('product_id', product.id).eq('user_id', user.id).single()
            if (data) setIsWishlisted(true)
        }
        checkWishlist()
    }, [product.id, supabase])

    const toggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsWishlistLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            alert('Please login to add items to your wishlist')
            setIsWishlistLoading(false)
            return
        }

        if (isWishlisted) {
            await supabase.from('wishlists').delete().eq('product_id', product.id).eq('user_id', user.id)
            setIsWishlisted(false)
        } else {
            const { error } = await supabase.from('wishlists').insert([{ product_id: product.id, user_id: user.id }])
            if (!error) setIsWishlisted(true)
        }
        setIsWishlistLoading(false)
    }
    const discount = product.mrp && product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0

    return (
        <div className={styles.card}>
            {discount > 0 && (
                <span className={styles.discountBadge}>{discount}% OFF</span>
            )}

            <button
                className={styles.wishlistBtn}
                onClick={toggleWishlist}
                disabled={isWishlistLoading}
            >
                <Heart
                    size={20}
                    fill={isWishlisted ? '#ef4444' : 'transparent'}
                    color={isWishlisted ? '#ef4444' : '#9ca3af'}
                />
            </button>

            <div className={styles.imageWrap}>
                <div className={styles.imagePlaceholder}>
                    <span className={styles.emoji}>
                        {product.category?.icon || '📦'}
                    </span>
                </div>
            </div>

            <div className={styles.info}>
                <p className={styles.unit}>{product.unit}</p>
                <h3 className={styles.name}>{product.name}</h3>

                <div className={styles.priceRow}>
                    <span className="price">₹{product.price}</span>
                    {product.mrp && product.mrp > product.price && (
                        <span className="price-mrp">₹{product.mrp}</span>
                    )}
                </div>

                <div className={styles.cartAction}>
                    {qty === 0 ? (
                        <button
                            className={styles.addBtn}
                            onClick={() => addItem(product)}
                        >
                            <Plus size={16} />
                            ADD
                        </button>
                    ) : (
                        <div className={styles.qtyControl}>
                            <button
                                className={styles.qtyBtn}
                                onClick={() => updateQuantity(product.id, qty - 1)}
                            >
                                <Minus size={14} />
                            </button>
                            <span className={styles.qtyValue}>{qty}</span>
                            <button
                                className={styles.qtyBtn}
                                onClick={() => updateQuantity(product.id, qty + 1)}
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
