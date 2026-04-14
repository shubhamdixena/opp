import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Opportunity } from '@/types'

export function DashboardPage() {
  const navigate = useNavigate()
  const [recentOpportunities, setRecentOpportunities] = useState<Opportunity[]>([])
  const [stats, setStats] = useState({
    activeListings: 0,
    registeredUsers: 0,
    savedListings: 0,
    expiringThisWeek: 0,
    liveCount: 0,
    draftCount: 0,
    expiringSoonCount: 0,
    archivedCount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!localStorage.getItem('admin-logged-in')) {
      navigate('/admin/login')
      return
    }

    async function fetchData() {
      try {
        setLoading(true)
        const sevenDaysFromNow = new Date()
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
        const sevenDaysDate = sevenDaysFromNow.toISOString().split('T')[0]

        const [
          opportunitiesRes,
          savedRes,
          draftRes
        ] = await Promise.all([
          supabase
            .from('opportunities')
            .select('id, deadline, is_draft', { count: 'exact' })
            .eq('is_draft', false),
          supabase
            .from('saved_opportunities')
            .select('id', { count: 'exact', head: true }),
          supabase
            .from('opportunities')
            .select('id', { count: 'exact' })
            .eq('is_draft', true)
        ])
        
        const archivedRes = { count: 0 } as any

        const activeListings = opportunitiesRes.count || 0
        const expiringThisWeek = opportunitiesRes.data?.filter(opp =>
          opp.deadline <= sevenDaysDate
        ).length || 0

        const { data: usersCount } = await supabase.rpc('get_user_count')

        setStats({
          activeListings,
          registeredUsers: usersCount || 0,
          savedListings: savedRes.count || 0,
          expiringThisWeek,
          liveCount: activeListings,
          draftCount: draftRes.count || 0,
          expiringSoonCount: expiringThisWeek,
          archivedCount: archivedRes.count || 0
        })

        const { data, error } = await supabase
          .from('opportunities')
          .select(`
            *,
            organization:organizations(*),
            opportunity_categories(
              category:categories(*)
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5)

        if (error) throw error

        if (data) {
          setRecentOpportunities(data)
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  return (
    <div>
      <div className="page-head">
        <div className="page-head-left">
          <div className="page-eyebrow">Overview</div>
          <div className="page-title">Good morning, Admin 👋</div>
          <div className="page-sub">Here's what's happening with Opportunity For You today.</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline">
            <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Last 30 days
          </button>
          <Link to="/admin/add">
            <button className="btn btn-primary">
              <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Listing
            </button>
          </Link>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon" style={{ background: '#f5ede9' }}>
              <svg style={{ stroke: 'var(--terra)' }} viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
          </div>
          <div className="stat-num">{loading ? '-' : stats.activeListings.toLocaleString()}</div>
          <div className="stat-label">Active Listings</div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon" style={{ background: 'var(--green-bg)' }}>
              <svg style={{ stroke: 'var(--green)' }} viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
          </div>
          <div className="stat-num">{loading ? '-' : stats.registeredUsers.toLocaleString()}</div>
          <div className="stat-label">Registered Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon" style={{ background: 'var(--blue-bg)' }}>
              <svg style={{ stroke: 'var(--blue)' }} viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            </div>
          </div>
          <div className="stat-num">{loading ? '-' : stats.savedListings.toLocaleString()}</div>
          <div className="stat-label">Saved Listings</div>
        </div>
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon" style={{ background: 'var(--red-bg)' }}>
              <svg style={{ stroke: 'var(--red)' }} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
          </div>
          <div className="stat-num">{loading ? '-' : stats.expiringThisWeek}</div>
          <div className="stat-label">Expiring This Week</div>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-head">
          <div className="table-title">Recent Listings</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/admin/listings">
              <button className="btn btn-ghost" style={{ fontSize: '12px' }}>View all →</button>
            </Link>
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Title</th>
              <th>Organization</th>
              <th>Deadline</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentOpportunities.map((opp) => (
              <tr key={opp.id}>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {opp.title}
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '11px', color: 'var(--text4)' }}>
                    {opp.organization?.name || 'N/A'}
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
                    {new Date(opp.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </td>
                <td style={{ fontSize: '12px', color: 'var(--text3)' }}>{opp.location}</td>
                <td>
                  <div className="row-actions">
                    <Link to={`/admin/edit/${opp.id}`}>
                      <button className="row-btn edit" title="Edit">
                        <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      </button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)', marginBottom: '16px' }}>Listing Status Breakdown</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          <div style={{ textAlign: 'center', padding: '14px', background: 'var(--green-bg)', borderRadius: 'var(--r)', border: '1px solid var(--green-border)' }}>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--green)' }}>{loading ? '-' : stats.liveCount}</div>
            <div style={{ fontSize: '11px', color: 'var(--green)', fontWeight: '600', marginTop: '4px' }}>Live</div>
          </div>
          <div style={{ textAlign: 'center', padding: '14px', background: 'var(--blue-bg)', borderRadius: 'var(--r)', border: '1px solid var(--blue-border)' }}>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--blue)' }}>{loading ? '-' : stats.draftCount}</div>
            <div style={{ fontSize: '11px', color: 'var(--blue)', fontWeight: '600', marginTop: '4px' }}>Draft</div>
          </div>
          <div style={{ textAlign: 'center', padding: '14px', background: 'var(--red-bg)', borderRadius: 'var(--r)', border: '1px solid var(--red-border)' }}>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--red)' }}>{loading ? '-' : stats.expiringSoonCount}</div>
            <div style={{ fontSize: '11px', color: 'var(--red)', fontWeight: '600', marginTop: '4px' }}>Expiring Soon</div>
          </div>
          <div style={{ textAlign: 'center', padding: '14px', background: 'var(--bg2)', borderRadius: 'var(--r)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text4)' }}>{loading ? '-' : stats.archivedCount}</div>
            <div style={{ fontSize: '11px', color: 'var(--text4)', fontWeight: '600', marginTop: '4px' }}>Archived</div>
          </div>
        </div>
      </div>
    </div>
  )
}
