'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Order } from '@/lib/types'
import { Package, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import styles from './page.module.css'

export default function OrdersPage() {
    const supabase = createClient()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase.from('orders').select('*').eq('customer_id', user.id).order('created_at', { ascending: false })
            if (data) setOrders(data)
        }
        setLoading(false)
    }

    if (loading) return <div className="container" style={{ padding: '2rem 0' }}>Loading orders...</div>

    return (
        <div className={`container ${styles.page}`}>
            <h1 className={styles.title}>My Orders</h1>

            {orders.length === 0 ? (
                <div className={styles.empty}>
                    <Package size={48} className={styles.emptyIcon} />
                    <p>No orders placed yet.</p>
                    <Link href="/categories" className={styles.shopBtn}>Start Shopping</Link>
                </div>
            ) : (
                <div className={styles.orderList}>
                    {orders.map(order => (
                        <Link href={`/account/orders/${order.id}`} key={order.id} className={styles.orderCard}>
                            <div className={styles.orderHeader}>
                                <div>
                                    <span className={styles.orderNumber}>{order.order_number}</span>
                                    <span className={styles.orderDate}>{new Date(order.created_at).toLocaleDateString()}</span>
                                </div>
                                <span className={`${styles.statusBadge} ${styles[order.status]}`}>
                                    {order.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>

                            <div className={styles.orderFooter}>
                                <span className={styles.orderTotal}>₹{order.total}</span>
                                <div className={styles.viewDetails}>
                                    View Details <ChevronRight size={16} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
