'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Address } from '@/lib/types'
import { MapPin, Plus, Trash2 } from 'lucide-react'
import LocationPicker from '@/components/LocationPicker'
import styles from './page.module.css'

export default function AddressesPage() {
    const supabase = createClient()
    const [addresses, setAddresses] = useState<Address[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)

    // new address state
    const [label, setLabel] = useState('Home')
    const [fullAddress, setFullAddress] = useState('')
    const [landmark, setLandmark] = useState('')
    const [latitude, setLatitude] = useState<number | null>(null)
    const [longitude, setLongitude] = useState<number | null>(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchAddresses()
    }, [])

    const fetchAddresses = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
            if (data) setAddresses(data)
        }
        setLoading(false)
    }

    const handleLocationSelect = (location: { lat: number, lng: number }, addressStr: string) => {
        setLatitude(location.lat)
        setLongitude(location.lng)
        setFullAddress(addressStr)
    }

    const saveAddress = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const newAddr = {
            user_id: user.id,
            label,
            full_address: fullAddress,
            landmark,
            latitude,
            longitude,
            is_default: addresses.length === 0
        }

        const { error } = await supabase.from('addresses').insert([newAddr])
        if (!error) {
            setIsAdding(false)
            setLabel('Home')
            setFullAddress('')
            setLandmark('')
            setLatitude(null)
            setLongitude(null)
            fetchAddresses()
        } else {
            alert('Failed to save address: ' + error.message)
        }
        setSaving(false)
    }

    const deleteAddress = async (id: string) => {
        const { error } = await supabase.from('addresses').delete().eq('id', id)
        if (!error) {
            fetchAddresses()
        }
    }

    if (loading) return <div className="container" style={{ padding: '2rem 0' }}>Loading addresses...</div>

    return (
        <div className={`container ${styles.page}`}>
            <div className={styles.header}>
                <h1>Saved Addresses</h1>
                {!isAdding && (
                    <button className={styles.addBtn} onClick={() => setIsAdding(true)}>
                        <Plus size={18} /> Add New
                    </button>
                )}
            </div>

            {isAdding ? (
                <div className={styles.addForm}>
                    <h3>Add New Address</h3>
                    <LocationPicker onLocationSelect={handleLocationSelect} />

                    <form onSubmit={saveAddress} className={styles.formContainer}>
                        <div className={styles.inputGroup}>
                            <label>Label (e.g. Home, Work)</label>
                            <input
                                required
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                placeholder="Home"
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Full Address</label>
                            <textarea
                                required
                                value={fullAddress}
                                onChange={(e) => setFullAddress(e.target.value)}
                                placeholder="Street, Sector, City..."
                                rows={3}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Landmark (Optional)</label>
                            <input
                                value={landmark}
                                onChange={(e) => setLandmark(e.target.value)}
                                placeholder="Near Apollo Hospital"
                            />
                        </div>
                        <div className={styles.formActions}>
                            <button type="button" className={styles.cancelBtn} onClick={() => setIsAdding(false)}>
                                Cancel
                            </button>
                            <button type="submit" disabled={saving} className={styles.submitBtn}>
                                {saving ? 'Saving...' : 'Save Address'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className={styles.addressList}>
                    {addresses.length === 0 ? (
                        <div className={styles.empty}>
                            <MapPin size={48} className={styles.emptyIcon} />
                            <p>No addresses saved yet</p>
                            <p style={{ fontSize: 14, marginTop: '0.5rem', opacity: 0.7 }}>Add one to check out faster!</p>
                        </div>
                    ) : (
                        addresses.map(addr => (
                            <div key={addr.id} className={styles.addressCard}>
                                <div className={styles.addressHeader}>
                                    <span className={styles.label}>{addr.label}</span>
                                    {addr.is_default && <span className={styles.defaultBadge}>Default</span>}
                                </div>
                                <p className={styles.fulltext}>{addr.full_address}</p>
                                {addr.landmark && <p className={styles.landmark}>Landmark: {addr.landmark}</p>}
                                <button className={styles.deleteBtn} onClick={() => deleteAddress(addr.id)}>
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
