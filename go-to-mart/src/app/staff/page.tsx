'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Order } from '@/lib/types'

export default function StaffOrdersFeed() {
    const supabase = createClient()
    const [orders, setOrders] = useState<Order[]>([])

    // States for order columns
    const pendingOrders = orders.filter(o => o.status === 'placed' || o.status === 'confirmed')
    const activeOrders = orders.filter(o => o.status === 'packing' || o.status === 'packed' || o.status === 'assigned')

    useEffect(() => {
        fetchActiveOrders()

        // Listen for new orders and updates
        const channel = supabase.channel('staff-orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
                fetchActiveOrders()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchActiveOrders = async () => {
        const { data } = await supabase.from('orders')
            .select('*')
            .in('status', ['placed', 'confirmed', 'packing', 'packed', 'assigned'])
            .order('created_at', { ascending: true })

        if (data) setOrders(data)
    }

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    }

    return (
        <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Live Order Feed</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>

                {/* Pending Column */}
                <div style={{ background: '#f1f5f9', padding: '1.5rem', borderRadius: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontWeight: 700 }}>New Orders</h2>
                        <span style={{ background: 'var(--primary)', color: 'white', padding: '2px 10px', borderRadius: '10px', fontSize: '14px' }}>
                            {pendingOrders.length}
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {pendingOrders.map(order => (
                            <div key={order.id} style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <strong>{order.order_number}</strong>
                                    <span style={{ fontSize: '14px', color: '#64748b' }}>{new Date(order.created_at).toLocaleTimeString()}</span>
                                </div>
                                <p style={{ fontSize: '14px', marginBottom: '1rem' }}>{order.delivery_address.substring(0, 40)}...</p>
                                <button
                                    onClick={() => updateOrderStatus(order.id, 'packing')}
                                    style={{ width: '100%', padding: '0.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Accept & Start Packing
                                </button>
                            </div>
                        ))}
                        {pendingOrders.length === 0 && <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center' }}>No new orders.</p>}
                    </div>
                </div>

                {/* Active Column */}
                <div style={{ background: '#fef3c7', padding: '1.5rem', borderRadius: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontWeight: 700 }}>Currently Packing</h2>
                        <span style={{ background: '#d97706', color: 'white', padding: '2px 10px', borderRadius: '10px', fontSize: '14px' }}>
                            {activeOrders.length}
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {activeOrders.map(order => (
                            <div key={order.id} style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <strong>{order.order_number}</strong>
                                    <span style={{ fontSize: '14px', color: '#64748b', textTransform: 'uppercase' }}>{order.status.replace('_', ' ')}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                                        style={{ flex: 1, padding: '0.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        Mark Out for Delivery
                                    </button>
                                </div>
                            </div>
                        ))}
                        {activeOrders.length === 0 && <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center' }}>No active orders being packed.</p>}
                    </div>
                </div>

            </div>
        </div>
    )
}
