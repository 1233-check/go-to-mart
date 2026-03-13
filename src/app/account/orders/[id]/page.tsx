'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Order, OrderItem } from '@/lib/types'
import { ArrowLeft, CheckCircle2, Package, Truck, Home, Clock } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import styles from './page.module.css'

export default function OrderDetailsPage() {
    const { id } = useParams()
    const supabase = createClient()
    const [order, setOrder] = useState<Order | null>(null)
    const [items, setItems] = useState<OrderItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) {
            fetchOrderDetails()
        }
    }, [id])

    useEffect(() => {
        if (!id) return

        // Subscribe to real-time changes
        const channel = supabase.channel(`order-${id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `id=eq.${id}`
            }, (payload) => {
                console.log('Order update received!', payload)
                setOrder(payload.new as Order)
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [id, supabase])

    const fetchOrderDetails = async () => {
        const { data: orderData } = await supabase.from('orders').select('*').eq('id', id).single()
        if (orderData) {
            setOrder(orderData)
            const { data: itemsData } = await supabase.from('order_items').select('*').eq('order_id', id)
            if (itemsData) setItems(itemsData)
        }
        setLoading(false)
    }

    if (loading) return <div className="container" style={{ padding: '2rem 0' }}>Loading order details...</div>
    if (!order) return <div className="container" style={{ padding: '2rem 0' }}>Order not found.</div>

    // Helper for timeline
    const statuses = ['placed', 'packing', 'out_for_delivery', 'delivered']
    let currentStatusIndex = 0
    if (order.status === 'placed' || order.status === 'confirmed') currentStatusIndex = 0
    if (order.status === 'packing' || order.status === 'packed') currentStatusIndex = 1
    if (order.status === 'assigned' || order.status === 'picked_up' || order.status === 'in_transit' || order.status === 'out_for_delivery') currentStatusIndex = 2
    if (order.status === 'delivered') currentStatusIndex = 3
    if (order.status === 'cancelled') currentStatusIndex = -1 // Error state

    return (
        <div className={`container ${styles.page}`}>
            <Link href="/account/orders" className={styles.backLink}>
                <ArrowLeft size={16} /> Back to Orders
            </Link>

            <div className={styles.header}>
                <h1 className={styles.title}>Order #{order.order_number}</h1>
                <span className={styles.date}>{new Date(order.created_at).toLocaleString()}</span>
            </div>

            {/* LIVE TRACKING TIMELINE */}
            <div className={styles.trackingCard}>
                <div className={styles.trackingHeader}>
                    <h2>Delivery Status</h2>
                    <div className={styles.livePulse}>
                        {order.status !== 'delivered' && order.status !== 'cancelled' && <span className={styles.pulseDot}></span>}
                        {order.status.replace('_', ' ').toUpperCase()}
                    </div>
                </div>

                <div className={styles.timeline}>
                    <div className={`${styles.step} ${currentStatusIndex >= 0 ? styles.active : ''}`}>
                        <div className={styles.stepIcon}><Clock size={20} /></div>
                        <p>Order Placed</p>
                    </div>
                    <div className={styles.stepLine} data-active={currentStatusIndex >= 1} />
                    <div className={`${styles.step} ${currentStatusIndex >= 1 ? styles.active : ''}`}>
                        <div className={styles.stepIcon}><Package size={20} /></div>
                        <p>Packing</p>
                    </div>
                    <div className={styles.stepLine} data-active={currentStatusIndex >= 2} />
                    <div className={`${styles.step} ${currentStatusIndex >= 2 ? styles.active : ''}`}>
                        <div className={styles.stepIcon}><Truck size={20} /></div>
                        <p>Out for Delivery</p>
                    </div>
                    <div className={styles.stepLine} data-active={currentStatusIndex >= 3} />
                    <div className={`${styles.step} ${currentStatusIndex >= 3 ? styles.active : ''}`}>
                        <div className={styles.stepIcon}><Home size={20} /></div>
                        <p>Delivered</p>
                    </div>
                </div>
            </div>

            <div className={styles.gridLayout}>
                <div className={styles.mainCol}>
                    <div className={styles.card}>
                        <h3>Items ({items.length})</h3>
                        <div className={styles.itemList}>
                            {items.map(item => (
                                <div key={item.id} className={styles.itemRow}>
                                    <div className={styles.itemDetails}>
                                        <span className={styles.qty}>{item.quantity}x</span>
                                        <span className={styles.name}>{item.product_name}</span>
                                    </div>
                                    <span className={styles.price}>₹{item.total}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h3>Delivery Address</h3>
                        <p className={styles.addressText}>{order.delivery_address}</p>
                        {order.delivery_landmark && <p className={styles.landmarkText}>Landmark: {order.delivery_landmark}</p>}
                    </div>
                </div>

                <div className={styles.sideCol}>
                    <div className={styles.card}>
                        <h3>Payment Summary</h3>
                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>₹{order.subtotal}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Delivery Fee</span>
                            <span>₹{order.delivery_fee}</span>
                        </div>
                        {order.discount > 0 && (
                            <div className={styles.summaryRow}>
                                <span>Discount</span>
                                <span className={styles.discount}>-₹{order.discount}</span>
                            </div>
                        )}
                        <div className={styles.divider} />
                        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                            <span>Total</span>
                            <span>₹{order.total}</span>
                        </div>
                        <div className={styles.paymentMethod}>
                            Method: <strong>{order.payment_method}</strong> ({order.payment_status})
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
