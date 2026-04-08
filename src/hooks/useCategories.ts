import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Category } from '@/types'

interface UseCategoriesResult {
  categories: Category[]
  isLoading: boolean
  error: Error | null
  getCategoryBySlug: (slug: string) => Category | undefined
  refetch: () => void
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refetchKey, setRefetchKey] = useState(0)

  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('categories')
          .select('*')
          .order('name')

        if (fetchError) throw fetchError

        setCategories(data || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch categories'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [refetchKey])

  const getCategoryBySlug = (slug: string) => {
    return categories.find(cat => cat.slug === slug)
  }

  const refetch = () => setRefetchKey(prev => prev + 1)

  return { categories, isLoading, error, getCategoryBySlug, refetch }
}
