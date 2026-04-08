import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Opportunity } from '@/types'

interface UseOpportunitiesOptions {
  categorySlug?: string
  includeExpired?: boolean
  featured?: boolean
  limit?: number
}

interface UseOpportunitiesResult {
  opportunities: Opportunity[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useOpportunities(options: UseOpportunitiesOptions = {}): UseOpportunitiesResult {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refetchKey, setRefetchKey] = useState(0)

  const { categorySlug, includeExpired = false, featured, limit } = options

  useEffect(() => {
    async function fetchOpportunities() {
      try {
        setIsLoading(true)
        setError(null)

        let query = supabase
          .from('opportunities')
          .select(`
            *,
            organization:organizations(*),
            opportunity_categories(
              category:categories(*)
            )
          `)

        if (!includeExpired) {
          const today = new Date().toISOString().split('T')[0]
          query = query.gte('deadline', today)
        }

        if (featured !== undefined) {
          query = query.eq('is_featured', featured)
        }

        if (categorySlug) {
          query = query.eq('opportunity_categories.category.slug', categorySlug)
        }

        query = query.order('deadline', { ascending: true })

        if (limit) {
          query = query.limit(limit)
        }

        const { data, error: fetchError } = await query

        if (fetchError) throw fetchError

        setOpportunities(data || [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch opportunities'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchOpportunities()
  }, [categorySlug, includeExpired, featured, limit, refetchKey])

  const refetch = () => setRefetchKey(prev => prev + 1)

  return { opportunities, isLoading, error, refetch }
}
