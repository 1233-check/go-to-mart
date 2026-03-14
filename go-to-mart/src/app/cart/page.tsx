'use client'

import { useCart } from '@/context/CartContext'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, MapPin } from 'lucide-react'
import Link from 'next/link'
import styles from './page.module.css'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Address } from '@/lib/types'
import { useRouter } from 'next/navigation'

interface PromoCode {
    id: string;
    code: string;
    discount_amount: number | null;
    discount_percentage: number | null;
    min_order_value: number;
    max_discount: number | null;
}

export default function CartPage() {
    const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useCart()
    const supabase = createClient()
    const router = useRouter()

    const [addresses, setAddresses] = useState<Address[]>([])
    const [selectedAddressId, setSelectedAddressId] = useState<string>('')
    const [loadingAddresses, setLoadingAddresses] = useState(true)
    const [isCheckingOut, setIsCheckingOut] = useState(false)

    // Promo Code State
    const [promoInput, setPromoInput] = useState('')
    const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null)
    const [promoError, setPromoError] = useState('')
    const [isApplyingPromo, setIsApplyingPromo] = useState(false)

    useEffect(() => {
        fetchAddresses()
    }, [])

    const fetchAddresses = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false })
            if (data && data.length > 0) {
                setAddresses(data)
                setSelectedAddressId(data[0].id)
            }
        }
        setLoadingAddresses(false)
    }

    const deliveryFee = total >= 499 ? 0 : 25

    // Calculate Discounts Based on Applied Promo Code
    let discountAmount = 0
    if (appliedPromo) {
        if (appliedPromo.discount_amount) {
            discountAmount = appliedPromo.discount_amount
        } else if (appliedPromo.discount_percentage) {
            discountAmount = (total * appliedPromo.discount_percentage) / 100
            if (appliedPromo.max_discount && discountAmount > appliedPromo.max_discount) {
                discountAmount = appliedPromo.max_discount
            }
        }
    }

    const grandTotal = Math.max(0, total + deliveryFee - discountAmount)

    const handleApplyPromo = async () => {
        setPromoError('')
        if (!promoInput.trim()) return

        setIsApplyingPromo(true)
        const { data, error } = await supabase.from('promo_codes')
            .select('*')
            .eq('code', promoInput.trim().toUpperCase())
            .eq('is_active', true)
            .single()

        if (error || !data) {
            setPromoError('Invalid or expired promo code')
            setAppliedPromo(null)
            setIsApplyingPromo(false)
            return
        }

        const promo = data as PromoCode

        if (total < promo.min_order_value) {
            setPromoError(`Minimum order value of ₹${promo.min_order_value} required`)
            setAppliedPromo(null)
        } else {
            setAppliedPromo(promo)
        }
        setIsApplyingPromo(false)
    }

    const handleRemovePromo = () => {
        setAppliedPromo(null)
        setPromoInput('')
        setPromoError('')
    }

    const handleCheckout = async () => {
        if (!selectedAddressId) {
            alert("Please select a delivery address.");
            return;
        }
        setIsCheckingOut(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            alert("Please log in to checkout.");
            router.push('/auth');
            return;
        }

        const selectedAddress = addresses.find(a => a.id === selectedAddressId)
        if (!selectedAddress) {
            setIsCheckingOut(false)
            return
        }

        const orderNumber = 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase()

        const newOrder = {
            order_number: orderNumber,
            customer_id: user.id,
            delivery_address: selectedAddress.full_address,
            delivery_latitude: selectedAddress.latitude,
            delivery_longitude: selectedAddress.longitude,
            delivery_landmark: selectedAddress.landmark,
            status: 'placed',
            subtotal: total,
            delivery_fee: deliveryFee,
            discount: discountAmount,
            total: grandTotal,
            payment_method: 'COD', // Default to COD for now
            payment_status: 'pending',
            customer_name: user.user_metadata?.full_name || '',
            customer_phone: user.phone || ''
        }

        const { data: orderData, error: orderError } = await supabase.from('orders').insert([newOrder]).select()

        if (orderError || !orderData) {
            alert('Error creating order: ' + orderError?.message)
            setIsCheckingOut(false)
            return
        }

        const orderId = orderData[0].id
        const orderItemsToInsert = items.map(item => ({
            order_id: orderId,
            product_id: item.product.id,
            product_name: item.product.name,
            product_price: item.product.price,
            product_image: item.product.image_url,
            quantity: item.quantity,
            total: item.product.price * item.quantity
        }))

        const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert)
        if (itemsError) {
            console.error('Error inserting items:', itemsError)
        }

        clearCart()
        router.push(`/account/orders/${orderId}`)
        setIsCheckingOut(false)
    }

    if (items.length === 0) {
        return (
            <div className={`container ${styles.page}`}>
                <div className={styles.empty}>
                    <ShoppingBag size={64} className={styles.emptyIcon} />
                    <h2 className={styles.emptyTitle}>Your cart is empty</h2>
                    <p className={styles.emptySub}>Add items from our wide selection of groceries</p>
                    <Link href="/categories" className={styles.shopBtn}>
                        Start Shopping <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className={`container ${styles.page}`}>
            <div className={styles.header}>
                <h1 className={styles.title}>Your Cart</h1>
                <span className={styles.count}>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
            </div>

            <div className={styles.layout}>
                <div className={styles.itemsCol}>
                    {items.map(item => (
                        <div key={item.product.id} className={styles.cartItem}>
                            <div className={styles.itemImage}>
                                <span className={styles.itemEmoji}>{item.product.category?.icon || '📦'}</span>
                            </div>

                            <div className={styles.itemInfo}>
                                <h3 className={styles.itemName}>{item.product.name}</h3>
                                <p className={styles.itemUnit}>{item.product.unit}</p>
                                <div className={styles.itemPriceRow}>
                                    <span className="price">₹{item.product.price}</span>
                                    {item.product.mrp && item.product.mrp > item.product.price && (
                                        <span className="price-mrp">₹{item.product.mrp}</span>
                                    )}
                                </div>
                            </div>

                            <div className={styles.itemActions}>
                                <div className={styles.qtyControl}>
                                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className={styles.qtyBtn}>
                                        <Minus size={14} />
                                    </button>
                                    <span className={styles.qtyValue}>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className={styles.qtyBtn}>
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <span className={styles.itemTotal}>₹{item.product.price * item.quantity}</span>
                                <button onClick={() => removeItem(item.product.id)} className={styles.removeBtn}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    <button onClick={clearCart} className={styles.clearBtn}>Clear Cart</button>
                </div>

                <div className={styles.summaryCol}>
                    <div className={styles.summary}>
                        <h2 className={styles.summaryTitle}>Order Summary</h2>
                        <div className={styles.summaryRow}>
                            <span>Subtotal ({itemCount} items)</span>
                            <span>₹{total}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Delivery Fee</span>
                            <span className={deliveryFee === 0 ? styles.freeDelivery : ''}>
                                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                            </span>
                        </div>
                        {total < 499 && (
                            <p className={styles.freeHint}>
                                Add ₹{499 - total} more for free delivery!
                            </p>
                        )}

                        {/* Promo Code Section */}
                        <div className={styles.promoSection}>
                            {!appliedPromo ? (
                                <div className={styles.promoInputWrap}>
                                    <input
                                        type="text"
                                        className={styles.promoInput}
                                        placeholder="Enter Promo Code"
                                        value={promoInput}
                                        onChange={(e) => setPromoInput(e.target.value)}
                                    />
                                    <button
                                        className={styles.promoApplyBtn}
                                        onClick={handleApplyPromo}
                                        disabled={isApplyingPromo || !promoInput.trim()}
                                    >
                                        {isApplyingPromo ? 'Applying...' : 'Apply'}
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.promoAppliedWrap}>
                                    <div className={styles.promoLabel}>
                                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{appliedPromo.code}</span> APPLIED
                                    </div>
                                    <button className={styles.promoRemoveBtn} onClick={handleRemovePromo}>Remove</button>
                                </div>
                            )}
                            {promoError && <p className={styles.promoError}>{promoError}</p>}

                            {appliedPromo && (
                                <div className={styles.summaryRow} style={{ color: 'var(--primary)', fontWeight: 600, marginTop: '12px' }}>
                                    <span>Discount</span>
                                    <span>-₹{discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        <div className={styles.divider} />
                        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                            <span>Total</span>
                            <span>₹{grandTotal}</span>
                        </div>

                        {/* Address Selection */}
                        <div className={styles.addressSection}>
                            <h3 className={styles.addressTitle}>Delivery Address</h3>
                            {loadingAddresses ? (
                                <p className={styles.loadingText}>Loading...</p>
                            ) : addresses.length > 0 ? (
                                <select
                                    className={styles.addressSelect}
                                    value={selectedAddressId}
                                    onChange={(e) => setSelectedAddressId(e.target.value)}
                                >
                                    {addresses.map(addr => (
                                        <option key={addr.id} value={addr.id}>
                                            {addr.label} - {addr.full_address.substring(0, 30)}...
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className={styles.noAddress}>
                                    <MapPin size={20} className={styles.noAddressIcon} />
                                    <p>No addresses found.</p>
                                    <Link href="/account/addresses" className={styles.addAddressLink}>
                                        Add Delivery Address
                                    </Link>
                                </div>
                            )}
                        </div>

                        <button
                            className={styles.checkoutBtn}
                            onClick={handleCheckout}
                            disabled={isCheckingOut || addresses.length === 0}
                        >
                            {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'} <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
