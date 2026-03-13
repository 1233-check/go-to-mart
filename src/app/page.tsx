'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Category, Product } from '@/lib/types'
import ProductCard from '@/components/ProductCard'
import { ArrowRight, Clock, Truck, Shield, ChevronRight } from 'lucide-react'
import styles from './page.module.css'

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Record<string, Product[]>>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      // Load categories
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (cats) {
        setCategories(cats)

        // Load first 6 products per first 4 categories
        const featured: Record<string, Product[]> = {}
        const topCats = cats.slice(0, 5)

        for (const cat of topCats) {
          const { data: prods } = await supabase
            .from('products')
            .select('*, category:categories(*)')
            .eq('category_id', cat.id)
            .eq('is_active', true)
            .limit(6)

          if (prods) featured[cat.id] = prods
        }
        setFeaturedProducts(featured)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.heroSkeleton}>
          <div className="skeleton" style={{ width: '60%', height: 40 }} />
          <div className="skeleton" style={{ width: '40%', height: 20, marginTop: 12 }} />
          <div className="skeleton" style={{ width: 150, height: 44, marginTop: 24, borderRadius: 'var(--radius-full)' }} />
        </div>
        <div className="container">
          <div className={styles.categoryGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Hero Banner */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroText}>
            <span className={styles.heroBadge}>
              <Clock size={14} /> Delivery in 30-45 min
            </span>
            <h1 className={styles.heroTitle}>
              Fresh Groceries
              <br />
              <span className={styles.heroGreen}>Delivered Fast</span>
            </h1>
            <p className={styles.heroSubtitle}>
              From farm-fresh produce to everyday essentials. Order now and get it delivered to your doorstep.
            </p>
            <Link href="/categories" className={styles.heroCta}>
              Start Shopping <ArrowRight size={18} />
            </Link>
          </div>
          <div className={styles.heroVisual}>
            <span className={styles.heroEmoji}>🛒🥬🍎🥛</span>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className={styles.trustBar}>
        <div className={`container ${styles.trustInner}`}>
          <div className={styles.trustItem}>
            <Truck size={20} />
            <span>Free delivery over ₹499</span>
          </div>
          <div className={styles.trustItem}>
            <Clock size={20} />
            <span>30-45 min delivery</span>
          </div>
          <div className={styles.trustItem}>
            <Shield size={20} />
            <span>100% quality assured</span>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Shop by Category</h2>
          <Link href="/categories" className={styles.viewAll}>
            View All <ChevronRight size={16} />
          </Link>
        </div>
        <div className={`${styles.categoryGrid} stagger-children`}>
          {categories.map(cat => (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              className={styles.categoryCard}
            >
              <span className={styles.categoryIcon}>{cat.icon}</span>
              <span className={styles.categoryName}>{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products by Category */}
      {categories.slice(0, 5).map(cat => {
        const products = featuredProducts[cat.id]
        if (!products || products.length === 0) return null

        return (
          <section key={cat.id} className={`container ${styles.section}`}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                {cat.icon} {cat.name}
              </h2>
              <Link href={`/category/${cat.id}`} className={styles.viewAll}>
                See All <ChevronRight size={16} />
              </Link>
            </div>
            <div className={styles.productGrid}>
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )
      })}

      {/* App Promo */}
      <section className={styles.promo}>
        <div className={`container ${styles.promoInner}`}>
          <h2 className={styles.promoTitle}>Your daily essentials, one click away</h2>
          <p className={styles.promoSub}>
            GoToMart brings 170+ products across 13 categories right to your doorstep.
            Fresh, fast, and affordable.
          </p>
          <Link href="/categories" className={styles.promoCta}>
            Explore All Categories <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
