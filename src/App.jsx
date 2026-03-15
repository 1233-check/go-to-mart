import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

// Customer App Pages
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import CategoriesPage from './pages/CategoriesPage'
import SearchPage from './pages/SearchPage'
import CartPage from './pages/CartPage'
import ProfilePage from './pages/ProfilePage'
import OrdersPage from './pages/OrdersPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import LoginPage from './pages/LoginPage'
import SplashScreen from './pages/SplashScreen'

// Admin App Pages
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrders from './pages/admin/AdminOrders'
import AdminProducts from './pages/admin/AdminProducts'
import AdminUsers from './pages/admin/AdminUsers'

// Store App Pages
import StoreLayout from './pages/store/StoreLayout'
import StoreOrders from './pages/store/StoreOrders'
import StoreInventory from './pages/store/StoreInventory'

// Delivery App Pages
import DeliveryLayout from './pages/delivery/DeliveryLayout'
import DeliveryOrders from './pages/delivery/DeliveryOrders'
import DeliveryHistory from './pages/delivery/DeliveryHistory'

// Components
import BottomNav from './components/BottomNav'
import FloatingCart from './components/FloatingCart'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="loader"><div className="spinner" /></div>
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return children
}

function AppRoutes() {
  const [showSplash, setShowSplash] = useState(true)
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isStoreRoute = location.pathname.startsWith('/store')
  const isDeliveryRoute = location.pathname.startsWith('/delivery')
  
  const showCustomerNav = !isAdminRoute && !isStoreRoute && !isDeliveryRoute

  useEffect(() => {
    // Initialize Theme
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [])

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  return (
    <div className={(isAdminRoute || isStoreRoute || isDeliveryRoute) ? '' : "app-shell"}>
      <Routes>
        {/* Public customer routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected customer routes */}
        <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/order-success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />

        {/* Admin routes (Protected inside AdminLayout) */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* Store routes (Protected inside StoreLayout) */}
        <Route path="/store" element={<ProtectedRoute><StoreLayout /></ProtectedRoute>}>
          <Route index element={<StoreOrders />} />
          <Route path="inventory" element={<StoreInventory />} />
        </Route>

        {/* Delivery routes (Protected inside DeliveryLayout) */}
        <Route path="/delivery" element={<ProtectedRoute><DeliveryLayout /></ProtectedRoute>}>
          <Route index element={<DeliveryOrders />} />
          <Route path="history" element={<DeliveryHistory />} />
        </Route>
      </Routes>
      
      {showCustomerNav && (
        <>
          <FloatingCart />
          <BottomNav />
        </>
      )}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
