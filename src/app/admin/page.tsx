'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function AdminDashboard() {
    const supabase = createClient()
    const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0, revenue: 0 })

    useEffect(() => {
        const fetchStats = async () => {
            const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
            const { data: orders } = await supabase.from('orders').select('total, status')

            let sum = 0
            orders?.forEach(o => {
                if (o.status !== 'cancelled') sum += o.total
            })

            setStats({
                totalUsers: usersCount || 0,
                totalOrders: orders?.length || 0,
                revenue: sum
            })
        }
        fetchStats()
    }, [])

    return (
        <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Admin Dashboard</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Revenue</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 700 }}>₹{stats.revenue.toLocaleString()}</p>
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Orders</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totalOrders}</p>
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Registered Users</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 700 }}>{stats.totalUsers}</p>
                </div>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Recent Activity</h3>
                <p style={{ color: '#64748b' }}>No recent admin activities to show.</p>
            </div>
        </div>
    )
}
