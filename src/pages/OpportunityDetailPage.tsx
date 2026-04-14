import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Opportunity } from '@/types'
import { MapPin, Share2, Bookmark, Bell } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { LoadingState } from '@/components/LoadingState'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { useAuth } from '@/contexts/AuthContext'
import { useBookmarks } from '@/hooks/useBookmarks'
import { toast } from 'sonner'

export function OpportunityDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchOpportunity() {
      if (!slug) return

      try {
        setIsLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('opportunities')
          .select(`
            *,
            organization:organizations(*),
            opportunity_categories(
              category:categories(*)
            )
          `)
          .eq('slug', slug)
          .maybeSingle()

        if (fetchError) throw fetchError

        if (data) {
          setOpportunity(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch opportunity'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchOpportunity()
  }, [slug])

  if (isLoading) {
    return <LoadingState type="detail" />
  }

  if (error) {
    return <ErrorState message={error.message} />
  }

  if (!opportunity) {
    return (
      <EmptyState
        title="Opportunity not found"
        description="The opportunity you're looking for doesn't exist."
        icon="empty"
        action={{
          label: 'Go to Homepage',
          onClick: () => window.location.href = '/'
        }}
      />
    )
  }

  const deadlineDate = new Date(opportunity.deadline)
  const daysUntilDeadline = differenceInDays(deadlineDate, new Date())

  const handleBookmark = async () => {
    if (!user) {
      toast.error('Please log in to save opportunities')
      navigate('/login')
      return
    }
    const { error } = await toggleBookmark(opportunity.id)
    if (error) {
      toast.error('Failed to save opportunity')
    } else {
      toast.success(isBookmarked(opportunity.id) ? 'Removed from saved' : 'Saved!')
    }
  }

  const primaryCategory = opportunity.opportunity_categories?.[0]?.category

  return (
    <div>
      <div className="breadcrumb">
        <div className="breadcrumb-inner">
          <Link to="/" className="bc-link">Home</Link>
          <span className="bc-sep">›</span>
          {primaryCategory && (
            <>
              <Link to={`/category/${primaryCategory.slug}`} className="bc-link">{primaryCategory.name}</Link>
              <span className="bc-sep">›</span>
            </>
          )}
          <span className="bc-current">{opportunity.title}</span>
        </div>
      </div>

      <section className="opp-hero">
        <div className="opp-hero-inner">
          <div className="opp-hero-top">
            <div className="opp-tags">
              <span className="tag tf">🎓 Fellowship</span>
              <span className="tag ts">Leadership</span>
              {daysUntilDeadline <= 7 && daysUntilDeadline >= 0 && (
                <span className="tag" style={{ backgroundColor: 'var(--red-bg)', color: 'var(--red)' }}>
                  Closing Soon
                </span>
              )}
            </div>
            <div className="opp-actions">
              <button className="save-btn" onClick={handleBookmark}>
                <Bookmark className={isBookmarked(opportunity.id) ? 'fill-current' : ''} />
              </button>
              <button className="save-btn" onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                toast.success('Link copied to clipboard')
              }}>
                <Share2 />
              </button>
            </div>
          </div>

          <div className="opp-org-row">
            <div className="org-logo">
              {opportunity.organization?.logo_emoji || '🌍'}
            </div>
            <div>
              <div className="org-name">
                {opportunity.organization?.name || 'Organization TBD'}
              </div>
              <div className="org-country">
                <MapPin style={{ width: '12px', height: '12px', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                {opportunity.location === 'Online' ? '🌐 Online / Virtual' : opportunity.location}
              </div>
            </div>
          </div>

          <h1 className="opp-title">{opportunity.title}</h1>

          <div className="opp-stats-strip">
            <div className="stat-pill">
              <div className="stat-label">Deadline</div>
              <div className={`stat-value ${daysUntilDeadline <= 7 ? 'red' : ''}`}>
                {format(deadlineDate, 'MMM d, yyyy')}
              </div>
            </div>
            <div className="stat-pill">
              <div className="stat-label">Funding</div>
              <div className="stat-value green">✓ Fully Funded</div>
            </div>
            <div className="stat-pill">
              <div className="stat-label">Duration</div>
              <div className="stat-value">{opportunity.duration || 'TBD'}</div>
            </div>
            <div className="stat-pill">
              <div className="stat-label">Eligibility</div>
              <div className="stat-value">{opportunity.region}</div>
            </div>
            <div className="stat-pill">
              <div className="stat-label">Career Stage</div>
              <div className="stat-value">{opportunity.career_stage || 'All levels'}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="opp-body">
        <div className="opp-left">
          <div className="content-card">
            <h2 className="section-title">About this Program</h2>
            <div className="prose">
              <p>{opportunity.full_description || opportunity.description}</p>
              <p>
                The program brings together a cohort of exceptional individuals dedicated to civic life and community service. Fellows are selected based on their demonstrated commitment to service and their potential to inspire and lead others.
              </p>
              <p>
                Through a combination of in-person gatherings, virtual programming, and individualized coaching, Fellows will strengthen core leadership skills, develop strategies for their work, and connect with a global community of changemakers.
              </p>
            </div>
          </div>

          {(opportunity.benefits) && (
            <div className="content-card">
              <h2 className="section-title">What You Get</h2>
              <div className="prose">
                <p style={{ whiteSpace: 'pre-wrap' }}>
                  {typeof opportunity.benefits === 'string' 
                    ? opportunity.benefits 
                    : (opportunity.benefits?.what_you_get || 'Funding and resources as specified by the provider.')}
                </p>
              </div>
            </div>
          )}

          {(opportunity.eligibility?.how_to_apply) && (
            <div className="content-card">
              <h2 className="section-title">How to Apply</h2>
              <div className="prose">
                <p style={{ whiteSpace: 'pre-wrap' }}>{opportunity.eligibility.how_to_apply}</p>
              </div>
            </div>
          )}
        </div>

        <div className="opp-right">
          <div className="apply-card">
            <div className="apply-countdown">Deadline in</div>
            <div className="apply-days">
              {daysUntilDeadline} <span>days</span>
            </div>
            <div className="apply-deadline">{format(deadlineDate, 'MMMM d, yyyy')}</div>
            <a href={opportunity.application_url} target="_blank" rel="noopener noreferrer">
              <button className="apply-main">
                Apply on Official Site →
              </button>
            </a>
            <button className="apply-btn">
              <Bell style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
              Set Deadline Reminder
            </button>
            <div className="apply-note">Opens in official portal</div>
          </div>

          <div className="sidebar-card">
            <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '14px' }}>Quick Info</h3>
            <div className="quick-info">
              <div className="qi-row">
                <div className="qi-label">Funding</div>
                <div className="qi-value green">✓ Fully Funded</div>
              </div>
              <div className="qi-row">
                <div className="qi-label">Duration</div>
                <div className="qi-value">{opportunity.duration}</div>
              </div>
              <div className="qi-row">
                <div className="qi-label">Location</div>
                <div className="qi-value">{opportunity.location}</div>
              </div>
              <div className="qi-row">
                <div className="qi-label">Region</div>
                <div className="qi-value">{opportunity.region}</div>
              </div>
            </div>
          </div>

          <div className="sidebar-card">
            <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '14px' }}>Save & Share</h3>
            <div className="action-row">
              <button className="action-btn" onClick={handleBookmark}>
                <Bookmark className={isBookmarked(opportunity.id) ? 'fill-current' : ''} />
                {isBookmarked(opportunity.id) ? 'Saved' : 'Save'}
              </button>
              <button className="action-btn" onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                toast.success('Link copied to clipboard')
              }}>
                <Share2 />
                Share
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
