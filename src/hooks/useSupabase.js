import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        setCategories(data || [])
        setLoading(false)
      })
  }, [])

  return { categories, loading }
}

export function useProducts(categoryId = null) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let query = supabase
      .from('products')
      .select('*, categories(name, icon)')
      .eq('is_active', true)
      .order('name')

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    query.then(({ data }) => {
      setProducts(data || [])
      setLoading(false)
    })
  }, [categoryId])

  return { products, loading }
}

export function useSearchProducts() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*, categories(name, icon)')
      .eq('is_active', true)
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(30)
    setResults(data || [])
    setLoading(false)
  }, [])

  return { results, loading, search }
}

export function useProductsByCategory() {
  const [grouped, setGrouped] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('products').select('*, categories(name, icon)').eq('is_active', true).order('name')
    ]).then(([catRes, prodRes]) => {
      const cats = catRes.data || []
      const prods = prodRes.data || []
      const map = {}
      cats.forEach(c => { map[c.id] = { ...c, products: [] } })
      prods.forEach(p => { if (map[p.category_id]) map[p.category_id].products.push(p) })
      setGrouped(map)
      setLoading(false)
    })
  }, [])

  return { grouped, loading }
}
