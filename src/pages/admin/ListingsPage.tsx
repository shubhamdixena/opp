import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Opportunity } from '@/types'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function ListingsPage() {
  const navigate = useNavigate()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    if (!localStorage.getItem('admin-logged-in')) {
      navigate('/admin/login')
      return
    }

    async function fetchData() {
      try {
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

        if (error) throw error

        if (data) {
          setOpportunities(data)
        }
      } catch (err) {
        console.error('Failed to fetch opportunities:', err)
      }
    }

    fetchData()
  }, [navigate])

  const filteredOpportunities = opportunities.filter((opp) =>
    opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (opp.organization?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    opp.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', deleteId)

      if (error) throw error

      setOpportunities(opportunities.filter(opp => opp.id !== deleteId))
      toast.success('Opportunity deleted successfully')
      setDeleteId(null)
    } catch (error: any) {
      console.error('Error deleting opportunity:', error)
      toast.error('Failed to delete opportunity')
    }
  }

  return (
    <div>
      <div className="page-head">
        <div className="page-head-left">
          <div className="page-eyebrow">Manage Content</div>
          <div className="page-title">All Listings</div>
          <div className="page-sub">{opportunities.length} total listings</div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/admin/bulk-upload">
            <button className="btn btn-ghost">
              <svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Bulk Upload
            </button>
          </Link>
          <Link to="/admin/add">
            <button className="btn btn-primary">
              <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Listing
            </button>
          </Link>
        </div>
      </div>

      <div className="card card-sm" style={{ marginBottom: '16px' }}>
        <div className="filter-bar">
          <div className="fsearch">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              type="text"
              placeholder="Search by title, org, country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select className="fsel">
            <option>All Categories</option>
            <option>Fellowship</option>
            <option>Scholarship</option>
            <option>Conference</option>
            <option>Internship</option>
            <option>Award</option>
          </select>
          <select className="fsel">
            <option>All Regions</option>
            <option>Global</option>
            <option>South Asia</option>
            <option>Africa</option>
            <option>Europe</option>
            <option>Asia-Pacific</option>
          </select>
          <select className="fsel">
            <option>Sort: Deadline</option>
            <option>Sort: Newest</option>
            <option>Sort: A–Z</option>
          </select>
          <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '7px 12px' }} onClick={() => setSearchQuery('')}>Reset</button>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-head">
          <div className="table-title">Results <span style={{ fontSize: '12px', color: 'var(--text4)', fontWeight: 400, marginLeft: '4px' }}>showing {filteredOpportunities.length} of {opportunities.length}</span></div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Title & Organisation</th>
              <th>Region</th>
              <th>Deadline</th>
              <th>Funding</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOpportunities.map((opp) => (
              <tr key={opp.id}>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text)', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {opp.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text4)' }}>
                    {opp.organization?.name || 'N/A'}
                  </div>
                </td>
                <td style={{ fontSize: '12px', color: 'var(--text3)' }}>{opp.region}</td>
                <td>
                  <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
                    {format(new Date(opp.deadline), 'MMM d, yyyy')}
                  </span>
                </td>
                <td>
                  <span className={`fpill ${
                    opp.funding_type === 'fully_funded' ? 'fp-full' :
                    opp.funding_type === 'partially_funded' ? 'fp-partial' : 'fp-self'
                  }`}>
                    {opp.funding_type === 'fully_funded' ? 'Fully Funded' :
                     opp.funding_type === 'partially_funded' ? 'Partial' : 'Self-funded'}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <Link to={`/opportunity/${opp.slug}`} target="_blank">
                      <button className="row-btn" title="View">
                        <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </button>
                    </Link>
                    <Link to={`/admin/edit/${opp.id}`}>
                      <button className="row-btn edit" title="Edit">
                        <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      </button>
                    </Link>
                    <button className="row-btn delete" title="Delete" onClick={() => setDeleteId(opp.id)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Opportunity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this opportunity? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
