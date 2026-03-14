import ProtectedRoute from '@/components/ProtectedRoute'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
                <aside style={{ width: '250px', background: 'white', borderRight: '1px solid #e2e8f0', padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem' }}>Go-To-Mart Admin</h2>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <a href="/admin" style={{ fontWeight: 600 }}>Dashboard</a>
                        <a href="/admin/products" style={{ color: '#64748b' }}>Products</a>
                        <a href="/admin/users" style={{ color: '#64748b' }}>Users</a>
                        <a href="/admin/settings" style={{ color: '#64748b' }}>Settings</a>
                    </nav>
                </aside>
                <main style={{ flex: 1, padding: '2rem' }}>
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    )
}
