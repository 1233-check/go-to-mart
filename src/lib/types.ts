export interface Category {
    id: string
    name: string
    icon: string
    image_url: string | null
    sort_order: number
    is_active: boolean
    created_at: string
}

export interface Product {
    id: string
    name: string
    description: string
    price: number
    mrp: number | null
    unit: string
    image_url: string | null
    category_id: string
    stock_quantity: number
    is_active: boolean
    created_at: string
    updated_at: string
    category?: Category
}

export interface CartItem {
    product: Product
    quantity: number
}

export interface Profile {
    id: string
    full_name: string
    phone: string | null
    email: string | null
    role: 'customer' | 'admin' | 'store_staff' | 'delivery_partner'
    is_active: boolean
    avatar_url: string | null
    created_at: string
    updated_at: string
}

export interface Address {
    id: string
    user_id: string
    label: string
    full_address: string
    landmark: string | null
    latitude: number | null
    longitude: number | null
    is_default: boolean
    created_at: string
}

export type OrderStatus = 'placed' | 'confirmed' | 'packing' | 'packed' | 'assigned' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Order {
    id: string
    order_number: string
    customer_id: string
    delivery_address: string
    delivery_latitude: number | null
    delivery_longitude: number | null
    delivery_landmark: string | null
    status: OrderStatus
    subtotal: number
    delivery_fee: number
    discount: number
    total: number
    payment_method: string
    payment_status: PaymentStatus
    razorpay_order_id: string | null
    razorpay_payment_id: string | null
    delivery_partner_id: string | null
    customer_name: string | null
    customer_phone: string | null
    notes: string | null
    estimated_delivery: string
    created_at: string
    updated_at: string
}

export interface OrderItem {
    id: string
    order_id: string
    product_id: string
    product_name: string
    product_price: number
    product_image: string | null
    quantity: number
    total: number
}
