import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import type { Opportunity } from '@/types'
import { OpportunityCard } from '@/components/OpportunityCard'
import { LoadingState } from '@/components/LoadingState'
import { EmptyState } from '@/components/EmptyState'
import { User, Bookmark } from 'lucide-react'

export function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const [savedOpportunities, setSavedOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
      return
    }

    if (user) {
      fetchSavedOpportunities()
    }
  }, [user, authLoading, navigate])

  const fetchSavedOpportunities = async () => {
    if (!user) return

    setLoading(true)
    const { data } = await supabase
      .from('saved_opportunities')
      .select(`
        opportunity_id,
        opportunities:opportunity_id (
          *,
          organization:organizations(*),
          opportunity_categories(
            category:categories(*)
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) {
      const opportunities = data
        .map((item: any) => item.opportunities)
        .filter((opp: any) => opp !== null) as Opportunity[]
      setSavedOpportunities(opportunities)
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (authLoading || !user) {
    return <LoadingState count={1} />
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <div className="sec">
        <div className="wrap-lg">
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px', alignItems: 'start' }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--terra)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User style={{ width: '24px', height: '24px', stroke: 'white', strokeWidth: 2 }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '2px' }}>
                    Your Profile
                  </h2>
                  <p style={{ fontSize: '12px', color: 'var(--text4)', wordBreak: 'break-all' }}>
                    {user.email}
                  </p>
                </div>
              </div>
              <button className="btn btn-outline" onClick={handleSignOut} style={{ width: '100%' }}>
                Log out
              </button>
            </div>

            <div>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Bookmark style={{ width: '20px', height: '20px', stroke: 'var(--text3)', strokeWidth: 2 }} />
                  <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-.4px' }}>
                    Saved Opportunities
                  </h1>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text3)' }}>
                  {savedOpportunities.length} {savedOpportunities.length === 1 ? 'opportunity' : 'opportunities'} saved
                </p>
              </div>

              {loading ? (
                <LoadingState count={3} />
              ) : savedOpportunities.length === 0 ? (
                <EmptyState
                  title="No saved opportunities yet"
                  description="Start saving opportunities to keep track of what interests you"
                  icon="empty"
                  action={{
                    label: 'Browse Opportunities',
                    onClick: () => navigate('/')
                  }}
                />
              ) : (
                <div className="cards-grid">
                  {savedOpportunities.map((opportunity) => (
                    <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
