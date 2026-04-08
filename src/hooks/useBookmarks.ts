import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useBookmarks() {
  const { user } = useAuth()
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setBookmarkedIds(new Set())
      setLoading(false)
      return
    }

    async function fetchBookmarks() {
      if (!user?.id) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('saved_opportunities')
        .select('opportunity_id')
        .eq('user_id', user.id)

      if (data) {
        setBookmarkedIds(new Set(data.map(item => item.opportunity_id)))
      }
      setLoading(false)
    }

    fetchBookmarks()
  }, [user])

  const toggleBookmark = async (opportunityId: string) => {
    if (!user) {
      return { error: 'Must be logged in to save opportunities' }
    }

    const isBookmarked = bookmarkedIds.has(opportunityId)

    if (isBookmarked) {
      const { error } = await supabase
        .from('saved_opportunities')
        .delete()
        .eq('user_id', user.id)
        .eq('opportunity_id', opportunityId)

      if (!error) {
        setBookmarkedIds(prev => {
          const next = new Set(prev)
          next.delete(opportunityId)
          return next
        })
      }
      return { error }
    } else {
      const { error } = await supabase
        .from('saved_opportunities')
        .insert({ user_id: user.id, opportunity_id: opportunityId })

      if (!error) {
        setBookmarkedIds(prev => new Set(prev).add(opportunityId))
      }
      return { error }
    }
  }

  const isBookmarked = (opportunityId: string) => bookmarkedIds.has(opportunityId)

  return { bookmarkedIds, loading, toggleBookmark, isBookmarked }
}
