import { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState({}) // { productId: { product, qty } }

  const addItem = useCallback((product) => {
    setItems(prev => {
      const existing = prev[product.id]
      return {
        ...prev,
        [product.id]: {
          product,
          qty: existing ? existing.qty + 1 : 1
        }
      }
    })
  }, [])

  const removeItem = useCallback((productId) => {
    setItems(prev => {
      const existing = prev[productId]
      if (!existing) return prev
      if (existing.qty <= 1) {
        const next = { ...prev }
        delete next[productId]
        return next
      }
      return { ...prev, [productId]: { ...existing, qty: existing.qty - 1 } }
    })
  }, [])

  const clearCart = useCallback(() => setItems({}), [])

  const getQty = useCallback((productId) => items[productId]?.qty || 0, [items])

  const totalItems = Object.values(items).reduce((s, i) => s + i.qty, 0)
  const totalPrice = Object.values(items).reduce((s, i) => s + (Number(i.product.price) * i.qty), 0)
  const totalMrp = Object.values(items).reduce((s, i) => s + (Number(i.product.mrp || i.product.price) * i.qty), 0)
  const cartItems = Object.values(items)

  return (
    <CartContext.Provider value={{ items, cartItems, addItem, removeItem, clearCart, getQty, totalItems, totalPrice, totalMrp }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
