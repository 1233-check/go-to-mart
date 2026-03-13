'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Profile } from '@/lib/types'

export default function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            router.push('/auth')
            return
        }

        if (allowedRoles && allowedRoles.length > 0) {
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
            if (profile && allowedRoles.includes(profile.role)) {
                setIsAuthorized(true)
            } else {
                router.push('/')
            }
        } else {
            setIsAuthorized(true)
        }
        setLoading(false)
    }

    if (loading) return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>

    if (!isAuthorized) return null

    return <>{children}</>
}
