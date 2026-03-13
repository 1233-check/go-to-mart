'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'
import styles from './page.module.css'

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [isOtpSent, setIsOtpSent] = useState(false)
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const supabase = createClient()
    const router = useRouter()

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: !isLogin ? true : false,
                    data: !isLogin ? { full_name: fullName, role: 'customer' } : undefined,
                }
            })
            if (error) throw error
            setSuccess('Magic link & OTP sent to ' + email + '. Check your inbox!')
            setIsOtpSent(true)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong sending OTP')
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'email'
            })
            if (error) throw error

            // If it's a new sign up, update the profile with the full name
            if (!isLogin && fullName && data.user) {
                await supabase.from('profiles').update({ full_name: fullName }).eq('id', data.user.id)
            }

            setSuccess('Logged in successfully!')
            router.push('/')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Invalid OTP')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <span className={styles.logo}>🛒</span>
                    <h1 className={styles.title}>{isLogin ? 'Welcome back' : 'Create account'}</h1>
                    <p className={styles.subtitle}>
                        {isLogin ? 'Sign in to your GoToMart account' : 'Join GoToMart for fast grocery delivery'}
                    </p>
                </div>

                <form onSubmit={isOtpSent ? handleVerifyOTP : handleSendOTP} className={styles.form}>
                    {!isLogin && !isOtpSent && (
                        <div className={styles.field}>
                            <User size={18} className={styles.fieldIcon} />
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                required
                                className={styles.input}
                            />
                        </div>
                    )}

                    {!isOtpSent ? (
                        <div className={styles.field}>
                            <Mail size={18} className={styles.fieldIcon} />
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                className={styles.input}
                            />
                        </div>
                    ) : (
                        <div className={styles.field}>
                            <Lock size={18} className={styles.fieldIcon} />
                            <input
                                type="text"
                                placeholder="Enter 6-digit OTP from your email"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                required
                                maxLength={6}
                                className={styles.input}
                            />
                        </div>
                    )}

                    {error && <p className={styles.error}>{error}</p>}
                    {success && <p className={styles.success}>{success}</p>}

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Please wait...' : (!isOtpSent ? 'Send OTP' : 'Verify & Login')}
                        {!loading && <ArrowRight size={18} />}
                    </button>

                    {isOtpSent && (
                        <button
                            type="button"
                            className={styles.resetBtn}
                            onClick={() => { setIsOtpSent(false); setOtp(''); setError(''); setSuccess('') }}
                        >
                            Change Email
                        </button>
                    )}
                </form>

                {!isOtpSent && (
                    <div className={styles.toggle}>
                        <span>{isLogin ? "Don't have an account?" : 'Already have an account?'}</span>
                        <button onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess('') }} type="button" className={styles.toggleBtn}>
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
