import ProtectedRoute from '@/components/ProtectedRoute'

export default function StaffLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute allowedRoles={['admin', 'store_staff']}>
            <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
                <aside style={{ width: '250px', background: 'white', borderRight: '1px solid #e2e8f0', padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem' }}>Store Console</h2>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <a href="/staff" style={{ fontWeight: 600 }}>Live Orders</a>
                        <a href="/staff/inventory" style={{ color: '#64748b' }}>Inventory Mgmt</a>
                    </nav>
                </aside>
                <main style={{ flex: 1, padding: '2rem' }}>
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    )
}
