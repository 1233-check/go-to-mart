import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.inner}`}>
                <div className={styles.brand}>
                    <span className={styles.logo}>🛒 Go<span className={styles.highlight}>To</span>Mart</span>
                    <p className={styles.tagline}>
                        Fresh groceries delivered to your doorstep in minutes.
                    </p>
                </div>

                <div className={styles.links}>
                    <div className={styles.linkGroup}>
                        <h4>Shop</h4>
                        <Link href="/categories">All Categories</Link>
                        <Link href="/search?q=fruits">Fresh Fruits</Link>
                        <Link href="/search?q=vegetables">Vegetables</Link>
                        <Link href="/search?q=dairy">Dairy & Breakfast</Link>
                    </div>
                    <div className={styles.linkGroup}>
                        <h4>Help</h4>
                        <Link href="#">About Us</Link>
                        <Link href="#">Contact</Link>
                        <Link href="#">FAQs</Link>
                        <Link href="#">Delivery Areas</Link>
                    </div>
                </div>
            </div>

            <div className={styles.bottom}>
                <div className="container">
                    <p>© {new Date().getFullYear()} GoToMart. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
