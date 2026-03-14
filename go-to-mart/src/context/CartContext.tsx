'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { Product, CartItem } from '@/lib/types'

interface CartState {
    items: CartItem[]
    total: number
    itemCount: number
}

type CartAction =
    | { type: 'ADD_ITEM'; product: Product }
    | { type: 'REMOVE_ITEM'; productId: string }
    | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
    | { type: 'CLEAR_CART' }
    | { type: 'LOAD_CART'; items: CartItem[] }

function calculateTotals(items: CartItem[]) {
    return {
        total: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    }
}

function cartReducer(state: CartState, action: CartAction): CartState {
    let newItems: CartItem[]

    switch (action.type) {
        case 'ADD_ITEM': {
            const existing = state.items.find(item => item.product.id === action.product.id)
            if (existing) {
                newItems = state.items.map(item =>
                    item.product.id === action.product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            } else {
                newItems = [...state.items, { product: action.product, quantity: 1 }]
            }
            return { items: newItems, ...calculateTotals(newItems) }
        }
        case 'REMOVE_ITEM':
            newItems = state.items.filter(item => item.product.id !== action.productId)
            return { items: newItems, ...calculateTotals(newItems) }
        case 'UPDATE_QUANTITY':
            if (action.quantity <= 0) {
                newItems = state.items.filter(item => item.product.id !== action.productId)
            } else {
                newItems = state.items.map(item =>
                    item.product.id === action.productId
                        ? { ...item, quantity: action.quantity }
                        : item
                )
            }
            return { items: newItems, ...calculateTotals(newItems) }
        case 'CLEAR_CART':
            return { items: [], total: 0, itemCount: 0 }
        case 'LOAD_CART':
            return { items: action.items, ...calculateTotals(action.items) }
        default:
            return state
    }
}

interface CartContextType extends CartState {
    addItem: (product: Product) => void
    removeItem: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void
    getItemQuantity: (productId: string) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0, itemCount: 0 })

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('go-to-mart-cart')
            if (saved) {
                const items = JSON.parse(saved) as CartItem[]
                dispatch({ type: 'LOAD_CART', items })
            }
        } catch { }
    }, [])

    // Persist cart to localStorage on change
    useEffect(() => {
        localStorage.setItem('go-to-mart-cart', JSON.stringify(state.items))
    }, [state.items])

    const addItem = (product: Product) => dispatch({ type: 'ADD_ITEM', product })
    const removeItem = (productId: string) => dispatch({ type: 'REMOVE_ITEM', productId })
    const updateQuantity = (productId: string, quantity: number) =>
        dispatch({ type: 'UPDATE_QUANTITY', productId, quantity })
    const clearCart = () => dispatch({ type: 'CLEAR_CART' })
    const getItemQuantity = (productId: string) =>
        state.items.find(item => item.product.id === productId)?.quantity || 0

    return (
        <CartContext.Provider value={{ ...state, addItem, removeItem, updateQuantity, clearCart, getItemQuantity }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) throw new Error('useCart must be used within CartProvider')
    return context
}
